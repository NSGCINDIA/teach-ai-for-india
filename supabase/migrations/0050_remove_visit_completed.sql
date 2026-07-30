-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0050 Remove visit_completed from pipeline
--
-- The "visit_completed" step is no longer part of the school pipeline.
-- After outreach_approved the school moves directly to registered (Active
-- School onboarding). No schools currently hold the visit_completed status
-- so there is no data to migrate.
--
-- Strategy: We cannot DROP an enum value in Postgres without recreating the
-- type. Instead, we simply remove visit_completed from all transition-control
-- functions so it is unreachable via change_school_status(). The enum value
-- stays in the type for backward compatibility but is no longer used.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Update the transition-allowed guard ───────────────────────────────
-- Replaces the function from 0036_school_lifecycle_v2.sql
CREATE OR REPLACE FUNCTION public.school_transition_allowed(
  p_from school_status,
  p_to   school_status
) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT (p_from, p_to) IN (
    -- Forward
    ('lead_identified',   'outreach_requested'),
    ('outreach_requested','outreach_approved'),
    ('outreach_approved', 'registered'),          -- skip visit_completed
    ('registered',        'sessions_active'),
    ('sessions_active',   'completed'),
    -- Backward
    ('outreach_requested','lead_identified'),
    ('outreach_approved', 'outreach_requested'),
    ('registered',        'outreach_approved'),
    ('sessions_active',   'registered'),
    ('completed',         'sessions_active'),
    -- Archive (any non-terminal → archived)
    ('lead_identified',   'archived'),
    ('outreach_requested','archived'),
    ('outreach_approved', 'archived'),
    ('registered',        'archived'),
    ('sessions_active',   'archived'),
    -- Reopen
    ('archived',          'lead_identified')
  )
$$;

COMMENT ON FUNCTION public.school_transition_allowed(school_status, school_status) IS
  'Returns true when the given status transition is legal. visit_completed removed in 0050.';

-- ─── 2. Update change_school_status to drop visit_completed exec stage ────
-- Replaces the function body from 0036 / later patches.
-- exec_lead may only move a school within the execution stages (no visit_completed).
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

  INSERT INTO school_history (school_id, from_status, to_status, changed_by, note)
  VALUES (p_school_id, v_school.status, p_new_status, actor, p_note);

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'school_status_change', 'school', p_school_id,
          jsonb_build_object('from', v_school.status, 'to', p_new_status, 'note', p_note));
END;
$$;

COMMENT ON FUNCTION public.change_school_status(uuid, school_status, text) IS
  'Validated school-status transition. visit_completed removed from pipeline in 0050.';

GRANT EXECUTE ON FUNCTION public.change_school_status(uuid, school_status, text) TO authenticated;
