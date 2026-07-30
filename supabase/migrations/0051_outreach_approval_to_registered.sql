-- 0051_outreach_approval_to_registered.sql
-- 1. Fix change_school_status to point to public.school_status_history instead of school_history.
-- 2. Update recompute_outreach_visit_request_status so that dual-approval moves the school
--    directly to 'registered' status (Step 4), automatically showing the onboarding form.
-- 3. Update approve_session_plan so that it does NOT create a session, but simply approves
--    the onboarding form and moves the school status to 'sessions_active' (Active School).

-- ─── 1. Fix change_school_status relation ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.change_school_status(
  p_school_id uuid,
  p_new_status school_status,
  p_note       text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_school    schools;
  actor       uuid := auth.uid();
  actor_role  user_role;
  actor_campus uuid;
  exec_stages school_status[] := ARRAY['registered','sessions_active','completed']::school_status[];
BEGIN
  SELECT * INTO v_school FROM schools WHERE id = p_school_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'School % not found', p_school_id; END IF;

  -- Auth check
  IF actor IS NOT NULL THEN
    SELECT role, campus_id INTO actor_role, actor_campus
      FROM public.users WHERE id = actor;

    IF actor_role = 'exec_lead' THEN
      IF NOT (p_new_status = ANY(exec_stages) AND v_school.status = ANY(exec_stages))
         OR v_school.campus_id IS DISTINCT FROM actor_campus THEN
        RAISE EXCEPTION 'exec_lead may only move registered/active/completed schools on their own campus'
          USING errcode = '42501';
      END IF;
    ELSIF actor_role NOT IN ('super_admin','campus_mgmt_admin','campus_lead','outreach_lead','finance_lead') THEN
      RAISE EXCEPTION 'You do not have permission to change school status'
        USING errcode = '42501';
    END IF;

    -- campus-scoped roles check campus
    IF actor_role IN ('campus_lead','outreach_lead','exec_lead','finance_lead')
       AND v_school.campus_id IS DISTINCT FROM actor_campus THEN
      RAISE EXCEPTION 'You can only manage schools assigned to your campus'
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
    school_transition_allowed(p_new_status, v_school.status)  -- reverse exists → backward
    OR p_new_status = 'archived'
  ) AND (p_note IS NULL OR trim(p_note) = '') THEN
    RAISE EXCEPTION 'A note is required for backward moves and archiving'
      USING errcode = '23514';
  END IF;

  UPDATE schools SET status = p_new_status, updated_at = now() WHERE id = p_school_id;

  INSERT INTO school_status_history (school_id, previous_status, new_status, changed_by, note)
  VALUES (p_school_id, v_school.status::text, p_new_status::text, actor, p_note);

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'school_status_change', 'school', p_school_id,
          jsonb_build_object('from', v_school.status, 'to', p_new_status, 'note', p_note));
END;
$$;


-- ─── 2. Update outreach approval to set registered ───────────────────────────
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

  -- Both legs approved: move school directly to 'registered' status (Step 4) so onboarding form is shown.
  IF v_new = 'approved' THEN
    SELECT status INTO v_school_status FROM schools WHERE id = v_school_id;
    IF v_school_status IN ('lead_identified', 'outreach_requested', 'outreach_approved') THEN
      UPDATE schools SET status = 'registered' WHERE id = v_school_id;
      INSERT INTO school_status_history (school_id, previous_status, new_status, changed_by, note)
      VALUES (v_school_id, v_school_status::text, 'registered', auth.uid(),
              'Outreach visit request fully approved');
      INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
      VALUES (auth.uid(), 'status_change', 'school', v_school_id,
              jsonb_build_object('from', v_school_status, 'to', 'registered',
                                  'note', 'Outreach visit request fully approved',
                                  'source', 'outreach_visit_request_dual_approval'));
    END IF;
  END IF;

  RETURN v_new;
END;
$$;


-- ─── 3. Remove session planning from approve_session_plan ─────────────────────
CREATE OR REPLACE FUNCTION public.approve_session_plan(p_plan_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_plan        session_plans;
  v_school      schools;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
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

  -- Mark plan as approved (no session created)
  UPDATE session_plans
     SET status = 'approved', approved_by = actor, approved_at = now()
   WHERE id = p_plan_id;

  -- Transition to sessions_active (Active School)
  PERFORM change_school_status(
    v_plan.school_id, 'sessions_active',
    'Onboarding approved'
  );

  RETURN v_plan.id;
END;
$$;
