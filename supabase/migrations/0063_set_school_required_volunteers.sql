-- Migration: 0063_set_school_required_volunteers.sql
-- Description: Let the team owner set a school's required volunteer count on its
-- own, without also having to request availability from someone.
--
-- Why this is needed:
--   `required_volunteers` lives on `schools`, and `schools_update` RLS only
--   admits super_admin / campus_lead / outreach_lead — volunteer_lead is not on
--   that list and should not be, since it would hand them every other school
--   field too. The only existing way to change the count was the third argument
--   of request_school_team_availability(), which opens with
--
--     IF p_school_id IS NULL OR coalesce(array_length(p_volunteer_ids, 1), 0) = 0
--       THEN RAISE EXCEPTION 'A school and at least one volunteer are required'
--
--   so the count could never be adjusted by itself, and could not be adjusted at
--   all once every campus volunteer was already requested (the roster renders
--   empty, leaving nothing to tick). Hence a narrow SECURITY DEFINER function
--   that writes exactly one column.
--
-- Role gate mirrors request_school_team_availability: super_admin, or
-- campus_lead / volunteer_lead acting on their own campus.

CREATE OR REPLACE FUNCTION public.set_school_required_volunteers(
  p_school_id uuid,
  p_required_volunteers integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school       schools;
  v_actor        uuid := auth.uid();
  v_actor_role   user_role;
  v_actor_campus uuid;
BEGIN
  IF p_school_id IS NULL THEN
    RAISE EXCEPTION 'A school is required' USING errcode = '22023';
  END IF;
  IF p_required_volunteers IS NULL OR p_required_volunteers < 1 THEN
    RAISE EXCEPTION 'Required volunteers must be at least 1' USING errcode = '22023';
  END IF;

  SELECT * INTO v_school FROM public.schools WHERE id = p_school_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'School % not found', p_school_id USING errcode = 'P0002';
  END IF;

  SELECT role, campus_id INTO v_actor_role, v_actor_campus
  FROM public.users WHERE id = v_actor;

  IF v_actor IS NULL
     OR NOT (
       v_actor_role = 'super_admin'
       OR (v_actor_role IN ('campus_lead', 'volunteer_lead')
           AND v_school.campus_id IS NOT DISTINCT FROM v_actor_campus)
     ) THEN
    RAISE EXCEPTION 'You do not have permission to manage this school''s team'
      USING errcode = '42501';
  END IF;

  UPDATE public.schools
     SET required_volunteers = p_required_volunteers,
         updated_at = now()
   WHERE id = p_school_id;

  RETURN p_required_volunteers;
END;
$$;

COMMENT ON FUNCTION public.set_school_required_volunteers(uuid, integer) IS
  'Sets schools.required_volunteers on its own. Exists because volunteer_lead has no schools UPDATE via RLS, and request_school_team_availability() refuses to run without at least one volunteer id.';

REVOKE ALL ON FUNCTION public.set_school_required_volunteers(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_school_required_volunteers(uuid, integer) TO authenticated;
