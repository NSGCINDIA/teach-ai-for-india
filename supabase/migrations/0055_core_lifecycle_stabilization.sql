-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0055 Core School Lifecycle Stabilization (Phase 1)
--
-- Stabilizes the core school lifecycle:
--   1. Fixes enforce_session_transition() to accept school_execution_plans (Task 1)
--   2. Synchronizes operational_phase on session status changes (Task 6)
--   3. Sets outreach approval transition to outreach_approved (Task 4)
--   4. Creates initiate_school_onboarding() to transition outreach_approved → registered (Task 4)
--   5. Updates approve_session_plan() for atomic activation (Task 3 & 7)
--   6. Restricts manual change_school_status() override to super_admin only (Task 5)
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─── 1. Restrict manual change_school_status to super_admin (Task 5) ────────

CREATE OR REPLACE FUNCTION public.change_school_status(
  p_school_id uuid,
  p_new_status school_status,
  p_note       text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_school    schools;
  actor       uuid := auth.uid();
  actor_role  user_role;
BEGIN
  SELECT * INTO v_school FROM schools WHERE id = p_school_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'School % not found', p_school_id; END IF;

  -- Manual state override is super_admin ONLY (Task 5)
  IF actor IS NOT NULL THEN
    SELECT role INTO actor_role FROM public.users WHERE id = actor;
    IF actor_role <> 'super_admin' THEN
      RAISE EXCEPTION 'Only a Super Admin may perform a manual status override. Normal stage transitions happen automatically via business actions.'
        USING errcode = '42501';
    END IF;
  END IF;

  -- Transition guard
  IF NOT school_transition_allowed(v_school.status, p_new_status) THEN
    RAISE EXCEPTION 'Transition from % to % is not allowed', v_school.status, p_new_status
      USING errcode = '22023';
  END IF;

  -- Note required for backward moves or archiving
  IF (
    school_transition_allowed(p_new_status, v_school.status)
    OR p_new_status = 'archived'
  ) AND (p_note IS NULL OR trim(p_note) = '') THEN
    RAISE EXCEPTION 'A note is required for manual status overrides, backward moves, and archiving'
      USING errcode = '23514';
  END IF;

  UPDATE schools SET status = p_new_status, updated_at = now() WHERE id = p_school_id;

  INSERT INTO school_status_history (school_id, previous_status, new_status, changed_by, note)
  VALUES (p_school_id, v_school.status::text, p_new_status::text, actor, p_note);

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'admin_school_status_override', 'school', p_school_id,
          jsonb_build_object('from', v_school.status, 'to', p_new_status, 'note', p_note));
END;
$$;

COMMENT ON FUNCTION public.change_school_status(uuid, school_status, text) IS
  'Manual school status override restricted to super_admin with mandatory reason note (Phase 1 Task 5).';


-- ─── 2. Outreach Visit Request Dual Approval → outreach_approved (Task 4) ───

CREATE OR REPLACE FUNCTION public.recompute_outreach_visit_request_status(p_id uuid)
RETURNS approval_status LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_campus         approval_status;
  v_finance        approval_status;
  v_new            approval_status;
  v_school_id      uuid;
  v_school_status  school_status;
BEGIN
  SELECT campus_lead_review, finance_lead_review, school_id INTO v_campus, v_finance, v_school_id
    FROM outreach_visit_requests WHERE id = p_id;

  v_new := CASE
    WHEN v_campus = 'rejected' OR v_finance = 'rejected' THEN 'rejected'
    WHEN v_campus = 'approved' AND v_finance = 'approved' THEN 'approved'
    ELSE 'pending'
  END;

  UPDATE outreach_visit_requests SET status = v_new WHERE id = p_id;

  -- Dual approval completed: move school to outreach_approved (Task 4)
  IF v_new = 'approved' THEN
    SELECT status INTO v_school_status FROM schools WHERE id = v_school_id;
    IF v_school_status IN ('lead_identified', 'outreach_requested') THEN
      UPDATE schools SET status = 'outreach_approved', updated_at = now() WHERE id = v_school_id;

      INSERT INTO school_status_history (school_id, previous_status, new_status, changed_by, note)
      VALUES (v_school_id, v_school_status::text, 'outreach_approved', auth.uid(),
              'Outreach visit request fully approved');

      INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
      VALUES (auth.uid(), 'outreach_approved_auto', 'school', v_school_id,
              jsonb_build_object('from', v_school_status, 'to', 'outreach_approved',
                                  'source', 'outreach_visit_request_dual_approval'));
    END IF;
  END IF;

  RETURN v_new;
