-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0054 School Team & Execution Workflow
--
-- Implements the unified volunteer + school execution workflow:
--   1. school_team_members — persistent volunteer team per school
--   2. school_execution_plans — school-level execution plan with dual approval
--   3. session_participants — per-session volunteer participation (replaces
--      standalone attendance for the new workflow)
--   4. operational_phase on schools — sub-status tracking within sessions_active
--   5. Auto-progression triggers for business events
--
-- The existing outreach pipeline (lead_identified → registered) is untouched.
-- The existing session_assignments / attendance_records / execution_plans
-- tables remain for backward compatibility but are not used by the new
-- workflow for schools entering sessions_active after this migration.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─── 1. New enums ──────────────────────────────────────────────────────────

CREATE TYPE school_team_status AS ENUM (
  'requested',     -- volunteer has been asked about availability
  'available',     -- volunteer confirmed availability
  'unavailable',   -- volunteer declined availability
  'confirmed',     -- volunteer lead confirmed them on the team
  'replaced',      -- volunteer was replaced (historical record kept)
  'completed'      -- school completed, participation finalized
);

CREATE TYPE operational_phase AS ENUM (
  'team_preparation',
  'team_ready',
  'execution_planning',
  'execution_ready',
  'session_1_planning',
  'session_1_ready',
  'session_1_in_progress',
  'session_1_report_required',
  'session_1_submitted',
  'session_1_verified',
  'session_2_planning',
  'session_2_ready',
  'session_2_in_progress',
  'session_2_report_required',
  'session_2_submitted',
  'session_2_verified',
  'session_3_planning',
  'session_3_ready',
  'session_3_in_progress',
  'session_3_report_required',
  'session_3_submitted',
  'session_3_verified',
  'session_4_planning',
  'session_4_ready',
  'session_4_in_progress',
  'session_4_report_required',
  'session_4_submitted',
  'session_4_verified'
);

CREATE TYPE execution_plan_status AS ENUM (
  'draft',
  'submitted',
  'campus_changes_requested',
  'campus_approved',
  'finance_changes_requested',
  'approved'
);

-- ─── 2. Add columns to schools ─────────────────────────────────────────────

ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS required_volunteers integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS operational_phase operational_phase;

COMMENT ON COLUMN schools.required_volunteers IS 'Number of volunteers needed for this school (auto-calculated from onboarding, overridable)';
COMMENT ON COLUMN schools.operational_phase IS 'Detailed sub-phase within sessions_active — tracks team prep, execution planning, and session 1–4 progress';

-- ─── 3. school_team_members — persistent volunteer team ────────────────────

