-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0067 School Auto-Completion Repair
--
-- Symptom: a school with all 4 sessions verified stays on Step 5 (Active
-- School) with operational_phase = 'session_4_verified'. The Execution
-- Workflow card reads "Session 4 verified — School Program Complete!" at 100%,
-- but the pipeline never advances to Step 6 (Completed).
--
-- Cause: the only thing that promotes sessions_active → completed is the
-- AFTER UPDATE trigger trg_check_school_completion on sessions, created with a
-- plain CREATE TRIGGER in 0054. 0054 never fully applied on the deployed
-- database (same reason session_participants went missing — see 0066), so the
-- trigger is absent and nothing closes the school out. 0056 later redefined the
-- logic as trg_check_school_completion_fn() but never attached a trigger to it,
-- so that path is dead too.
--
-- This migration:
--   1. Extracts the completion logic into complete_school_if_ready(school) so
--      the trigger, the app layer and the backfill all share one code path.
--   2. Recreates check_school_completion() + its trigger idempotently
--      (DROP TRIGGER IF EXISTS … CREATE TRIGGER), so the trigger is guaranteed
--      to exist regardless of how much of 0054 landed.
--   3. Adds finalize_school_completion(uuid) — an RPC the Session Hub calls
--      right after verifying a session, so completion no longer depends on a
--      trigger surviving future partial migrations.
--   4. Backfills every school already stuck at sessions_active with 4 verified
--      sessions (the school in the bug report).
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─── 1. Shared completion routine ──────────────────────────────────────────
-- Idempotent: returns true only when it actually moved the school. Counts
-- DISTINCT session_number so a duplicated/re-verified row cannot fake a
-- completion, and takes a row lock so two concurrent verifications cannot both
-- write the completion history row.

CREATE OR REPLACE FUNCTION public.complete_school_if_ready(p_school_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school           schools;
  v_verified_count   int;
BEGIN
  SELECT * INTO v_school FROM schools WHERE id = p_school_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Only an active school completes; 'completed' is already terminal.
  IF v_school.status <> 'sessions_active' THEN
    RETURN false;
  END IF;

  SELECT count(DISTINCT session_number) INTO v_verified_count
    FROM sessions
   WHERE school_id = p_school_id
     AND status = 'verified'
     AND session_number IS NOT NULL;

  -- The program is a bounded 4-session engagement (PRD §7).
  IF v_verified_count < 4 THEN
    RETURN false;
  END IF;

  UPDATE schools
     SET status = 'completed',
         operational_phase = NULL,
         updated_at = now()
   WHERE id = p_school_id;

  INSERT INTO school_status_history (school_id, previous_status, new_status, changed_by, note)
  VALUES (p_school_id, 'sessions_active', 'completed', auth.uid(),
          'All 4 sessions verified — school program completed');

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (auth.uid(), 'school_auto_completed', 'school', p_school_id,
          jsonb_build_object('verified_sessions', v_verified_count));

  -- Certificates (0056) — must run BEFORE the team is released, because the
  -- issuer selects members with status = 'confirmed'. Guarded: the function is
  -- absent on databases where 0056 only partially applied, and certificate
  -- issuance must never block a session verification.
  IF to_regprocedure('public.evaluate_and_issue_school_certificates(uuid)') IS NOT NULL THEN
    BEGIN
      PERFORM public.evaluate_and_issue_school_certificates(p_school_id);
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Certificate issuance failed for school %: %', p_school_id, SQLERRM;
    END;
  END IF;

  -- Release the school team.
  UPDATE school_team_members
     SET status = 'completed'
   WHERE school_id = p_school_id
     AND is_active
     AND status = 'confirmed';

  RETURN true;
END;
$$;

COMMENT ON FUNCTION public.complete_school_if_ready(uuid) IS
  'Promotes a sessions_active school to completed once 4 distinct sessions are verified. Idempotent; returns true only when it moved the school.';


-- ─── 2. Session-verification trigger ───────────────────────────────────────

CREATE OR REPLACE FUNCTION public.check_school_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_completed boolean;
BEGIN
  IF NEW.status <> 'verified' OR OLD.status IS NOT DISTINCT FROM 'verified' THEN
    RETURN NEW;
  END IF;

  v_completed := public.complete_school_if_ready(NEW.school_id);

  -- Not the last session — unlock planning for the next one.
  IF NOT v_completed AND NEW.session_number IS NOT NULL AND NEW.session_number < 4 THEN
    UPDATE schools
       SET operational_phase = ('session_' || (NEW.session_number + 1) || '_planning')::operational_phase,
           updated_at = now()
     WHERE id = NEW.school_id AND status = 'sessions_active';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_school_completion ON public.sessions;
CREATE TRIGGER trg_check_school_completion
  AFTER UPDATE ON public.sessions
  FOR EACH ROW
  WHEN (NEW.status = 'verified' AND OLD.status IS DISTINCT FROM 'verified')
  EXECUTE FUNCTION public.check_school_completion();


-- ─── 3. App-layer RPC ──────────────────────────────────────────────────────
-- Called by verifySessionDelivery(). change_school_status() is a Super Admin
-- manual override (0055), so the ordinary completion path needs its own
-- entry point with the delivery roles' permissions.

CREATE OR REPLACE FUNCTION public.finalize_school_completion(p_school_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor        uuid := auth.uid();
  actor_role   user_role;
  actor_campus uuid;
  v_school     schools;
BEGIN
  SELECT * INTO v_school FROM schools WHERE id = p_school_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'School % not found', p_school_id USING errcode = '42704';
  END IF;

  IF actor IS NOT NULL THEN
    SELECT role, campus_id INTO actor_role, actor_campus FROM public.users WHERE id = actor;

    IF actor_role NOT IN ('super_admin','campus_mgmt_admin','campus_lead','exec_lead') THEN
      RAISE EXCEPTION 'You do not have permission to close out a school program'
        USING errcode = '42501';
    END IF;

    IF actor_role IN ('campus_lead','exec_lead')
       AND v_school.campus_id IS DISTINCT FROM actor_campus THEN
      RAISE EXCEPTION 'You can only manage schools assigned to your campus'
        USING errcode = '42501';
    END IF;
  END IF;

  RETURN public.complete_school_if_ready(p_school_id);
END;
$$;

COMMENT ON FUNCTION public.finalize_school_completion(uuid) IS
  'Campus Lead / Exec Lead / admin entry point that closes a school out once all 4 sessions are verified. Safe to call after every verification — it is a no-op until the school qualifies.';

REVOKE ALL ON FUNCTION public.finalize_school_completion(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.finalize_school_completion(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.complete_school_if_ready(uuid) FROM public;


-- ─── 4. Backfill schools stranded at Step 5 ────────────────────────────────

DO $$
DECLARE
  r        record;
  v_fixed  int := 0;
BEGIN
  FOR r IN
    SELECT s.id
      FROM schools s
     WHERE s.status = 'sessions_active'
       AND (
         SELECT count(DISTINCT x.session_number)
           FROM sessions x
          WHERE x.school_id = s.id
            AND x.status = 'verified'
            AND x.session_number IS NOT NULL
       ) >= 4
  LOOP
    IF public.complete_school_if_ready(r.id) THEN
      v_fixed := v_fixed + 1;
    END IF;
  END LOOP;

  RAISE NOTICE '0067: completed % school(s) stranded at sessions_active', v_fixed;
END $$;

COMMIT;
