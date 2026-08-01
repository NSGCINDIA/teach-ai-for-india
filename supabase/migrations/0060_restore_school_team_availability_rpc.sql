-- Restores the availability-request RPC for projects where the school-team
-- workflow was only partially applied. Parameter names intentionally match
-- the JSON keys sent by supabase.rpc() exactly.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'school_team_status') THEN
    CREATE TYPE public.school_team_status AS ENUM (
      'requested', 'available', 'unavailable', 'confirmed', 'replaced', 'completed'
    );
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.school_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  volunteer_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  campus_id uuid REFERENCES public.campuses(id) ON DELETE SET NULL,
  status public.school_team_status NOT NULL DEFAULT 'requested',
  assigned_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  confirmed_at timestamptz,
  replaced_at timestamptz,
  replaced_by_member uuid REFERENCES public.school_team_members(id) ON DELETE SET NULL,
  replacement_reason text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Upgrade a partially-created legacy table before creating indexes or the RPC.
ALTER TABLE public.school_team_members
  ADD COLUMN IF NOT EXISTS campus_id uuid REFERENCES public.campuses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS responded_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS replaced_at timestamptz,
  ADD COLUMN IF NOT EXISTS replaced_by_member uuid REFERENCES public.school_team_members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS replacement_reason text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Legacy deployments used a text CHECK constraint with a different set of
-- statuses (for example, pending/accepted). Normalize it to this workflow's
-- lifecycle before the RPC inserts its first `requested` row.
ALTER TABLE public.school_team_members
  DROP CONSTRAINT IF EXISTS school_team_members_status_check,
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.school_team_members
  ALTER COLUMN status TYPE text USING status::text;

UPDATE public.school_team_members
   SET status = CASE lower(trim(coalesce(status, '')))
     WHEN 'pending' THEN 'requested'
     WHEN 'requested' THEN 'requested'
     WHEN 'accepted' THEN 'available'
     WHEN 'available' THEN 'available'
     WHEN 'declined' THEN 'unavailable'
     WHEN 'rejected' THEN 'unavailable'
     WHEN 'unavailable' THEN 'unavailable'
     WHEN 'assigned' THEN 'confirmed'
     WHEN 'confirmed' THEN 'confirmed'
     WHEN 'replaced' THEN 'replaced'
     WHEN 'completed' THEN 'completed'
     ELSE 'requested'
   END;

ALTER TABLE public.school_team_members
  ALTER COLUMN status SET DEFAULT 'requested',
  ALTER COLUMN status SET NOT NULL,
  ADD CONSTRAINT school_team_members_status_check
    CHECK (status IN ('requested', 'available', 'unavailable', 'confirmed', 'replaced', 'completed'));

-- A partial legacy setup may contain duplicate active rows. Preserve the most
-- recently updated entry and archive the older duplicates so the unique index
-- used by the idempotent request RPC can be created.
WITH ranked_active_members AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY school_id, volunteer_id
           ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
         ) AS row_number
  FROM public.school_team_members
  WHERE is_active
)
UPDATE public.school_team_members member
   SET is_active = false, updated_at = now()
  FROM ranked_active_members ranked
 WHERE member.id = ranked.id AND ranked.row_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS school_team_unique_active
  ON public.school_team_members (school_id, volunteer_id) WHERE is_active;

ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS required_volunteers integer NOT NULL DEFAULT 0;

ALTER TABLE public.school_team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS school_team_select ON public.school_team_members;
CREATE POLICY school_team_select ON public.school_team_members FOR SELECT TO authenticated
  USING (
    is_admin()
    OR volunteer_id = auth.uid()
    OR (auth_role() IN ('campus_lead', 'exec_lead', 'volunteer_lead', 'finance_lead', 'campus_mgmt_admin')
        AND campus_id = auth_campus())
  );

DROP POLICY IF EXISTS school_team_manage ON public.school_team_members;
CREATE POLICY school_team_manage ON public.school_team_members FOR ALL TO authenticated
  USING (is_admin() OR (auth_role() IN ('campus_lead', 'volunteer_lead') AND campus_id = auth_campus()))
  WITH CHECK (is_admin() OR (auth_role() IN ('campus_lead', 'volunteer_lead') AND campus_id = auth_campus()));