CREATE TABLE school_team_members (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id           uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  volunteer_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campus_id           uuid REFERENCES campuses(id) ON DELETE SET NULL,
  status              school_team_status NOT NULL DEFAULT 'requested',
  assigned_by         uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_at         timestamptz NOT NULL DEFAULT now(),
  responded_at        timestamptz,
  confirmed_at        timestamptz,
  replaced_at         timestamptz,
  replaced_by_member  uuid REFERENCES school_team_members(id) ON DELETE SET NULL,
  replacement_reason  text,
  is_active           boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE school_team_members IS 'Persistent volunteer team per school. Volunteers are assigned to the school, not to individual sessions (Unified Workflow v3).';

CREATE INDEX school_team_school_idx ON school_team_members (school_id);
CREATE INDEX school_team_volunteer_idx ON school_team_members (volunteer_id);
CREATE INDEX school_team_campus_idx ON school_team_members (campus_id);
CREATE INDEX school_team_active_idx ON school_team_members (school_id) WHERE is_active;

-- Prevent duplicate active assignments of the same volunteer to the same school
CREATE UNIQUE INDEX school_team_unique_active ON school_team_members (school_id, volunteer_id) WHERE is_active;

CREATE TRIGGER trg_school_team_updated
  BEFORE UPDATE ON school_team_members FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Keep campus_id in sync with the school
CREATE OR REPLACE FUNCTION public.set_school_team_campus()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.campus_id IS NULL THEN
    SELECT campus_id INTO NEW.campus_id FROM schools WHERE id = NEW.school_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_school_team_campus
  BEFORE INSERT OR UPDATE ON school_team_members
  FOR EACH ROW EXECUTE FUNCTION public.set_school_team_campus();

-- RLS
ALTER TABLE school_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY school_team_select ON school_team_members FOR SELECT TO authenticated
  USING (
    is_admin()
    OR volunteer_id = auth.uid()
    OR (auth_role() IN ('campus_lead','exec_lead','volunteer_lead','finance_lead','campus_mgmt_admin')
        AND campus_id = auth_campus())
  );

-- Volunteer Lead + Campus Lead + admin can manage team members
CREATE POLICY school_team_manage ON school_team_members FOR ALL TO authenticated
  USING (
    is_admin()
    OR (auth_role() IN ('campus_lead','volunteer_lead') AND campus_id = auth_campus())
  )
  WITH CHECK (
    is_admin()
    OR (auth_role() IN ('campus_lead','volunteer_lead') AND campus_id = auth_campus())
  );

-- Volunteers can update their own row (respond to availability)
CREATE POLICY school_team_respond ON school_team_members FOR UPDATE TO authenticated
  USING (volunteer_id = auth.uid())
  WITH CHECK (volunteer_id = auth.uid());

-- ─── 4. school_execution_plans — school-level execution plan ───────────────

CREATE TABLE school_execution_plans (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id               uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  campus_id               uuid REFERENCES campuses(id) ON DELETE SET NULL,

  -- Equipment to bring from campus
  laptops_count           integer NOT NULL DEFAULT 0 CHECK (laptops_count >= 0),
  projectors_count        integer NOT NULL DEFAULT 0 CHECK (projectors_count >= 0),
  hdmi_cables_count       integer NOT NULL DEFAULT 0 CHECK (hdmi_cables_count >= 0),
  extension_boards_count  integer NOT NULL DEFAULT 0 CHECK (extension_boards_count >= 0),
  teaching_kits_count     integer NOT NULL DEFAULT 0 CHECK (teaching_kits_count >= 0),
  speakers_count          integer NOT NULL DEFAULT 0 CHECK (speakers_count >= 0),
  other_equipment         text,

  -- Travel
  distance_km             numeric(8,2) CHECK (distance_km IS NULL OR distance_km >= 0),
  transport_mode          text,
  estimated_travel_cost   numeric(12,2) NOT NULL DEFAULT 0 CHECK (estimated_travel_cost >= 0),
  meeting_departure_notes text,

  -- Budget
  transport_budget        numeric(12,2) NOT NULL DEFAULT 0 CHECK (transport_budget >= 0),
  materials_budget        numeric(12,2) NOT NULL DEFAULT 0 CHECK (materials_budget >= 0),
  equipment_budget        numeric(12,2) NOT NULL DEFAULT 0 CHECK (equipment_budget >= 0),
  other_budget            numeric(12,2) NOT NULL DEFAULT 0 CHECK (other_budget >= 0),
  total_budget            numeric(12,2) GENERATED ALWAYS AS (
    transport_budget + materials_budget + equipment_budget + other_budget
  ) STORED,

  -- Approval flow
  status                  execution_plan_status NOT NULL DEFAULT 'draft',
  submitted_by            uuid REFERENCES users(id) ON DELETE SET NULL,
  submitted_at            timestamptz,
  campus_reviewed_by      uuid REFERENCES users(id) ON DELETE SET NULL,
  campus_reviewed_at      timestamptz,
  campus_comments         text,
  finance_reviewed_by     uuid REFERENCES users(id) ON DELETE SET NULL,
  finance_reviewed_at     timestamptz,
  finance_comments        text,

  created_by              uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE school_execution_plans IS 'School-level execution plan — created once per school, dual-approved by Campus Lead then Finance Lead (Unified Workflow v3).';

CREATE INDEX school_exec_plan_school_idx ON school_execution_plans (school_id);
CREATE INDEX school_exec_plan_campus_idx ON school_execution_plans (campus_id);
-- One plan per school (may be replaced by creating a new one after rejection)
CREATE UNIQUE INDEX school_exec_plan_one_active ON school_execution_plans (school_id)
  WHERE status NOT IN ('campus_changes_requested', 'finance_changes_requested');

CREATE TRIGGER trg_school_exec_plan_updated
  BEFORE UPDATE ON school_execution_plans FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Keep campus_id in sync with school
CREATE OR REPLACE FUNCTION public.set_school_exec_plan_campus()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.campus_id IS NULL THEN
    SELECT campus_id INTO NEW.campus_id FROM schools WHERE id = NEW.school_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_school_exec_plan_campus
  BEFORE INSERT OR UPDATE ON school_execution_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_school_exec_plan_campus();

-- RLS
ALTER TABLE school_execution_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY school_exec_plan_select ON school_execution_plans FOR SELECT TO authenticated
  USING (
    is_admin()
    OR (auth_role() IN ('campus_lead','exec_lead','finance_lead','campus_mgmt_admin','volunteer_lead')
        AND campus_id = auth_campus())
    OR created_by = auth.uid()
  );

-- Only admin and exec_lead can write (all review goes through RPCs)
CREATE POLICY school_exec_plan_write ON school_execution_plans FOR ALL TO authenticated
  USING (
    is_admin()
    OR (auth_role() = 'exec_lead' AND campus_id = auth_campus())
  )
  WITH CHECK (
    is_admin()
    OR (auth_role() = 'exec_lead' AND campus_id = auth_campus())
  );

-- ─── 5. session_participants — per-session volunteer participation ─────────

CREATE TABLE session_participants (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id              uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  school_team_member_id   uuid NOT NULL REFERENCES school_team_members(id) ON DELETE CASCADE,
  volunteer_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participated            boolean NOT NULL DEFAULT false,
  notes                   text,
  marked_by               uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, volunteer_id)
);

COMMENT ON TABLE session_participants IS 'Per-session volunteer participation — replaces standalone attendance for the unified workflow. Populated from school_team_members.';

CREATE INDEX session_participants_session_idx ON session_participants (session_id);
CREATE INDEX session_participants_volunteer_idx ON session_participants (volunteer_id);

-- RLS
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY session_participants_select ON session_participants FOR SELECT TO authenticated
  USING (
    is_admin()
    OR volunteer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM sessions s
       WHERE s.id = session_participants.session_id
         AND s.campus_id = auth_campus()
         AND auth_role() IN ('campus_lead','exec_lead','volunteer_lead','finance_lead','campus_mgmt_admin')
    )
  );

