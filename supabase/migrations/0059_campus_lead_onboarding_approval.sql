-- Only the assigned Campus Lead may verify an approval letter and activate a school.
-- Outreach Leads may prepare the onboarding record, but cannot approve it.

-- Some deployed projects predate the execution-workflow migration. Keep this
-- approval migration safe to apply there as well.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'operational_phase') THEN
    CREATE TYPE public.operational_phase AS ENUM (
      'team_preparation', 'team_ready', 'execution_planning', 'execution_ready',
      'session_1_planning', 'session_1_ready', 'session_1_in_progress', 'session_1_report_required', 'session_1_submitted', 'session_1_verified',
      'session_2_planning', 'session_2_ready', 'session_2_in_progress', 'session_2_report_required', 'session_2_submitted', 'session_2_verified',
      'session_3_planning', 'session_3_ready', 'session_3_in_progress', 'session_3_report_required', 'session_3_submitted', 'session_3_verified',
      'session_4_planning', 'session_4_ready', 'session_4_in_progress', 'session_4_report_required', 'session_4_submitted', 'session_4_verified'
    );
  END IF;
END;
$$;

ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS required_volunteers integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS operational_phase public.operational_phase;

ALTER TABLE public.session_plans
  ADD COLUMN IF NOT EXISTS approval_letter_verified_by uuid REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS approval_letter_verified_at timestamptz;

COMMENT ON COLUMN public.session_plans.approval_letter_verified_by IS
  'Campus Lead who manually verified the official approval letter before activation.';
COMMENT ON COLUMN public.session_plans.approval_letter_verified_at IS
  'When the Campus Lead verified the official approval letter before activation.';

-- The old RPC has no verification acknowledgement, so it may not be called.
REVOKE ALL ON FUNCTION public.approve_session_plan(uuid) FROM PUBLIC, authenticated;

CREATE OR REPLACE FUNCTION public.approve_session_plan(
  p_plan_id uuid,
  p_letter_verified boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan session_plans;
  v_school schools;
  actor uuid := auth.uid();
  actor_role user_role;
  actor_campus uuid;
  v_required integer;
BEGIN
  IF p_letter_verified IS NOT TRUE THEN
    RAISE EXCEPTION 'You must confirm that the official approval letter has been verified'
      USING errcode = '42501';
  END IF;

  SELECT * INTO v_plan FROM session_plans WHERE id = p_plan_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Planning record % not found', p_plan_id;
  END IF;
  IF v_plan.status = 'approved' THEN
    RAISE EXCEPTION 'This planning record is already approved' USING errcode = '23514';
  END IF;
  IF nullif(trim(v_plan.approval_letter_path), '') IS NULL THEN
    RAISE EXCEPTION 'An official approval letter is required before activation' USING errcode = '23514';
  END IF;

  SELECT * INTO v_school FROM schools WHERE id = v_plan.school_id;
  SELECT role, campus_id INTO actor_role, actor_campus FROM public.users WHERE id = actor;

  IF actor IS NULL
     OR actor_role <> 'campus_lead'
     OR actor_campus IS NULL
     OR v_school.campus_id IS DISTINCT FROM actor_campus THEN
    RAISE EXCEPTION 'Only the Campus Lead assigned to this school may verify and approve onboarding'
      USING errcode = '42501';
  END IF;

  IF v_school.status NOT IN ('registered', 'sessions_active') THEN
    RAISE EXCEPTION 'The school must be Registered before onboarding can be approved'
      USING errcode = '42501';
  END IF;

  v_required := GREATEST(coalesce(v_plan.recommended_fellows, 2), 2);

  UPDATE session_plans
     SET status = 'approved',
         approved_by = actor,
         approved_at = now(),
         approval_letter_verified_by = actor,
         approval_letter_verified_at = now()
   WHERE id = p_plan_id;

  UPDATE schools
     SET status = 'sessions_active',
         operational_phase = 'team_preparation',
         required_volunteers = v_required,
         updated_at = now()
   WHERE id = v_plan.school_id;

  INSERT INTO school_status_history (school_id, previous_status, new_status, changed_by, note)
  VALUES (v_plan.school_id, v_school.status::text, 'sessions_active', actor,
          'Official approval letter verified by Campus Lead; onboarding approved and school activated');

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'school_onboarding_approved_activation', 'school', v_plan.school_id,
          jsonb_build_object(
            'plan_id', p_plan_id,
            'approval_letter_verified', true,
            'approval_letter_verified_by', actor,
            'required_volunteers', v_required,
            'from_status', v_school.status,
            'to_status', 'sessions_active',
            'phase', 'team_preparation'
          ));

  FOR actor_campus IN
    SELECT id FROM public.users
     WHERE is_active AND role = 'volunteer_lead'
       AND campus_id IS NOT DISTINCT FROM v_school.campus_id
  LOOP
    PERFORM notify_user(
      actor_campus,
      'school_team_preparation',
      'Onboarding approved. ' || v_required || ' volunteers needed. Please start team preparation.',
      '/dashboard/schools/' || v_plan.school_id,
      'school',
      v_plan.school_id
    );
  END LOOP;

  RETURN v_plan.id;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_session_plan(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_session_plan(uuid, boolean) TO authenticated;

-- Make the new RPC immediately visible to Supabase's PostgREST schema cache.
NOTIFY pgrst, 'reload schema';
