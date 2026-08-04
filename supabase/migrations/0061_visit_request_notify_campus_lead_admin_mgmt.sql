-- Migration: 0061_visit_request_notify_campus_lead_admin_mgmt.sql
-- Description: Send visit request notifications to Campus Lead, Super Admin, Management Admin, and Finance Lead.

CREATE OR REPLACE FUNCTION public.create_outreach_visit_request(
  p_school_id              uuid,
  p_proposed_visit_date    date,
  p_estimated_travel_cost  numeric,
  p_team_member_ids        uuid[],
  p_priority               text,
  p_expected_outcomes      text[],
  p_transportation         text    DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_school      schools;
  v_id          uuid;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
  rec           record;
BEGIN
  -- Validate inputs
  IF p_priority IS NULL OR p_priority NOT IN ('High','Medium','Low') THEN
    RAISE EXCEPTION 'Priority must be High, Medium, or Low' USING errcode = '22023';
  END IF;
  IF p_transportation IS NOT NULL AND p_transportation NOT IN ('Bike','Car','Auto') THEN
    RAISE EXCEPTION 'Transportation must be Bike, Car, or Auto' USING errcode = '22023';
  END IF;
  IF coalesce(array_length(p_expected_outcomes, 1), 0) = 0 THEN
    RAISE EXCEPTION 'Select at least one expected outcome' USING errcode = '23514';
  END IF;
  IF p_estimated_travel_cost IS NULL OR p_estimated_travel_cost <= 0 THEN
    RAISE EXCEPTION 'Estimated travel cost must be greater than zero' USING errcode = '23514';
  END IF;
  IF coalesce(array_length(p_team_member_ids, 1), 0) = 0 THEN
    RAISE EXCEPTION 'Select at least one outreach team member' USING errcode = '23514';
  END IF;

  SELECT * INTO v_school FROM schools WHERE id = p_school_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'School % not found', p_school_id;
  END IF;

  IF actor IS NOT NULL THEN
    SELECT role, campus_id INTO actor_role, actor_campus FROM public.users WHERE id = actor;
    IF NOT (
      actor_role IN ('super_admin','mgmt_admin','campus_mgmt_admin')
      OR (actor_role IN ('campus_lead','outreach_lead')
          AND v_school.campus_id IS NOT DISTINCT FROM actor_campus)
    ) THEN
      RAISE EXCEPTION 'You do not have permission to file a visit request for this school'
        USING errcode = '42501';
    END IF;
  END IF;

  INSERT INTO outreach_visit_requests
    (school_id, campus_id, purpose, proposed_visit_date, estimated_travel_cost,
     team_member_ids, priority, expected_outcomes, transportation, created_by)
  VALUES
    (p_school_id, v_school.campus_id, NULL, p_proposed_visit_date,
     p_estimated_travel_cost, p_team_member_ids,
     p_priority, p_expected_outcomes, p_transportation, actor)
  RETURNING id INTO v_id;

  PERFORM change_school_status(p_school_id, 'outreach_requested'::school_status, 'Outreach visit request filed');

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'outreach_visit_request_create', 'outreach_visit_request', v_id,
          jsonb_build_object(
            'school_id',             p_school_id,
            'estimated_travel_cost', p_estimated_travel_cost,
            'proposed_visit_date',   p_proposed_visit_date,
            'priority',              p_priority,
            'expected_outcomes',     p_expected_outcomes
          ));

  -- Notify Campus Lead, Finance Lead of campus + Super Admin & Management Admin
  FOR rec IN
    SELECT id FROM public.users
     WHERE is_active
       AND (
         (role IN ('campus_lead','finance_lead','campus_mgmt_admin') AND campus_id IS NOT DISTINCT FROM v_school.campus_id)
         OR role IN ('super_admin', 'mgmt_admin')
       )
  LOOP
    PERFORM notify_user(
      rec.id,
      'outreach_visit_request_created',
      'New outreach visit request: ' || v_school.name,
      array_to_string(p_expected_outcomes, ', ') || ' — proposed for '
        || to_char(p_proposed_visit_date, 'DD Mon YYYY')
        || ', est. ₹' || p_estimated_travel_cost || '.',
      '/dashboard/schools/' || p_school_id,
      'school',
      p_school_id
    );
  END LOOP;

  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION public.create_outreach_visit_request(uuid, date, numeric, uuid[], text, text[], text) IS
  'File an outreach visit request; notifies Campus Lead, Finance Lead, Super Admin, and Management Admin.';

GRANT EXECUTE ON FUNCTION public.create_outreach_visit_request(uuid, date, numeric, uuid[], text, text[], text) TO authenticated;