CREATE POLICY session_participants_manage ON session_participants FOR ALL TO authenticated
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM sessions s
       WHERE s.id = session_participants.session_id
         AND s.campus_id = auth_campus()
         AND auth_role() IN ('campus_lead','exec_lead')
    )
  )
  WITH CHECK (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM sessions s
       WHERE s.id = session_participants.session_id
         AND s.campus_id = auth_campus()
         AND auth_role() IN ('campus_lead','exec_lead')
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════
-- RPC FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── request_school_team_availability() ────────────────────────────────────
-- Volunteer Lead selects volunteers for a school team, sends availability
-- requests. Updates schools.required_volunteers if provided.

CREATE OR REPLACE FUNCTION public.request_school_team_availability(
  p_school_id uuid,
  p_volunteer_ids uuid[],
  p_required_volunteers integer DEFAULT NULL
) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_school      schools;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
  v_new_id      uuid;
  v_count       int := 0;
  vid           uuid;
  v_school_name text;
BEGIN
  SELECT * INTO v_school FROM schools WHERE id = p_school_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'School % not found', p_school_id; END IF;

  IF v_school.status <> 'sessions_active' THEN
    RAISE EXCEPTION 'School must be Active before building a team' USING errcode = '42501';
  END IF;

  IF actor IS NOT NULL THEN
    SELECT role, campus_id INTO actor_role, actor_campus FROM public.users WHERE id = actor;
    IF NOT (
      actor_role IN ('super_admin')
      OR (actor_role IN ('campus_lead','volunteer_lead')
          AND v_school.campus_id IS NOT DISTINCT FROM actor_campus)
    ) THEN
      RAISE EXCEPTION 'You do not have permission to manage this school''s team' USING errcode = '42501';
    END IF;
  END IF;

  -- Update required_volunteers if provided
  IF p_required_volunteers IS NOT NULL AND p_required_volunteers > 0 THEN
    UPDATE schools SET required_volunteers = p_required_volunteers WHERE id = p_school_id;
  END IF;

  -- Ensure operational_phase is set
  IF v_school.operational_phase IS NULL OR v_school.operational_phase = 'team_preparation' THEN
    UPDATE schools SET operational_phase = 'team_preparation' WHERE id = p_school_id AND operational_phase IS NULL;
  END IF;

  v_school_name := v_school.name;

  FOREACH vid IN ARRAY coalesce(p_volunteer_ids, '{}')
  LOOP
    INSERT INTO school_team_members (school_id, volunteer_id, assigned_by, status)
    VALUES (p_school_id, vid, actor, 'requested')
    ON CONFLICT (school_id, volunteer_id) WHERE is_active DO NOTHING
    RETURNING id INTO v_new_id;

    IF v_new_id IS NOT NULL THEN
      v_count := v_count + 1;
      -- Notify volunteer
      PERFORM notify_user(
        vid,
        'school_team_availability_requested',
        'Availability request: ' || v_school_name,
        'You have been requested for availability for ' || v_school_name || '. Please confirm.',
        '/dashboard/assignments',
        'school',
        p_school_id
      );
    END IF;
  END LOOP;

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'school_team_availability_requested', 'school', p_school_id,
          jsonb_build_object('volunteers_requested', v_count, 'required_volunteers', p_required_volunteers));

  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.request_school_team_availability(uuid, uuid[], integer) IS
  'Volunteer Lead requests availability from volunteers for a school team (Unified Workflow v3).';
