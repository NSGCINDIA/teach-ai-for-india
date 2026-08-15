-- Teach AI for India — 0061 Fix school_execution_plans total_budget column & RPC
-- Fixes "column total_budget does not exist" error during Finance Lead review.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'school_execution_plans'
      AND column_name = 'total_budget'
  ) THEN
    ALTER TABLE public.school_execution_plans
      ADD COLUMN total_budget numeric(12,2) GENERATED ALWAYS AS (
        coalesce(transport_budget, 0) + coalesce(materials_budget, 0) + coalesce(equipment_budget, 0) + coalesce(other_budget, 0)
      ) STORED;
  END IF;
END $$;

-- Update review_school_execution_plan_finance to safely calculate total budget without failing on missing/null columns
CREATE OR REPLACE FUNCTION public.review_school_execution_plan_finance(
  p_plan_id uuid,
  p_decision text,
  p_comments text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_plan         public.school_execution_plans;
  v_school       public.schools;
  v_plan_total   numeric(12,2);
  actor          uuid := auth.uid();
  actor_role     public.user_role;
  actor_campus   uuid;
BEGIN
  IF p_decision NOT IN ('approved', 'changes_requested') THEN
    RAISE EXCEPTION 'Decision must be approved or changes_requested';
  END IF;

  SELECT * INTO v_plan FROM public.school_execution_plans WHERE id = p_plan_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Execution plan not found'; END IF;

  IF v_plan.status <> 'campus_approved' THEN
    RAISE EXCEPTION 'Campus Lead must approve before Finance can review' USING errcode = '23514';
  END IF;

  IF actor IS NOT NULL THEN
    SELECT role, campus_id INTO actor_role, actor_campus FROM public.users WHERE id = actor;
    IF NOT (
      actor_role IN ('super_admin')
      OR (actor_role = 'finance_lead' AND v_plan.campus_id IS NOT DISTINCT FROM actor_campus)
    ) THEN
      RAISE EXCEPTION 'You do not have permission to review this plan' USING errcode = '42501';
    END IF;
  END IF;

  IF p_decision = 'changes_requested' AND coalesce(trim(p_comments), '') = '' THEN
    RAISE EXCEPTION 'Comments are required when requesting changes' USING errcode = '23514';
  END IF;

  v_plan_total := coalesce(v_plan.transport_budget, 0) + coalesce(v_plan.materials_budget, 0) + coalesce(v_plan.equipment_budget, 0) + coalesce(v_plan.other_budget, 0);

  UPDATE public.school_execution_plans
     SET status = CASE p_decision WHEN 'approved' THEN 'approved'::execution_plan_status ELSE 'finance_changes_requested'::execution_plan_status END,
         finance_reviewed_by = actor, finance_reviewed_at = now(),
         finance_comments = nullif(trim(p_comments), '')
   WHERE id = p_plan_id;

  SELECT * INTO v_school FROM public.schools WHERE id = v_plan.school_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'school_execution_plan_finance_review', 'school_execution_plan', p_plan_id,
          jsonb_build_object('decision', p_decision, 'comments', p_comments, 'total_budget', v_plan_total));

  IF p_decision = 'approved' THEN
    UPDATE public.schools SET operational_phase = 'execution_ready' WHERE id = v_plan.school_id;

    INSERT INTO public.school_status_history (school_id, previous_status, new_status, changed_by, note)
    VALUES (v_plan.school_id, 'sessions_active', 'sessions_active', actor,
            'Execution plan fully approved — school is execution-ready');

    INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, detail)
    VALUES (actor, 'school_execution_ready', 'school', v_plan.school_id,
            jsonb_build_object('plan_id', p_plan_id, 'phase', 'execution_ready'));
  END IF;

  IF v_plan.submitted_by IS NOT NULL THEN
    PERFORM public.notify_user(
      v_plan.submitted_by,
      'school_execution_plan_finance_' || p_decision,
      'Finance Lead ' || CASE p_decision WHEN 'approved' THEN 'approved' ELSE 'requested changes on' END || ' your execution plan',
      CASE p_decision WHEN 'approved' THEN 'Both approvals complete — sessions can now be planned.' ELSE coalesce('Comments: ' || p_comments, 'No comments.') END,
      '/dashboard/schools/' || v_plan.school_id,
      'school',
      v_plan.school_id
    );
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.review_school_execution_plan_finance FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_school_execution_plan_finance TO authenticated;
