-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0056 Volunteer Team & Session Participants (Phase 2)
--
-- Authoritative Volunteer Model:
--   1. Fixes sessions_select RLS policy for session_participants & school_team_members (Task 15)
--   2. Auto-populates session_participants when session delivery plans are created (Task 14)
--   3. Double-booking detection RPC (Task 13)
--   4. Temporary session absence RPC (Task 12)
--   5. Certificate eligibility evaluation & idempotent issuance RPC (Tasks 21 & 22)
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─── 1. Fix Session RLS Policy for Volunteers (Task 15) ──────────────────────

DROP POLICY IF EXISTS sessions_select ON public.sessions;

CREATE POLICY sessions_select ON public.sessions FOR SELECT USING (
  (
    auth_role() IN ('super_admin','campus_mgmt_admin','outreach_lead','exec_lead','finance_lead','volunteer_lead')
    AND campus_id IS NOT DISTINCT FROM auth_campus()
  )
  OR EXISTS (
    SELECT 1 FROM session_participants sp
     WHERE sp.session_id = sessions.id AND sp.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM school_team_members stm
     WHERE stm.school_id = sessions.school_id AND stm.user_id = auth.uid()
       AND stm.status IN ('confirmed','available','requested')
  )
  -- Legacy fallback
  OR EXISTS (
    SELECT 1 FROM session_assignments sa
     WHERE sa.session_id = sessions.id AND sa.volunteer_id = auth.uid()
  )
);


-- ─── 2. Fix Session Participants RLS Policy ──────────────────────────────────

DROP POLICY IF EXISTS session_participants_select ON public.session_participants;

CREATE POLICY session_participants_select ON public.session_participants FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM schools s
     WHERE s.id = session_participants.school_id
       AND (
         (auth_role() IN ('super_admin','campus_mgmt_admin','outreach_lead','exec_lead','finance_lead','volunteer_lead')
          AND s.campus_id IS NOT DISTINCT FROM auth_campus())
         OR EXISTS (
           SELECT 1 FROM school_team_members stm
            WHERE stm.school_id = s.id AND stm.user_id = auth.uid()
         )
       )
  )
);


-- ─── 3. Double-booking Detection RPC (Task 13) ───────────────────────────────