GRANT EXECUTE ON FUNCTION public.request_school_team_availability(uuid, uuid[], integer) TO authenticated;


-- ─── respond_school_team_availability() ────────────────────────────────────
-- Volunteer responds available/unavailable for a school.

CREATE OR REPLACE FUNCTION public.respond_school_team_availability(
  p_member_id uuid,
  p_available boolean,
  p_note text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_member      school_team_members;
  v_school_name text;
  v_vol_name    text;
  actor         uuid := auth.uid();
  rec           record;
BEGIN
  SELECT * INTO v_member FROM school_team_members WHERE id = p_member_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Team member record not found'; END IF;

  IF actor IS NOT NULL AND v_member.volunteer_id <> actor THEN
    RAISE EXCEPTION 'You can only respond to your own availability request' USING errcode = '42501';
  END IF;

  IF v_member.status NOT IN ('requested') THEN
    RAISE EXCEPTION 'You have already responded to this request';
  END IF;

  UPDATE school_team_members
     SET status = CASE WHEN p_available THEN 'available'::school_team_status ELSE 'unavailable'::school_team_status END,
         responded_at = now(),
         replacement_reason = CASE WHEN NOT p_available THEN nullif(trim(p_note), '') ELSE NULL END
   WHERE id = p_member_id;

  SELECT name INTO v_school_name FROM schools WHERE id = v_member.school_id;
  SELECT full_name INTO v_vol_name FROM users WHERE id = v_member.volunteer_id;

  -- Notify volunteer lead + assigner
  FOR rec IN
    SELECT DISTINCT u.id
      FROM public.users u
     WHERE u.is_active
       AND (u.id = v_member.assigned_by
            OR (u.role = 'volunteer_lead' AND u.campus_id IS NOT DISTINCT FROM v_member.campus_id))
  LOOP
    PERFORM notify_user(
      rec.id,
      CASE WHEN p_available THEN 'school_team_available' ELSE 'school_team_unavailable' END,
      coalesce(v_vol_name, 'A volunteer') || ' is ' || CASE WHEN p_available THEN 'available' ELSE 'unavailable' END,
      coalesce(v_school_name, 'A school') || CASE WHEN p_note IS NOT NULL AND trim(p_note) <> '' THEN ' — "' || trim(p_note) || '"' ELSE '' END,
      '/dashboard/schools/' || v_member.school_id,
      'school',
      v_member.school_id
    );
  END LOOP;

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'school_team_availability_response', 'school', v_member.school_id,
          jsonb_build_object('volunteer_id', v_member.volunteer_id, 'available', p_available, 'note', p_note));
END;
$$;

COMMENT ON FUNCTION public.respond_school_team_availability(uuid, boolean, text) IS
  'Volunteer responds available/unavailable for a school team request (Unified Workflow v3).';
GRANT EXECUTE ON FUNCTION public.respond_school_team_availability(uuid, boolean, text) TO authenticated;


-- ─── confirm_school_team() ─────────────────────────────────────────────────
-- Volunteer Lead confirms the school team from available volunteers.
-- Auto-progresses to team_ready when confirmed >= required.

