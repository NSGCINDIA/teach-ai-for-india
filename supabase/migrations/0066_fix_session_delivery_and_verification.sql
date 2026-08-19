-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0066 Session Delivery & Verification Repair
--
-- Fixes the Step 5 → Step 6 leg of the school journey (schedule session →
-- submit delivery report + evidence → campus verification):
--
--   1. enforce_session_transition() compared an ENUM column with LIKE
--      (`file_type LIKE '%photo%'`), which Postgres rejects with
--      "operator does not exist: media_file_type ~~ unknown". Every attempt to
--      submit a delivery report failed on this. Replaced with an explicit
--      enum-value list (no cast, no LIKE).
--   2. The same trigger left schools.operational_phase at
--      `session_N_report_required` after a report was filed and never advanced
--      it on campus approval / verification. Now syncs
--      submitted → verified alongside the session status.
--   3. session_participants was missing from the database (0054/0056 never
--      fully applied), so "Select Participating Volunteers" silently did
--      nothing. Recreated idempotently with RLS.
--   4. sessions RLS only let Super Admin / Campus Lead / Exec Lead write, while
--      the Session Hub is driven by the Outreach Lead. Outreach Lead (own
--      campus) added to the insert/update policies.
--   5. One-off cleanup: soft-deletes duplicate auto-generated Google Drive
--      evidence rows produced by the failed report submissions.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─── 1. session_participants — recreate if it went missing ──────────────────

CREATE TABLE IF NOT EXISTS public.session_participants (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id              uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  school_team_member_id   uuid NOT NULL REFERENCES public.school_team_members(id) ON DELETE CASCADE,
  volunteer_id            uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  participated            boolean NOT NULL DEFAULT false,
  notes                   text,
  marked_by               uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, volunteer_id)
);

COMMENT ON TABLE public.session_participants IS
  'Per-session volunteer participation — populated from school_team_members when a session is scheduled, flipped to participated=true by the delivery report.';

CREATE INDEX IF NOT EXISTS session_participants_session_idx ON public.session_participants (session_id);
CREATE INDEX IF NOT EXISTS session_participants_volunteer_idx ON public.session_participants (volunteer_id);

ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS session_participants_select ON public.session_participants;
CREATE POLICY session_participants_select ON public.session_participants FOR SELECT TO authenticated
  USING (
    is_admin()
    OR volunteer_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.sessions s
       WHERE s.id = session_participants.session_id
         AND s.campus_id = auth_campus()
         AND auth_role() IN ('campus_lead','exec_lead','outreach_lead','volunteer_lead','finance_lead','campus_mgmt_admin')
    )
  );

DROP POLICY IF EXISTS session_participants_manage ON public.session_participants;
CREATE POLICY session_participants_manage ON public.session_participants FOR ALL TO authenticated
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM public.sessions s
       WHERE s.id = session_participants.session_id
         AND s.campus_id = auth_campus()
         AND auth_role() IN ('campus_lead','exec_lead','outreach_lead')
    )
  )
  WITH CHECK (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM public.sessions s
       WHERE s.id = session_participants.session_id
         AND s.campus_id = auth_campus()
         AND auth_role() IN ('campus_lead','exec_lead','outreach_lead')
    )
  );

-- ─── 2. sessions RLS — the Outreach Lead runs the Session Hub ───────────────

DROP POLICY IF EXISTS sessions_insert ON public.sessions;
CREATE POLICY sessions_insert ON public.sessions FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT is_admin())
    OR (
      (SELECT auth_role()) = ANY (ARRAY['campus_lead','exec_lead','outreach_lead']::user_role[])
      AND campus_id = (SELECT auth_campus())
    )
  );

DROP POLICY IF EXISTS sessions_update ON public.sessions;
CREATE POLICY sessions_update ON public.sessions FOR UPDATE TO authenticated
  USING (
    (SELECT is_admin())
    OR (
      (SELECT auth_role()) = ANY (ARRAY['campus_lead','exec_lead','outreach_lead']::user_role[])
      AND campus_id = (SELECT auth_campus())
    )
    OR created_by = (SELECT auth.uid())
  )
  WITH CHECK (
    (SELECT is_admin())
    OR (
      (SELECT auth_role()) = ANY (ARRAY['campus_lead','exec_lead','outreach_lead']::user_role[])
      AND campus_id = (SELECT auth_campus())
    )
    OR created_by = (SELECT auth.uid())
  );

-- ─── 3. enforce_session_transition — enum-safe evidence gate + phase sync ───