DROP POLICY IF EXISTS school_team_respond ON public.school_team_members;
CREATE POLICY school_team_respond ON public.school_team_members FOR UPDATE TO authenticated
  USING (volunteer_id = auth.uid())
  WITH CHECK (volunteer_id = auth.uid());

CREATE OR REPLACE FUNCTION public.request_school_team_availability(
  p_school_id uuid,
  p_volunteer_ids uuid[],
  p_required_volunteers integer DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school schools;
  v_actor uuid := auth.uid();
  v_actor_role user_role;
  v_actor_campus uuid;
  v_new_id uuid;
  v_count integer := 0;
  v_volunteer_id uuid;
BEGIN
  IF p_school_id IS NULL OR coalesce(array_length(p_volunteer_ids, 1), 0) = 0 THEN
    RAISE EXCEPTION 'A school and at least one volunteer are required' USING errcode = '22023';
  END IF;

  SELECT * INTO v_school FROM public.schools WHERE id = p_school_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'School % not found', p_school_id USING errcode = 'P0002';
  END IF;
  IF v_school.status <> 'sessions_active' THEN
    RAISE EXCEPTION 'School must be Active before building a team' USING errcode = '42501';
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

  IF p_required_volunteers IS NOT NULL THEN
    IF p_required_volunteers < 1 THEN
      RAISE EXCEPTION 'Required volunteers must be at least 1' USING errcode = '22023';
    END IF;
    UPDATE public.schools
       SET required_volunteers = p_required_volunteers, updated_at = now()
     WHERE id = p_school_id;
  END IF;

  FOREACH v_volunteer_id IN ARRAY p_volunteer_ids
  LOOP
    INSERT INTO public.school_team_members (school_id, volunteer_id, campus_id, assigned_by, status)
    VALUES (p_school_id, v_volunteer_id, v_school.campus_id, v_actor, 'requested')
    ON CONFLICT (school_id, volunteer_id) WHERE is_active DO NOTHING
    RETURNING id INTO v_new_id;

    IF v_new_id IS NOT NULL THEN
      v_count := v_count + 1;
      PERFORM public.notify_user(
        v_volunteer_id,
        'school_team_availability_requested',
        'Availability request: ' || v_school.name,
        'You have been requested for availability for ' || v_school.name || '. Please confirm.',
        '/dashboard/assignments',
        'school',
        p_school_id
      );
    END IF;
  END LOOP;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (
    v_actor,
    'school_team_availability_requested',
    'school',
    p_school_id,
    jsonb_build_object('volunteers_requested', v_count, 'required_volunteers', p_required_volunteers)
  );

  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.respond_school_team_availability(
  p_member_id uuid,
  p_available boolean,
  p_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member public.school_team_members;
  v_actor uuid := auth.uid();
BEGIN
  SELECT * INTO v_member FROM public.school_team_members WHERE id = p_member_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Team member record not found' USING errcode = 'P0002';
  END IF;
  IF v_actor IS NULL OR v_member.volunteer_id <> v_actor THEN
    RAISE EXCEPTION 'You can only respond to your own availability request' USING errcode = '42501';
  END IF;
  IF v_member.status <> 'requested' THEN
    RAISE EXCEPTION 'You have already responded to this request' USING errcode = '23514';
  END IF;

  UPDATE public.school_team_members
     SET status = CASE WHEN p_available THEN 'available' ELSE 'unavailable' END,
         responded_at = now(),
         replacement_reason = CASE WHEN p_available THEN NULL ELSE nullif(trim(p_note), '') END,
         updated_at = now()
   WHERE id = p_member_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (v_actor, 'school_team_availability_response', 'school', v_member.school_id,
          jsonb_build_object('volunteer_id', v_member.volunteer_id, 'available', p_available, 'note', p_note));
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_school_team(
  p_school_id uuid,
  p_member_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school public.schools;
  v_actor uuid := auth.uid();
  v_actor_role user_role;
  v_actor_campus uuid;
  v_confirmed integer;
BEGIN
  SELECT * INTO v_school FROM public.schools WHERE id = p_school_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'School % not found', p_school_id; END IF;
  SELECT role, campus_id INTO v_actor_role, v_actor_campus FROM public.users WHERE id = v_actor;
  IF v_actor IS NULL OR NOT (
    v_actor_role = 'super_admin' OR
    (v_actor_role IN ('campus_lead', 'volunteer_lead') AND v_school.campus_id IS NOT DISTINCT FROM v_actor_campus)
  ) THEN
    RAISE EXCEPTION 'You do not have permission to confirm this school''s team' USING errcode = '42501';
  END IF;

  UPDATE public.school_team_members
     SET status = 'confirmed', confirmed_at = now(), updated_at = now()
   WHERE id = ANY(coalesce(p_member_ids, '{}'))
     AND school_id = p_school_id
     AND status = 'available'
     AND is_active;

  SELECT count(*) INTO v_confirmed FROM public.school_team_members
   WHERE school_id = p_school_id AND status = 'confirmed' AND is_active;

  IF v_confirmed > 0 AND (v_school.required_volunteers = 0 OR v_confirmed >= v_school.required_volunteers) THEN
    UPDATE public.schools SET operational_phase = 'team_ready' WHERE id = p_school_id;
  END IF;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (v_actor, 'school_team_confirmed', 'school', p_school_id,
          jsonb_build_object('confirmed', v_confirmed, 'required', v_school.required_volunteers));
END;
$$;

CREATE OR REPLACE FUNCTION public.replace_school_team_member(
  p_member_id uuid,
  p_replacement_volunteer_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member public.school_team_members;
  v_school public.schools;
  v_actor uuid := auth.uid();
  v_actor_role user_role;
  v_actor_campus uuid;
  v_new_member_id uuid;
BEGIN
  SELECT * INTO v_member FROM public.school_team_members WHERE id = p_member_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Team member record not found' USING errcode = 'P0002'; END IF;
  SELECT * INTO v_school FROM public.schools WHERE id = v_member.school_id;
  SELECT role, campus_id INTO v_actor_role, v_actor_campus FROM public.users WHERE id = v_actor;
  IF v_actor IS NULL OR NOT (
    v_actor_role = 'super_admin' OR
    (v_actor_role IN ('campus_lead', 'volunteer_lead') AND v_school.campus_id IS NOT DISTINCT FROM v_actor_campus)
  ) THEN
    RAISE EXCEPTION 'You do not have permission to replace team members' USING errcode = '42501';
  END IF;

  UPDATE public.school_team_members
     SET status = 'replaced', is_active = false, replaced_at = now(),
         replacement_reason = coalesce(nullif(trim(p_reason), ''), 'Replaced by volunteer lead'), updated_at = now()
   WHERE id = p_member_id;

  INSERT INTO public.school_team_members (school_id, volunteer_id, campus_id, assigned_by, status)
  VALUES (v_member.school_id, p_replacement_volunteer_id, v_school.campus_id, v_actor, 'requested')
  RETURNING id INTO v_new_member_id;

  UPDATE public.school_team_members SET replaced_by_member = v_new_member_id, updated_at = now() WHERE id = p_member_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (v_actor, 'school_team_member_replaced', 'school', v_member.school_id,
          jsonb_build_object('replaced_member_id', p_member_id, 'new_member_id', v_new_member_id, 'reason', p_reason));
  RETURN v_new_member_id;
END;
$$;

REVOKE ALL ON FUNCTION public.request_school_team_availability(uuid, uuid[], integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_school_team_availability(uuid, uuid[], integer) TO authenticated;

-- Overloads for optional arguments to ensure PostgREST schema cache lookup succeeds regardless of payload shape
CREATE OR REPLACE FUNCTION public.request_school_team_availability(
  p_school_id uuid,
  p_volunteer_ids uuid[]
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.request_school_team_availability(p_school_id, p_volunteer_ids, NULL::integer);
END;
$$;
REVOKE ALL ON FUNCTION public.request_school_team_availability(uuid, uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_school_team_availability(uuid, uuid[]) TO authenticated;

REVOKE ALL ON FUNCTION public.respond_school_team_availability(uuid, boolean, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.respond_school_team_availability(uuid, boolean, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.respond_school_team_availability(
  p_member_id uuid,
  p_available boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.respond_school_team_availability(p_member_id, p_available, NULL::text);
END;
$$;
REVOKE ALL ON FUNCTION public.respond_school_team_availability(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.respond_school_team_availability(uuid, boolean) TO authenticated;

REVOKE ALL ON FUNCTION public.confirm_school_team(uuid, uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_school_team(uuid, uuid[]) TO authenticated;

REVOKE ALL ON FUNCTION public.replace_school_team_member(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.replace_school_team_member(uuid, uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.replace_school_team_member(
  p_member_id uuid,
  p_replacement_volunteer_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.replace_school_team_member(p_member_id, p_replacement_volunteer_id, NULL::text);
END;
$$;
REVOKE ALL ON FUNCTION public.replace_school_team_member(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.replace_school_team_member(uuid, uuid) TO authenticated;

-- ─── School Execution Plans Table ───────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'execution_plan_status') THEN
    CREATE TYPE public.execution_plan_status AS ENUM (
      'draft', 'submitted', 'campus_changes_requested', 'campus_approved', 'finance_changes_requested', 'approved'
    );
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.school_execution_plans (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id               uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  campus_id               uuid REFERENCES public.campuses(id) ON DELETE SET NULL,
  laptops_count           integer NOT NULL DEFAULT 0 CHECK (laptops_count >= 0),
  projectors_count        integer NOT NULL DEFAULT 0 CHECK (projectors_count >= 0),
  hdmi_cables_count       integer NOT NULL DEFAULT 0 CHECK (hdmi_cables_count >= 0),
  extension_boards_count  integer NOT NULL DEFAULT 0 CHECK (extension_boards_count >= 0),
  teaching_kits_count     integer NOT NULL DEFAULT 0 CHECK (teaching_kits_count >= 0),
  speakers_count          integer NOT NULL DEFAULT 0 CHECK (speakers_count >= 0),
  other_equipment         text,
  distance_km             numeric(8,2) CHECK (distance_km IS NULL OR distance_km >= 0),
  transport_mode          text,
  estimated_travel_cost   numeric(12,2) NOT NULL DEFAULT 0 CHECK (estimated_travel_cost >= 0),
  meeting_departure_notes text,
  transport_budget        numeric(12,2) NOT NULL DEFAULT 0 CHECK (transport_budget >= 0),
  materials_budget        numeric(12,2) NOT NULL DEFAULT 0 CHECK (materials_budget >= 0),
  equipment_budget        numeric(12,2) NOT NULL DEFAULT 0 CHECK (equipment_budget >= 0),
  other_budget            numeric(12,2) NOT NULL DEFAULT 0 CHECK (other_budget >= 0),
  status                  public.execution_plan_status NOT NULL DEFAULT 'draft',
  submitted_by            uuid REFERENCES public.users(id) ON DELETE SET NULL,
  submitted_at            timestamptz,
  campus_reviewed_by      uuid REFERENCES public.users(id) ON DELETE SET NULL,
  campus_reviewed_at      timestamptz,
  campus_comments         text,
  finance_reviewed_by     uuid REFERENCES public.users(id) ON DELETE SET NULL,
  finance_reviewed_at     timestamptz,
  finance_comments        text,
  created_by              uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.school_execution_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS school_exec_plan_select ON public.school_execution_plans;
CREATE POLICY school_exec_plan_select ON public.school_execution_plans FOR SELECT TO authenticated
  USING (
    is_admin()
    OR (auth_role() IN ('campus_lead','exec_lead','finance_lead','campus_mgmt_admin','volunteer_lead')
        AND campus_id = auth_campus())
    OR created_by = auth.uid()
  );

DROP POLICY IF EXISTS school_exec_plan_write ON public.school_execution_plans;
CREATE POLICY school_exec_plan_write ON public.school_execution_plans FOR ALL TO authenticated
  USING (is_admin() OR (auth_role() IN ('exec_lead','campus_lead') AND campus_id = auth_campus()))
  WITH CHECK (is_admin() OR (auth_role() IN ('exec_lead','campus_lead') AND campus_id = auth_campus()));

-- ─── School Execution Plan RPCs ──────────────────────────────────────────────

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
  v_school      public.schools;
  v_id          uuid;
  actor         uuid := auth.uid();
  actor_role    public.user_role;
  actor_campus  uuid;
  v_confirmed   integer;
  rec           record;
BEGIN
  SELECT * INTO v_school FROM public.schools WHERE id = p_school_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'School % not found', p_school_id; END IF;

  IF v_school.status <> 'sessions_active' THEN
    RAISE EXCEPTION 'School must be Active before submitting an execution plan' USING errcode = '42501';
  END IF;

  IF v_school.operational_phase IS NULL OR v_school.operational_phase NOT IN ('team_ready', 'execution_planning') THEN
    SELECT count(*) INTO v_confirmed FROM public.school_team_members
     WHERE school_id = p_school_id AND status = 'confirmed' AND is_active;

    IF v_confirmed > 0 AND (v_school.required_volunteers = 0 OR v_confirmed >= v_school.required_volunteers) THEN
      UPDATE public.schools SET operational_phase = 'team_ready' WHERE id = p_school_id;
    ELSE
      RAISE EXCEPTION 'School team must be ready before creating an execution plan' USING errcode = '42501';
    END IF;
  END IF;

  IF actor IS NOT NULL THEN
    SELECT role, campus_id INTO actor_role, actor_campus FROM public.users WHERE id = actor;
    IF NOT (
      actor_role IN ('super_admin')
      OR (actor_role IN ('exec_lead','campus_mgmt_admin','campus_lead') AND v_school.campus_id IS NOT DISTINCT FROM actor_campus)
    ) THEN
      RAISE EXCEPTION 'You do not have permission to submit an execution plan for this school' USING errcode = '42501';
    END IF;
  END IF;

  INSERT INTO public.school_execution_plans (
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

  UPDATE public.schools SET operational_phase = 'execution_planning' WHERE id = p_school_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'school_execution_plan_submitted', 'school_execution_plan', v_id,
          jsonb_build_object('school_id', p_school_id));

  FOR rec IN
    SELECT id FROM public.users
     WHERE is_active AND role = 'campus_lead'
       AND campus_id IS NOT DISTINCT FROM v_school.campus_id
  LOOP
    PERFORM public.notify_user(
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

REVOKE ALL ON FUNCTION public.submit_school_execution_plan FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_school_execution_plan TO authenticated;

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
  v_plan        public.school_execution_plans;
  v_school      public.schools;
  actor         uuid := auth.uid();
  actor_role    public.user_role;
  actor_campus  uuid;
BEGIN
  SELECT * INTO v_plan FROM public.school_execution_plans WHERE id = p_plan_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Execution plan % not found', p_plan_id; END IF;

  IF v_plan.status NOT IN ('campus_changes_requested', 'finance_changes_requested') THEN
    RAISE EXCEPTION 'Only plans in changes_requested status can be resubmitted' USING errcode = '23514';
  END IF;

  SELECT * INTO v_school FROM public.schools WHERE id = v_plan.school_id;

  IF actor IS NOT NULL THEN
    SELECT role, campus_id INTO actor_role, actor_campus FROM public.users WHERE id = actor;
    IF NOT (
      actor_role IN ('super_admin')
      OR (actor_role IN ('exec_lead','campus_mgmt_admin','campus_lead') AND v_school.campus_id IS NOT DISTINCT FROM actor_campus)
    ) THEN
      RAISE EXCEPTION 'You do not have permission to resubmit execution plans for this school' USING errcode = '42501';
    END IF;
  END IF;

  UPDATE public.school_execution_plans
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

  UPDATE public.schools
     SET operational_phase = 'execution_planning',
         updated_at = now()
   WHERE id = v_plan.school_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'resubmit_school_execution_plan', 'school_execution_plan', p_plan_id,
          jsonb_build_object('school_id', v_plan.school_id, 'status', 'submitted'));

  RETURN p_plan_id;
END;
$$;

REVOKE ALL ON FUNCTION public.resubmit_school_execution_plan FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resubmit_school_execution_plan TO authenticated;

CREATE OR REPLACE FUNCTION public.review_school_execution_plan_campus(
  p_plan_id uuid,
  p_decision text,
  p_comments text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_plan       public.school_execution_plans;
  v_school     public.schools;
  actor        uuid := auth.uid();
  actor_role   public.user_role;
  actor_campus uuid;
  rec          record;
BEGIN
  IF p_decision NOT IN ('approved', 'changes_requested') THEN
    RAISE EXCEPTION 'Decision must be approved or changes_requested';
  END IF;

  SELECT * INTO v_plan FROM public.school_execution_plans WHERE id = p_plan_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Execution plan not found'; END IF;

  IF v_plan.status <> 'submitted' THEN
    RAISE EXCEPTION 'This plan is not awaiting campus review' USING errcode = '23514';
  END IF;

  IF actor IS NOT NULL THEN
    SELECT role, campus_id INTO actor_role, actor_campus FROM public.users WHERE id = actor;
    IF NOT (
      actor_role IN ('super_admin')
      OR (actor_role IN ('campus_lead','campus_mgmt_admin') AND v_plan.campus_id IS NOT DISTINCT FROM actor_campus)
    ) THEN
      RAISE EXCEPTION 'You do not have permission to review this plan' USING errcode = '42501';
    END IF;
  END IF;

  IF p_decision = 'changes_requested' AND coalesce(trim(p_comments), '') = '' THEN
    RAISE EXCEPTION 'Comments are required when requesting changes' USING errcode = '23514';
  END IF;

  UPDATE public.school_execution_plans
     SET status = CASE p_decision WHEN 'approved' THEN 'campus_approved'::execution_plan_status ELSE 'campus_changes_requested'::execution_plan_status END,
         campus_reviewed_by = actor, campus_reviewed_at = now(),
         campus_comments = nullif(trim(p_comments), '')
   WHERE id = p_plan_id;

  SELECT * INTO v_school FROM public.schools WHERE id = v_plan.school_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'school_execution_plan_campus_review', 'school_execution_plan', p_plan_id,
          jsonb_build_object('decision', p_decision, 'comments', p_comments));

  IF p_decision = 'approved' THEN
    FOR rec IN
      SELECT id FROM public.users
       WHERE is_active AND role = 'finance_lead'
         AND campus_id IS NOT DISTINCT FROM v_plan.campus_id
    LOOP
      PERFORM public.notify_user(
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

  IF v_plan.submitted_by IS NOT NULL THEN
    PERFORM public.notify_user(
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

REVOKE ALL ON FUNCTION public.review_school_execution_plan_campus FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_school_execution_plan_campus TO authenticated;

CREATE OR REPLACE FUNCTION public.review_school_execution_plan_finance(
  p_plan_id uuid,
  p_decision text,
  p_comments text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_plan       public.school_execution_plans;
  v_school     public.schools;
  actor        uuid := auth.uid();
  actor_role   public.user_role;
  actor_campus uuid;
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

  UPDATE public.school_execution_plans
     SET status = CASE p_decision WHEN 'approved' THEN 'approved'::execution_plan_status ELSE 'finance_changes_requested'::execution_plan_status END,
         finance_reviewed_by = actor, finance_reviewed_at = now(),
         finance_comments = nullif(trim(p_comments), '')
   WHERE id = p_plan_id;

  SELECT * INTO v_school FROM public.schools WHERE id = v_plan.school_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'school_execution_plan_finance_review', 'school_execution_plan', p_plan_id,
          jsonb_build_object('decision', p_decision, 'comments', p_comments));

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

COMMENT ON FUNCTION public.request_school_team_availability(uuid, uuid[], integer) IS
  'Requests availability from volunteers for a school team. Returns the number of newly requested volunteers.';

NOTIFY pgrst, 'reload schema';