CREATE OR REPLACE FUNCTION public.confirm_school_team(
  p_school_id uuid,
  p_member_ids uuid[]  -- IDs of school_team_members to confirm
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_school       schools;
  actor          uuid := auth.uid();
  actor_role     user_role;
  actor_campus   uuid;
  v_confirmed    integer;
  v_required     integer;
  mid            uuid;
BEGIN
  SELECT * INTO v_school FROM schools WHERE id = p_school_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'School % not found', p_school_id; END IF;

  IF actor IS NOT NULL THEN
    SELECT role, campus_id INTO actor_role, actor_campus FROM public.users WHERE id = actor;
    IF NOT (
      actor_role IN ('super_admin')
      OR (actor_role IN ('campus_lead','volunteer_lead')
          AND v_school.campus_id IS NOT DISTINCT FROM actor_campus)
    ) THEN
      RAISE EXCEPTION 'You do not have permission to confirm this school''s team' USING errcode = '42501';
    END IF;
  END IF;

  -- Confirm each member
  FOREACH mid IN ARRAY coalesce(p_member_ids, '{}')
  LOOP
    UPDATE school_team_members
       SET status = 'confirmed', confirmed_at = now()
     WHERE id = mid AND school_id = p_school_id AND status = 'available';
  END LOOP;

  -- Check if team is complete
  SELECT count(*) INTO v_confirmed
    FROM school_team_members
   WHERE school_id = p_school_id AND status = 'confirmed' AND is_active;

  v_required := v_school.required_volunteers;

  -- Auto-progress to team_ready if enough volunteers confirmed
  IF v_required > 0 AND v_confirmed >= v_required THEN
    UPDATE schools SET operational_phase = 'team_ready' WHERE id = p_school_id;

    INSERT INTO school_status_history (school_id, previous_status, new_status, changed_by, note)
    VALUES (p_school_id, 'sessions_active', 'sessions_active', actor,
            'Team confirmed: ' || v_confirmed || '/' || v_required || ' volunteers ready');

    INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
    VALUES (actor, 'school_team_confirmed', 'school', p_school_id,
            jsonb_build_object('confirmed', v_confirmed, 'required', v_required, 'phase', 'team_ready'));

    -- Notify exec leads
    FOR mid IN
      SELECT id FROM public.users
       WHERE is_active AND role = 'exec_lead'
         AND campus_id IS NOT DISTINCT FROM v_school.campus_id
    LOOP
      PERFORM notify_user(
        mid,
        'school_team_ready',
        'Team ready: ' || v_school.name,
        v_confirmed || ' volunteers confirmed. The school is ready for execution planning.',
        '/dashboard/schools/' || p_school_id,
        'school',
        p_school_id
      );
    END LOOP;
  ELSE
    INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
    VALUES (actor, 'school_team_partial_confirm', 'school', p_school_id,
            jsonb_build_object('confirmed', v_confirmed, 'required', v_required));
  END IF;
END;
$$;

COMMENT ON FUNCTION public.confirm_school_team(uuid, uuid[]) IS
  'Volunteer Lead confirms school team members; auto-progresses to team_ready when count meets requirement (Unified Workflow v3).';
GRANT EXECUTE ON FUNCTION public.confirm_school_team(uuid, uuid[]) TO authenticated;


-- ─── replace_school_team_member() ──────────────────────────────────────────
-- Replace a team member (preserving history)

CREATE OR REPLACE FUNCTION public.replace_school_team_member(
  p_member_id uuid,
  p_replacement_volunteer_id uuid,
  p_reason text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_member      school_team_members;
  v_school      schools;
  v_new_id      uuid;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
BEGIN
  SELECT * INTO v_member FROM school_team_members WHERE id = p_member_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Team member record not found'; END IF;

  SELECT * INTO v_school FROM schools WHERE id = v_member.school_id;

  IF actor IS NOT NULL THEN
    SELECT role, campus_id INTO actor_role, actor_campus FROM public.users WHERE id = actor;
    IF NOT (
      actor_role IN ('super_admin')
      OR (actor_role IN ('campus_lead','volunteer_lead')
          AND v_school.campus_id IS NOT DISTINCT FROM actor_campus)
    ) THEN
      RAISE EXCEPTION 'You do not have permission to replace team members' USING errcode = '42501';
    END IF;
  END IF;

  -- Mark old member as replaced (keep history)
  UPDATE school_team_members
     SET status = 'replaced', is_active = false, replaced_at = now(),
         replacement_reason = coalesce(nullif(trim(p_reason), ''), 'Replaced by volunteer lead')
   WHERE id = p_member_id;

  -- Create new member
  INSERT INTO school_team_members (school_id, volunteer_id, campus_id, assigned_by, status, replaced_by_member)
  VALUES (v_member.school_id, p_replacement_volunteer_id, v_member.campus_id, actor, 'requested', NULL)
  RETURNING id INTO v_new_id;

  -- Link the old member to the new one
  UPDATE school_team_members SET replaced_by_member = v_new_id WHERE id = p_member_id;

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'school_team_member_replaced', 'school', v_member.school_id,
          jsonb_build_object('replaced_member_id', p_member_id, 'new_member_id', v_new_id,
                              'old_volunteer_id', v_member.volunteer_id, 'new_volunteer_id', p_replacement_volunteer_id,
                              'reason', p_reason));

  -- Notify the new volunteer
  PERFORM notify_user(
    p_replacement_volunteer_id,
    'school_team_availability_requested',
    'Availability request: ' || v_school.name,
    'You have been requested for availability for ' || v_school.name || '. Please confirm.',
    '/dashboard/assignments',
    'school',
    v_member.school_id
  );

  RETURN v_new_id;
END;
$$;

COMMENT ON FUNCTION public.replace_school_team_member(uuid, uuid, text) IS
  'Replace a school team member, preserving the original member''s history (Unified Workflow v3).';
GRANT EXECUTE ON FUNCTION public.replace_school_team_member(uuid, uuid, text) TO authenticated;


-- ─── submit_school_execution_plan() ────────────────────────────────────────
-- Execution Lead creates/submits a school-level execution plan.

CREATE OR REPLACE FUNCTION public.submit_school_execution_plan(
  p_school_id uuid,
  p_laptops_count integer DEFAULT 0,
  p_projectors_count integer DEFAULT 0,
  p_hdmi_cables_count integer DEFAULT 0,
  p_extension_boards_count integer DEFAULT 0,
  p_teaching_kits_count integer DEFAULT 0,
  p_speakers_count integer DEFAULT 0,
  p_other_equipment text DEFAULT NULL,
  p_distance_km numeric DEFAULT NULL,
  p_transport_mode text DEFAULT NULL,
  p_estimated_travel_cost numeric DEFAULT 0,
  p_meeting_departure_notes text DEFAULT NULL,
  p_transport_budget numeric DEFAULT 0,
  p_materials_budget numeric DEFAULT 0,
  p_equipment_budget numeric DEFAULT 0,
  p_other_budget numeric DEFAULT 0
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_school      schools;
  v_id          uuid;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
  rec           record;
BEGIN
  SELECT * INTO v_school FROM schools WHERE id = p_school_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'School % not found', p_school_id; END IF;

  IF v_school.status <> 'sessions_active' THEN
    RAISE EXCEPTION 'School must be Active before submitting an execution plan' USING errcode = '42501';
  END IF;

  IF v_school.operational_phase NOT IN ('team_ready', 'execution_planning') THEN
    RAISE EXCEPTION 'School team must be ready before creating an execution plan' USING errcode = '42501';
  END IF;

  IF actor IS NOT NULL THEN
    SELECT role, campus_id INTO actor_role, actor_campus FROM public.users WHERE id = actor;
    IF NOT (
      actor_role IN ('super_admin')
      OR (actor_role = 'exec_lead' AND v_school.campus_id IS NOT DISTINCT FROM actor_campus)
    ) THEN
      RAISE EXCEPTION 'You do not have permission to submit an execution plan for this school' USING errcode = '42501';
    END IF;
  END IF;

  INSERT INTO school_execution_plans (
    school_id, campus_id,
    laptops_count, projectors_count, hdmi_cables_count, extension_boards_count,
    teaching_kits_count, speakers_count, other_equipment,
    distance_km, transport_mode, estimated_travel_cost, meeting_departure_notes,
    transport_budget, materials_budget, equipment_budget, other_budget,
    status, submitted_by, submitted_at, created_by
  ) VALUES (
    p_school_id, v_school.campus_id,
    coalesce(p_laptops_count, 0), coalesce(p_projectors_count, 0), coalesce(p_hdmi_cables_count, 0),
    coalesce(p_extension_boards_count, 0), coalesce(p_teaching_kits_count, 0), coalesce(p_speakers_count, 0),
    nullif(trim(p_other_equipment), ''),
    p_distance_km, nullif(trim(p_transport_mode), ''), coalesce(p_estimated_travel_cost, 0),
    nullif(trim(p_meeting_departure_notes), ''),
    coalesce(p_transport_budget, 0), coalesce(p_materials_budget, 0),
    coalesce(p_equipment_budget, 0), coalesce(p_other_budget, 0),
    'submitted', actor, now(), actor
  )
  RETURNING id INTO v_id;

  UPDATE schools SET operational_phase = 'execution_planning' WHERE id = p_school_id;

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'school_execution_plan_submitted', 'school_execution_plan', v_id,
          jsonb_build_object('school_id', p_school_id));

  -- Notify campus leads
  FOR rec IN
    SELECT id FROM public.users
     WHERE is_active AND role = 'campus_lead'
       AND campus_id IS NOT DISTINCT FROM v_school.campus_id
  LOOP
    PERFORM notify_user(
      rec.id,
      'school_execution_plan_submitted',
      'Execution plan submitted: ' || v_school.name,
      'An execution plan needs your review.',
      '/dashboard/schools/' || p_school_id,
      'school',
      p_school_id
    );
  END LOOP;

  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION public.submit_school_execution_plan IS
  'Execution Lead submits a school-level execution plan; notifies Campus Lead (Unified Workflow v3).';
GRANT EXECUTE ON FUNCTION public.submit_school_execution_plan TO authenticated;


-- ─── review_school_execution_plan_campus() ─────────────────────────────────

CREATE OR REPLACE FUNCTION public.review_school_execution_plan_campus(
  p_plan_id uuid,
  p_decision text,  -- 'approved' or 'changes_requested'
  p_comments text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_plan       school_execution_plans;
  v_school     schools;
  actor        uuid := auth.uid();
  actor_role   user_role;
  actor_campus uuid;
  rec          record;
BEGIN
  IF p_decision NOT IN ('approved', 'changes_requested') THEN
    RAISE EXCEPTION 'Decision must be approved or changes_requested';
  END IF;

  SELECT * INTO v_plan FROM school_execution_plans WHERE id = p_plan_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Execution plan not found'; END IF;

  IF v_plan.status <> 'submitted' THEN
    RAISE EXCEPTION 'This plan is not awaiting campus review' USING errcode = '23514';
  END IF;

  IF actor IS NOT NULL THEN
    SELECT role, campus_id INTO actor_role, actor_campus FROM public.users WHERE id = actor;
    IF NOT (
      actor_role IN ('super_admin')
      OR (actor_role = 'campus_lead' AND v_plan.campus_id IS NOT DISTINCT FROM actor_campus)
    ) THEN
      RAISE EXCEPTION 'You do not have permission to review this plan' USING errcode = '42501';
    END IF;
  END IF;

  IF p_decision = 'changes_requested' AND coalesce(trim(p_comments), '') = '' THEN
    RAISE EXCEPTION 'Comments are required when requesting changes' USING errcode = '23514';
  END IF;

  UPDATE school_execution_plans
     SET status = CASE p_decision WHEN 'approved' THEN 'campus_approved'::execution_plan_status ELSE 'campus_changes_requested'::execution_plan_status END,
         campus_reviewed_by = actor, campus_reviewed_at = now(),
         campus_comments = nullif(trim(p_comments), '')
   WHERE id = p_plan_id;

  SELECT * INTO v_school FROM schools WHERE id = v_plan.school_id;

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'school_execution_plan_campus_review', 'school_execution_plan', p_plan_id,
          jsonb_build_object('decision', p_decision, 'comments', p_comments));

  IF p_decision = 'approved' THEN
    -- Forward to finance lead
    FOR rec IN
      SELECT id FROM public.users
       WHERE is_active AND role = 'finance_lead'
         AND campus_id IS NOT DISTINCT FROM v_plan.campus_id
    LOOP
      PERFORM notify_user(
        rec.id,
        'school_execution_plan_forwarded_finance',
        'Execution plan ready for finance review: ' || v_school.name,
        'The Campus Lead approved this plan. It needs your budget review.',
        '/dashboard/schools/' || v_plan.school_id,
        'school',
        v_plan.school_id
      );
    END LOOP;
  END IF;

  -- Notify submitter
  IF v_plan.submitted_by IS NOT NULL THEN
    PERFORM notify_user(
      v_plan.submitted_by,
      'school_execution_plan_campus_' || p_decision,
      'Campus Lead ' || CASE p_decision WHEN 'approved' THEN 'approved' ELSE 'requested changes on' END || ' your execution plan',
      CASE p_decision WHEN 'approved' THEN 'Forwarded to Finance Lead for review.' ELSE coalesce('Comments: ' || p_comments, 'No comments.') END,
      '/dashboard/schools/' || v_plan.school_id,
      'school',
      v_plan.school_id
    );
  END IF;
END;
$$;

COMMENT ON FUNCTION public.review_school_execution_plan_campus(uuid, text, text) IS
  'Campus Lead reviews school execution plan; on approval, forwards to Finance Lead (Unified Workflow v3).';
GRANT EXECUTE ON FUNCTION public.review_school_execution_plan_campus(uuid, text, text) TO authenticated;


-- ─── review_school_execution_plan_finance() ────────────────────────────────

CREATE OR REPLACE FUNCTION public.review_school_execution_plan_finance(
  p_plan_id uuid,
  p_decision text,  -- 'approved' or 'changes_requested'
  p_comments text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_plan       school_execution_plans;
  v_school     schools;
  actor        uuid := auth.uid();
  actor_role   user_role;
  actor_campus uuid;
BEGIN
  IF p_decision NOT IN ('approved', 'changes_requested') THEN
    RAISE EXCEPTION 'Decision must be approved or changes_requested';
  END IF;

  SELECT * INTO v_plan FROM school_execution_plans WHERE id = p_plan_id FOR UPDATE;
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

  UPDATE school_execution_plans
     SET status = CASE p_decision WHEN 'approved' THEN 'approved'::execution_plan_status ELSE 'finance_changes_requested'::execution_plan_status END,
         finance_reviewed_by = actor, finance_reviewed_at = now(),
         finance_comments = nullif(trim(p_comments), '')
   WHERE id = p_plan_id;

  SELECT * INTO v_school FROM schools WHERE id = v_plan.school_id;

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'school_execution_plan_finance_review', 'school_execution_plan', p_plan_id,
          jsonb_build_object('decision', p_decision, 'comments', p_comments));

  -- Auto-progress to execution_ready on full approval
  IF p_decision = 'approved' THEN
    UPDATE schools SET operational_phase = 'execution_ready' WHERE id = v_plan.school_id;

    INSERT INTO school_status_history (school_id, previous_status, new_status, changed_by, note)
    VALUES (v_plan.school_id, 'sessions_active', 'sessions_active', actor,
            'Execution plan fully approved — school is execution-ready');

    INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
    VALUES (actor, 'school_execution_ready', 'school', v_plan.school_id,
            jsonb_build_object('plan_id', p_plan_id, 'phase', 'execution_ready'));
  END IF;

  -- Notify submitter
  IF v_plan.submitted_by IS NOT NULL THEN
    PERFORM notify_user(
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

COMMENT ON FUNCTION public.review_school_execution_plan_finance(uuid, text, text) IS
  'Finance Lead reviews school execution plan budget; auto-progresses to execution_ready on approval (Unified Workflow v3).';
GRANT EXECUTE ON FUNCTION public.review_school_execution_plan_finance(uuid, text, text) TO authenticated;


-- ─── Update approve_session_plan to set operational_phase ──────────────────
-- When onboarding is approved and school becomes sessions_active, set
-- operational_phase to team_preparation and compute required_volunteers.

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

  -- Mark plan as approved
  UPDATE session_plans
     SET status = 'approved', approved_by = actor, approved_at = now()
   WHERE id = p_plan_id;

  -- Compute required volunteers: recommended_fellows from onboarding, minimum 2
  v_required := GREATEST(coalesce(v_plan.recommended_fellows, 2), 2);

  -- Transition to sessions_active + set operational_phase + required_volunteers
  PERFORM change_school_status(
    v_plan.school_id, 'sessions_active',
    'Onboarding approved'
  );

  UPDATE schools
     SET operational_phase = 'team_preparation',
         required_volunteers = v_required
   WHERE id = v_plan.school_id;

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'onboarding_approved_team_prep', 'school', v_plan.school_id,
          jsonb_build_object('plan_id', p_plan_id, 'required_volunteers', v_required, 'phase', 'team_preparation'));

  -- Notify volunteer leads to start team building
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


-- ─── Auto-complete school when Session 4 is verified ───────────────────────
-- Trigger on sessions table: when a session with session_number = 4 is verified,
-- check if all 4 sessions are verified and auto-complete the school.

CREATE OR REPLACE FUNCTION public.check_school_completion()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_verified_count integer;
  v_school         schools;
BEGIN
  -- Only fire when a session moves TO verified status
  IF NEW.status <> 'verified' OR OLD.status = 'verified' THEN
    RETURN NEW;
  END IF;

  -- Count verified sessions for this school
  SELECT count(*) INTO v_verified_count
    FROM sessions
   WHERE school_id = NEW.school_id
     AND status = 'verified';

  -- Auto-complete school when 4 sessions are verified
  IF v_verified_count >= 4 THEN
    SELECT * INTO v_school FROM schools WHERE id = NEW.school_id;
    IF v_school.status = 'sessions_active' THEN
      UPDATE schools SET status = 'completed', operational_phase = NULL WHERE id = NEW.school_id;

      INSERT INTO school_status_history (school_id, previous_status, new_status, changed_by, note)
      VALUES (NEW.school_id, 'sessions_active', 'completed', auth.uid(),
              'All 4 sessions verified — school program completed');

      INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
      VALUES (auth.uid(), 'school_auto_completed', 'school', NEW.school_id,
              jsonb_build_object('verified_sessions', v_verified_count, 'trigger', 'session_verified'));

      -- Mark all team members as completed
      UPDATE school_team_members
         SET status = 'completed'
       WHERE school_id = NEW.school_id AND is_active AND status = 'confirmed';
    END IF;
  END IF;

  -- Update operational_phase for session progress
  IF NEW.session_number IS NOT NULL AND NEW.session_number < 4 THEN
    -- Unlock next session planning
    UPDATE schools
       SET operational_phase = ('session_' || (NEW.session_number + 1) || '_planning')::operational_phase
     WHERE id = NEW.school_id AND status = 'sessions_active';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_school_completion
  AFTER UPDATE ON sessions
  FOR EACH ROW
  WHEN (NEW.status = 'verified' AND OLD.status IS DISTINCT FROM 'verified')
  EXECUTE FUNCTION public.check_school_completion();


COMMIT;