CREATE OR REPLACE FUNCTION public.enforce_session_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor uuid := auth.uid();
  actor_role user_role;
  ok boolean;
  n_photos int;
  n_docs int;
  has_approved_exec_plan boolean;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  -- Legal edges
  ok := CASE OLD.status
    WHEN 'planned'         THEN NEW.status IN ('in_progress','cancelled')
    WHEN 'in_progress'     THEN NEW.status IN ('reported','cancelled')
    WHEN 'reported'        THEN NEW.status IN ('campus_approved','in_progress','cancelled')
    WHEN 'campus_approved' THEN NEW.status IN ('verified','reported','cancelled')
    WHEN 'verified'        THEN NEW.status IN ('cancelled')
    WHEN 'cancelled'       THEN false
    ELSE false
  END;
  IF NOT ok THEN
    RAISE EXCEPTION 'Illegal session transition % → %', OLD.status, NEW.status USING errcode = '42501';
  END IF;

  IF actor IS NOT NULL THEN
    SELECT role INTO actor_role FROM public.users WHERE id = actor;
  END IF;

  -- Execution plan gate: school-level plan, or the legacy per-session plan
  IF NEW.status = 'in_progress' AND OLD.status = 'planned' THEN
    SELECT (
      EXISTS (SELECT 1 FROM school_execution_plans WHERE school_id = NEW.school_id AND status = 'approved')
      OR EXISTS (SELECT 1 FROM execution_plans WHERE session_id = NEW.id AND status = 'approved')
    ) INTO has_approved_exec_plan;

    IF NOT has_approved_exec_plan THEN
      RAISE EXCEPTION 'Cannot start session: the school execution plan must be approved first'
        USING errcode = '23514';
    END IF;

    IF NEW.session_number IS NOT NULL THEN
      UPDATE schools
         SET operational_phase = ('session_' || NEW.session_number || '_in_progress')::operational_phase
       WHERE id = NEW.school_id AND status = 'sessions_active';
    END IF;
  END IF;

  -- Delivery report gate
  IF NEW.status = 'reported' THEN
    IF coalesce(NEW.student_count,0) <= 0
       OR coalesce(NEW.volunteer_count,0) <= 0
       OR coalesce(nullif(trim(NEW.topic),''), null) IS NULL THEN
      RAISE EXCEPTION 'Cannot report session: student count, volunteer count and topic are required'
        USING errcode = '23514';
    END IF;

    -- media_file_type is an enum: compare against enum values, never LIKE.
    SELECT count(*) FILTER (
             WHERE file_type IN ('photo','team_photo','principal_photo','student_group_photo')
           ),
           count(*) FILTER (WHERE file_type IN ('document','letter'))
      INTO n_photos, n_docs
      FROM media_assets
      WHERE session_id = NEW.id AND deleted_at IS NULL;

    IF n_photos < 1 OR n_docs < 1 THEN
      RAISE EXCEPTION 'Cannot report session: at least 1 photo and 1 attendance/report document are required'
        USING errcode = '23514';
    END IF;

    IF NEW.session_number IS NOT NULL THEN
      UPDATE schools
         SET operational_phase = ('session_' || NEW.session_number || '_submitted')::operational_phase
       WHERE id = NEW.school_id AND status = 'sessions_active';
    END IF;
  END IF;

  -- Campus approval keeps the school at "submitted" until it is fully verified
  IF NEW.status = 'campus_approved' AND NEW.session_number IS NOT NULL THEN
    UPDATE schools
       SET operational_phase = ('session_' || NEW.session_number || '_submitted')::operational_phase
     WHERE id = NEW.school_id AND status = 'sessions_active';
  END IF;

  -- Verification closes the session out
  IF NEW.status = 'verified' AND NEW.session_number IS NOT NULL THEN
    UPDATE schools
       SET operational_phase = ('session_' || NEW.session_number || '_verified')::operational_phase
     WHERE id = NEW.school_id AND status = 'sessions_active';
  END IF;

  -- Cancellation
  IF NEW.status = 'cancelled' THEN
    IF actor IS NOT NULL AND NOT (actor_role IN ('super_admin','campus_mgmt_admin','campus_lead')) THEN
      RAISE EXCEPTION 'Only Campus Lead or above may cancel a session' USING errcode = '42501';
    END IF;
    IF coalesce(nullif(trim(NEW.notes),''), null) IS NULL THEN
      RAISE EXCEPTION 'Cancellation requires a reason in notes' USING errcode = '23514';
    END IF;
  END IF;

  -- Stamp approver/verifier
  IF NEW.status = 'campus_approved' AND actor IS NOT NULL THEN
    NEW.reviewed_by := actor; NEW.reviewed_at := now();
  ELSIF NEW.status = 'verified' AND actor IS NOT NULL THEN
    NEW.verified_by := actor; NEW.verified_at := now();
  END IF;

  RETURN NEW;
END;
$$;

-- ─── 4. Clean up duplicate auto-generated evidence links ────────────────────
-- Every failed report submission re-inserted the same two Drive links. Keep the
-- most recent row per (session, file_type) and soft-delete the rest.

WITH ranked AS (
  SELECT id,
         row_number() OVER (PARTITION BY session_id, file_type ORDER BY created_at DESC) AS rn
    FROM media_assets
   WHERE session_id IS NOT NULL
     AND deleted_at IS NULL
     AND file_name IN ('Session Photo (Google Drive)', 'Attendance/Report Document (Google Drive)')
)
UPDATE media_assets m
   SET deleted_at = now()
  FROM ranked r
 WHERE m.id = r.id AND r.rn > 1;

COMMIT;
