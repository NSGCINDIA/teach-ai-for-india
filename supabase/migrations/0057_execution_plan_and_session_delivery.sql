-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0057 Execution Plan & Session Delivery (Phase 3)
--
-- Execution Lead & Delivery Refactor:
--   1. Adds is_team_lead column to school_team_members & set_school_team_lead RPC
--   2. Adds resubmit_school_execution_plan RPC for changes_requested workflow
--   3. Synchronizes all operational_phase states in enforce_session_transition()
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─── 1. Team Lead Designation ───────────────────────────────────────────────

ALTER TABLE public.school_team_members
  ADD COLUMN IF NOT EXISTS is_team_lead boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.set_school_team_lead(
  p_school_id uuid,
  p_member_id uuid
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_school      schools;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
BEGIN
  SELECT * INTO v_school FROM schools WHERE id = p_school_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'School % not found', p_school_id; END IF;

  IF actor IS NOT NULL THEN
    SELECT role, campus_id INTO actor_role, actor_campus FROM public.users WHERE id = actor;
    IF NOT (
      actor_role IN ('super_admin')
      OR (actor_role IN ('volunteer_lead','campus_lead')
          AND v_school.campus_id IS NOT DISTINCT FROM actor_campus)
    ) THEN
      RAISE EXCEPTION 'You do not have permission to designate team leads for this school' USING errcode = '42501';
    END IF;
  END IF;

  -- Reset all team members for this school to false, then set designated member to true
  UPDATE school_team_members SET is_team_lead = false WHERE school_id = p_school_id;
  UPDATE school_team_members SET is_team_lead = true WHERE id = p_member_id AND school_id = p_school_id;

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'set_school_team_lead', 'school', p_school_id,
          jsonb_build_object('member_id', p_member_id));
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_school_team_lead(uuid, uuid) TO authenticated;


-- ─── 2. Resubmit Execution Plan RPC (Changes Requested Workflow) ─────────────

CREATE OR REPLACE FUNCTION public.resubmit_school_execution_plan(
  p_plan_id                 uuid,
  p_laptops_count           integer DEFAULT 0,
  p_projectors_count        integer DEFAULT 0,
  p_hdmi_cables_count       integer DEFAULT 0,
  p_extension_boards_count  integer DEFAULT 0,
  p_teaching_kits_count     integer DEFAULT 0,
  p_speakers_count          integer DEFAULT 0,
  p_other_equipment         text DEFAULT NULL,
  p_distance_km             numeric DEFAULT NULL,
  p_transport_mode          text DEFAULT NULL,
  p_estimated_travel_cost   numeric DEFAULT 0,
  p_meeting_departure_notes text DEFAULT NULL,
  p_transport_budget        numeric DEFAULT 0,
  p_materials_budget        numeric DEFAULT 0,
  p_equipment_budget        numeric DEFAULT 0,
  p_other_budget            numeric DEFAULT 0
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_plan        school_execution_plans;
  v_school      schools;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
BEGIN
  SELECT * INTO v_plan FROM school_execution_plans WHERE id = p_plan_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Execution plan % not found', p_plan_id; END IF;

  IF v_plan.status NOT IN ('campus_changes_requested', 'finance_changes_requested') THEN
    RAISE EXCEPTION 'Only plans in changes_requested status can be resubmitted' USING errcode = '23514';
  END IF;

  SELECT * INTO v_school FROM schools WHERE id = v_plan.school_id;

  IF actor IS NOT NULL THEN
    SELECT role, campus_id INTO actor_role, actor_campus FROM public.users WHERE id = actor;
    IF NOT (
      actor_role IN ('super_admin')
      OR (actor_role IN ('exec_lead','campus_mgmt_admin','campus_lead')
          AND v_school.campus_id IS NOT DISTINCT FROM actor_campus)
    ) THEN
      RAISE EXCEPTION 'You do not have permission to resubmit execution plans for this school' USING errcode = '42501';
    END IF;
  END IF;

  -- Update existing plan row and reset status to submitted
  UPDATE school_execution_plans
     SET laptops_count = coalesce(p_laptops_count, 0),
         projectors_count = coalesce(p_projectors_count, 0),
         hdmi_cables_count = coalesce(p_hdmi_cables_count, 0),
         extension_boards_count = coalesce(p_extension_boards_count, 0),
         teaching_kits_count = coalesce(p_teaching_kits_count, 0),
         speakers_count = coalesce(p_speakers_count, 0),
         other_equipment = coalesce(nullif(trim(p_other_equipment),''), null),
         distance_km = p_distance_km,
         transport_mode = coalesce(nullif(trim(p_transport_mode),''), null),
         estimated_travel_cost = coalesce(p_estimated_travel_cost, 0),
         meeting_departure_notes = coalesce(nullif(trim(p_meeting_departure_notes),''), null),
         transport_budget = coalesce(p_transport_budget, 0),
         materials_budget = coalesce(p_materials_budget, 0),
         equipment_budget = coalesce(p_equipment_budget, 0),
         other_budget = coalesce(p_other_budget, 0),
         status = 'submitted',
         submitted_by = actor,
         submitted_at = now(),
         campus_reviewed_by = NULL, campus_reviewed_at = NULL, campus_comments = NULL,
         finance_reviewed_by = NULL, finance_reviewed_at = NULL, finance_comments = NULL,
         updated_at = now()
   WHERE id = p_plan_id;

  UPDATE schools
     SET operational_phase = 'execution_planning',
         updated_at = now()
   WHERE id = v_plan.school_id;

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'resubmit_school_execution_plan', 'school_execution_plan', p_plan_id,
          jsonb_build_object('school_id', v_plan.school_id, 'status', 'submitted'));

  RETURN p_plan_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.resubmit_school_execution_plan TO authenticated;


-- ─── 3. Full Synchronized Session Transition Trigger (Tasks 6 & 10) ───────────

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

  -- Execution plan gate:
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
         SET operational_phase = ('session_' || NEW.session_number || '_submitted')::operational_phase
       WHERE id = NEW.school_id AND status = 'sessions_active';
    END IF;
  END IF;

  -- Synchronize operational_phase when verified (Task 6)
  IF NEW.status = 'verified' AND OLD.status <> 'verified' THEN
    IF NEW.session_number IS NOT NULL THEN
      UPDATE schools
         SET operational_phase = ('session_' || NEW.session_number || '_verified')::operational_phase
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

COMMIT;