END;
$$;


-- ─── 3. Initiate School Onboarding (outreach_approved → registered) (Task 4) ──

CREATE OR REPLACE FUNCTION public.initiate_school_onboarding(p_school_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_school      schools;
  v_plan_id     uuid;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
BEGIN
  SELECT * INTO v_school FROM schools WHERE id = p_school_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'School % not found', p_school_id; END IF;

  IF actor IS NOT NULL THEN
    SELECT role, campus_id INTO actor_role, actor_campus FROM public.users WHERE id = actor;
    IF NOT (
      actor_role IN ('super_admin')
      OR (actor_role IN ('campus_lead','outreach_lead')
          AND v_school.campus_id IS NOT DISTINCT FROM actor_campus)
    ) THEN
      RAISE EXCEPTION 'You do not have permission to initiate onboarding for this school' USING errcode = '42501';
    END IF;
  END IF;

  -- Auto-advance outreach_approved → registered when onboarding is initiated (Task 4)
  IF v_school.status = 'outreach_approved' THEN
    UPDATE schools SET status = 'registered', updated_at = now() WHERE id = p_school_id;

    INSERT INTO school_status_history (school_id, previous_status, new_status, changed_by, note)
    VALUES (p_school_id, 'outreach_approved', 'registered', actor,
            'Onboarding initiated');

    INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
    VALUES (actor, 'onboarding_initiated_auto', 'school', p_school_id,
            jsonb_build_object('from', 'outreach_approved', 'to', 'registered'));
  END IF;

  -- Get or create draft session_plans record
  SELECT id INTO v_plan_id FROM session_plans WHERE school_id = p_school_id AND status = 'draft';

  IF v_plan_id IS NULL THEN
    INSERT INTO session_plans (school_id, campus_id, created_by, status)
    VALUES (p_school_id, v_school.campus_id, actor, 'draft')
    RETURNING id INTO v_plan_id;
  END IF;

  RETURN v_plan_id;
END;
$$;

COMMENT ON FUNCTION public.initiate_school_onboarding(uuid) IS
  'Initiates onboarding for a school, moving outreach_approved → registered automatically (Task 4).';
GRANT EXECUTE ON FUNCTION public.initiate_school_onboarding(uuid) TO authenticated;


-- ─── 4. Fix enforce_session_transition() Execution Plan Gate (Task 1 & 6) ────

CREATE OR REPLACE FUNCTION public.enforce_session_transition()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

  -- Execution plan gate (Task 1):
  -- Check EITHER school_execution_plans for the school OR legacy execution_plans for the session
  IF NEW.status = 'in_progress' AND OLD.status = 'planned' THEN
    SELECT (
      EXISTS (SELECT 1 FROM school_execution_plans WHERE school_id = NEW.school_id AND status = 'approved')
      OR EXISTS (SELECT 1 FROM execution_plans WHERE session_id = NEW.id AND status = 'approved')
    ) INTO has_approved_exec_plan;

    IF NOT has_approved_exec_plan THEN
      RAISE EXCEPTION 'Cannot start session: the school execution plan must be approved first'
        USING errcode = '23514';
    END IF;

    -- Synchronize operational_phase: session_N_in_progress (Task 6)
    IF NEW.session_number IS NOT NULL THEN
      UPDATE schools
         SET operational_phase = ('session_' || NEW.session_number || '_in_progress')::operational_phase
       WHERE id = NEW.school_id AND status = 'sessions_active';
    END IF;
  END IF;

  -- Synchronize operational_phase when moving to reported (Task 6)
  IF NEW.status = 'reported' THEN
    IF coalesce(NEW.student_count,0) <= 0
       OR coalesce(NEW.volunteer_count,0) <= 0
       OR coalesce(nullif(trim(NEW.topic),''), null) IS NULL THEN
      RAISE EXCEPTION 'Cannot report session: student count, volunteer count and topic are required'
        USING errcode = '23514';
    END IF;

    SELECT count(*) FILTER (WHERE file_type = 'photo' OR file_type LIKE '%photo%'),
           count(*) FILTER (WHERE file_type = 'document' OR file_type = 'letter')
      INTO n_photos, n_docs
      FROM media_assets
      WHERE session_id = NEW.id AND deleted_at IS NULL;

    IF n_photos < 1 OR n_docs < 1 THEN
      RAISE EXCEPTION 'Cannot report session: at least 1 photo and 1 attendance/report document are required'
        USING errcode = '23514';
    END IF;

    IF NEW.session_number IS NOT NULL THEN
      UPDATE schools
         SET operational_phase = ('session_' || NEW.session_number || '_report_required')::operational_phase
       WHERE id = NEW.school_id AND status = 'sessions_active';
    END IF;
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


-- ─── 5. Update approve_session_plan() Atomic Activation (Task 3 & 7) ─────────

CREATE OR REPLACE FUNCTION public.approve_session_plan(p_plan_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_plan        session_plans;
  v_school      schools;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
  v_required    integer;
BEGIN
  SELECT * INTO v_plan FROM session_plans WHERE id = p_plan_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Planning record % not found', p_plan_id;
  END IF;
  IF v_plan.status = 'approved' THEN
    RAISE EXCEPTION 'This planning record is already approved' USING errcode = '23514';
  END IF;

  SELECT * INTO v_school FROM schools WHERE id = v_plan.school_id;

  IF actor IS NOT NULL THEN
    SELECT role, campus_id INTO actor_role, actor_campus FROM public.users WHERE id = actor;
    IF NOT (
      actor_role IN ('super_admin')
      OR (actor_role IN ('campus_lead','outreach_lead')
          AND v_school.campus_id IS NOT DISTINCT FROM actor_campus)
    ) THEN
      RAISE EXCEPTION 'You do not have permission to approve this planning record' USING errcode = '42501';
    END IF;
  END IF;

  IF v_school.status NOT IN ('registered', 'sessions_active') THEN
    RAISE EXCEPTION 'The school must be Registered before onboarding can be approved'
      USING errcode = '42501';
  END IF;

  -- Compute required volunteers
  v_required := GREATEST(coalesce(v_plan.recommended_fellows, 2), 2);

  -- Atomic update: mark plan approved, set school status = sessions_active & operational_phase = team_preparation (Task 3)
  UPDATE session_plans
     SET status = 'approved', approved_by = actor, approved_at = now()
   WHERE id = p_plan_id;

  UPDATE schools
     SET status = 'sessions_active',
         operational_phase = 'team_preparation',
         required_volunteers = v_required,
         updated_at = now()
   WHERE id = v_plan.school_id;

  INSERT INTO school_status_history (school_id, previous_status, new_status, changed_by, note)
  VALUES (v_plan.school_id, v_school.status::text, 'sessions_active', actor,
          'Onboarding approved — school activated');

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'school_onboarding_approved_activation', 'school', v_plan.school_id,
          jsonb_build_object('plan_id', p_plan_id, 'required_volunteers', v_required,
                              'from_status', v_school.status, 'to_status', 'sessions_active',
                              'phase', 'team_preparation'));

  -- Notify campus volunteer leads
  FOR actor_campus IN
    SELECT id FROM public.users
     WHERE is_active AND role = 'volunteer_lead'
       AND campus_id IS NOT DISTINCT FROM v_school.campus_id
  LOOP
    PERFORM notify_user(
      actor_campus,
      'school_team_preparation',
      'Build team: ' || v_school.name,
      'Onboarding approved. ' || v_required || ' volunteers needed. Please start team preparation.',
      '/dashboard/schools/' || v_plan.school_id,
      'school',
      v_plan.school_id
    );
  END LOOP;

  RETURN v_plan.id;
END;
$$;

COMMIT;