CREATE OR REPLACE FUNCTION public.check_volunteer_double_booking(
  p_volunteer_ids uuid[],
  p_target_school_id uuid DEFAULT NULL
)
RETURNS TABLE (
  volunteer_id uuid,
  conflicting_school_id uuid,
  conflicting_school_name text,
  conflict_reason text
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT
    stm.user_id AS volunteer_id,
    s.id AS conflicting_school_id,
    s.name AS conflicting_school_name,
    ('Already confirmed on active team for ' || s.name) AS conflict_reason
  FROM school_team_members stm
  JOIN schools s ON s.id = stm.school_id
  WHERE stm.user_id = ANY(p_volunteer_ids)
    AND stm.status = 'confirmed'
    AND s.status = 'sessions_active'
    AND (p_target_school_id IS NULL OR stm.school_id <> p_target_school_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_volunteer_double_booking(uuid[], uuid) TO authenticated;


-- ─── 4. Auto-populate session_participants on Session Creation (Task 14) ─────

CREATE OR REPLACE FUNCTION public.create_session_delivery_plan(
  p_school_id      uuid,
  p_session_number integer,
  p_scheduled_at   timestamptz,
  p_topic          text DEFAULT NULL,
  p_meeting_point  text DEFAULT NULL,
  p_departure_time text DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_school      schools;
  v_session_id  uuid;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
  stm_rec       RECORD;
BEGIN
  SELECT * INTO v_school FROM schools WHERE id = p_school_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'School % not found', p_school_id; END IF;

  IF actor IS NOT NULL THEN
    SELECT role, campus_id INTO actor_role, actor_campus FROM public.users WHERE id = actor;
    IF NOT (
      actor_role IN ('super_admin')
      OR (actor_role IN ('exec_lead','campus_mgmt_admin','campus_lead')
          AND v_school.campus_id IS NOT DISTINCT FROM actor_campus)
    ) THEN
      RAISE EXCEPTION 'You do not have permission to plan sessions for this school' USING errcode = '42501';
    END IF;
  END IF;

  IF v_school.status <> 'sessions_active' THEN
    RAISE EXCEPTION 'School must be Active to schedule sessions' USING errcode = '23514';
  END IF;

  -- Create or update session
  SELECT id INTO v_session_id FROM sessions
   WHERE school_id = p_school_id AND session_number = p_session_number;

  IF v_session_id IS NULL THEN
    INSERT INTO sessions (
      school_id, campus_id, session_number, status, scheduled_at,
      topic, created_by
    ) VALUES (
      p_school_id, v_school.campus_id, p_session_number, 'planned', p_scheduled_at,
      coalesce(nullif(trim(p_topic),''), 'Session ' || p_session_number), actor
    ) RETURNING id INTO v_session_id;
  ELSE
    UPDATE sessions
       SET scheduled_at = p_scheduled_at,
           topic = coalesce(nullif(trim(p_topic),''), topic),
           status = 'planned'
     WHERE id = v_session_id;
  END IF;

  -- Auto-populate session_participants from confirmed school_team_members (Task 14)
  FOR stm_rec IN
    SELECT user_id FROM school_team_members
     WHERE school_id = p_school_id AND status = 'confirmed'
  LOOP
    INSERT INTO session_participants (session_id, school_id, user_id, status)
    VALUES (v_session_id, p_school_id, stm_rec.user_id, 'expected')
    ON CONFLICT (session_id, user_id) DO UPDATE SET status = EXCLUDED.status;
  END LOOP;

  -- Synchronize operational_phase to session_N_ready
  UPDATE schools
     SET operational_phase = ('session_' || p_session_number || '_ready')::operational_phase,
         updated_at = now()
   WHERE id = p_school_id;

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'session_delivery_planned', 'session', v_session_id,
          jsonb_build_object('school_id', p_school_id, 'session_number', p_session_number, 'scheduled_at', p_scheduled_at));

  RETURN v_session_id;
END;
$$;


-- ─── 5. Temporary Session Absence RPC (Task 12) ──────────────────────────────

CREATE OR REPLACE FUNCTION public.mark_temporary_session_absence(
  p_session_id uuid,
  p_user_id    uuid,
  p_status     text, -- 'absent' or 'excused'
  p_notes      text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_session  sessions;
  actor      uuid := auth.uid();
BEGIN
  SELECT * INTO v_session FROM sessions WHERE id = p_session_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Session % not found', p_session_id; END IF;

  IF p_status NOT IN ('absent', 'excused', 'expected', 'present') THEN
    RAISE EXCEPTION 'Invalid participant status %', p_status USING errcode = '22023';
  END IF;

  INSERT INTO session_participants (session_id, school_id, user_id, status, notes)
  VALUES (p_session_id, v_session.school_id, p_user_id, p_status, p_notes)
  ON CONFLICT (session_id, user_id) DO UPDATE
     SET status = EXCLUDED.status, notes = EXCLUDED.notes;

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'session_participant_absence_marked', 'session', p_session_id,
          jsonb_build_object('user_id', p_user_id, 'status', p_status, 'notes', p_notes));
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_temporary_session_absence(uuid, uuid, text, text) TO authenticated;


-- ─── 6. Certificate Eligibility & Idempotent Issuance RPC (Tasks 21 & 22) ────

CREATE OR REPLACE FUNCTION public.evaluate_and_issue_school_certificates(p_school_id uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_school           schools;
  stm_rec            RECORD;
  v_attended_count   integer;
  v_issued_count     integer := 0;
  actor              uuid := auth.uid();
  v_cert_id          uuid;
  v_cert_no          text;
BEGIN
  SELECT * INTO v_school FROM schools WHERE id = p_school_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'School % not found', p_school_id; END IF;

  IF v_school.status <> 'completed' THEN
    RAISE EXCEPTION 'Certificates can only be issued when school status is Completed' USING errcode = '23514';
  END IF;

  -- Evaluate each confirmed school team member
  FOR stm_rec IN
    SELECT stm.user_id, u.full_name, u.email
      FROM school_team_members stm
      JOIN users u ON u.id = stm.user_id
     WHERE stm.school_id = p_school_id AND stm.status = 'confirmed'
  LOOP
    -- Count attended sessions (present or expected in verified sessions)
    SELECT count(DISTINCT sp.session_id) INTO v_attended_count
      FROM session_participants sp
      JOIN sessions s ON s.id = sp.session_id
     WHERE sp.school_id = p_school_id
       AND sp.user_id = stm_rec.user_id
       AND sp.status IN ('present', 'expected')
       AND s.status IN ('verified', 'campus_approved', 'reported');

    -- Minimum participation threshold: >= 3 out of 4 sessions
    IF v_attended_count >= 3 THEN
      -- Idempotent check: check if certificate already issued for this user & school
      IF NOT EXISTS (
        SELECT 1 FROM certificates
         WHERE user_id = stm_rec.user_id AND school_id = p_school_id
      ) THEN
        v_cert_no := 'TAFI-CERT-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));

        INSERT INTO certificates (
          user_id, school_id, certificate_number, issued_at, title
        ) VALUES (
          stm_rec.user_id, p_school_id, v_cert_no, now(),
          'School Teaching Fellowship Certificate — ' || v_school.name
        ) RETURNING id INTO v_cert_id;

        v_issued_count := v_issued_count + 1;

        -- Notify volunteer
        PERFORM notify_user(
          stm_rec.user_id,
          'certificate_issued',
          'Certificate Unlocked! 🎓',
          'Congratulations! You have completed the teaching fellowship at ' || v_school.name || '. Your certificate is ready.',
          '/dashboard/certificates',
          'certificate',
          v_cert_id
        );

        INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
        VALUES (actor, 'certificate_issued_auto', 'certificate', v_cert_id,
                jsonb_build_object('user_id', stm_rec.user_id, 'school_id', p_school_id, 'certificate_number', v_cert_no));
      END IF;
    END IF;
  END LOOP;

  RETURN v_issued_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.evaluate_and_issue_school_certificates(uuid) TO authenticated;


-- ─── 7. Auto-trigger Certificates on School Auto-Completion ──────────────────

CREATE OR REPLACE FUNCTION public.trg_check_school_completion_fn()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_verified_count int;
BEGIN
  IF NEW.status = 'verified' AND OLD.status <> 'verified' THEN
    SELECT count(*) INTO v_verified_count
      FROM sessions
     WHERE school_id = NEW.school_id AND status = 'verified';

    IF v_verified_count >= 4 THEN
      UPDATE schools
         SET status = 'completed',
             operational_phase = NULL,
             updated_at = now()
       WHERE id = NEW.school_id;

      INSERT INTO school_status_history (school_id, previous_status, new_status, changed_by, note)
      VALUES (NEW.school_id, 'sessions_active', 'completed', auth.uid(),
              'All 4 sessions verified — school program completed');

      INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
      VALUES (auth.uid(), 'school_completed_auto', 'school', NEW.school_id,
              jsonb_build_object('verified_sessions', v_verified_count));

      -- Issue certificates automatically (Tasks 21 & 22)
      PERFORM evaluate_and_issue_school_certificates(NEW.school_id);
    ELSE
      -- Move operational_phase to next session planning
      UPDATE schools
         SET operational_phase = ('session_' || (NEW.session_number + 1) || '_planning')::operational_phase,
             updated_at = now()
       WHERE id = NEW.school_id AND status = 'sessions_active';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

COMMIT;
