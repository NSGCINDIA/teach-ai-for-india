-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0069 One open execution plan per school
--
-- submit_school_execution_plan() (0057/0060) ran a bare INSERT with no
-- uniqueness guard, so every call added another row. A school could therefore
-- hold several execution plans at once, and the readers disagreed about which
-- one was real:
--
--   • getSchoolExecutionPlan() orders by created_at desc limit 1 — the school
--     page showed the NEWEST plan.
--   • the Finance Lead workspace listed EVERY row with status 'campus_approved'
--     — so Finance could open, and approve, an older row carrying a stale
--     budget while the school page displayed a different figure.
--
-- That is the intermittent "wrong budget" reviewers reported. The fix is to
-- make submission idempotent: if the school already has an open plan, refresh
-- it in place and return its id instead of inserting a rival row. Approved
-- plans are history and are never touched, so a school that finishes one plan
-- can still start the next.
--
-- The partial unique index makes the invariant structural rather than a
-- convention the next writer has to remember. Legacy duplicates would make the
-- index creation fail, so older open duplicates are removed first — keeping the
-- newest, which is the row the UI has been showing all along.
--
-- "Open" means status <> 'approved'. The execution_plan_status enum has no
-- 'rejected' member (draft / submitted / campus_changes_requested /
-- campus_approved / finance_changes_requested / approved), so 'approved' is the
-- only terminal state and superseded duplicates are deleted rather than
-- restatused. Any operational_expenses pointing at a doomed row are re-pointed
-- to the survivor first — the FK is ON DELETE SET NULL, so without that step a
-- delete would silently orphan the expense from its plan.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Remove pre-existing open duplicates, keeping the newest per school ───
-- Each statement carries its own CTE rather than sharing a temp table, so the
-- script behaves the same whether the runner wraps it in one transaction
-- (supabase db push) or autocommits statement by statement (SQL editor).
-- Ranking is stable across both steps: neither changes status or created_at.

-- 1a. Move any expense booked against a doomed duplicate onto the survivor.
with ranked as (
  select id,
         school_id,
         row_number() over (partition by school_id order by created_at desc, id desc) as rn
    from public.school_execution_plans
   where status <> 'approved'
)
update public.operational_expenses e
   set execution_plan_id = keep.id
  from ranked dup
  join ranked keep on keep.school_id = dup.school_id and keep.rn = 1
 where dup.rn > 1
   and e.execution_plan_id = dup.id;

-- 1b. Drop the superseded rows.
with ranked as (
  select id,
         row_number() over (partition by school_id order by created_at desc, id desc) as rn
    from public.school_execution_plans
   where status <> 'approved'
)
delete from public.school_execution_plans p
 using ranked
 where p.id = ranked.id
   and ranked.rn > 1;

-- ─── 2. Enforce it from here on ──────────────────────────────────────────────
create unique index if not exists school_execution_plans_one_open_per_school
  on public.school_execution_plans (school_id)
  where status <> 'approved';

-- ─── 3. Budget summary carried on every approval request ─────────────────────
-- Both review notifications used to say only "needs your review" with no
-- figures, so a Campus Lead or Finance Lead had to open the school page to
-- learn what they were approving. Every request now states the total AND the
-- category split it is made of.
CREATE OR REPLACE FUNCTION public.execution_plan_budget_summary(p_plan_id uuid)
RETURNS text LANGUAGE sql STABLE SET search_path = public AS $fn$
  SELECT 'Total ₹' || trim(to_char(
           coalesce(p.transport_budget,0) + coalesce(p.materials_budget,0)
         + coalesce(p.equipment_budget,0) + coalesce(p.other_budget,0), 'FM999999990.00'))
      || ' — Transport ₹' || trim(to_char(coalesce(p.transport_budget,0), 'FM999999990.00'))
      || ' · Materials ₹'  || trim(to_char(coalesce(p.materials_budget,0), 'FM999999990.00'))
      || ' · Equipment ₹'  || trim(to_char(coalesce(p.equipment_budget,0), 'FM999999990.00'))
      || ' · Other ₹'      || trim(to_char(coalesce(p.other_budget,0), 'FM999999990.00'))
    FROM public.school_execution_plans p
   WHERE p.id = p_plan_id;
$fn$;

GRANT EXECUTE ON FUNCTION public.execution_plan_budget_summary TO authenticated;

-- ─── 4. Make submission reuse the open plan instead of inserting a rival ─────
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
  v_existing    uuid;
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

  -- Reuse the school's open plan if it has one (open = not yet approved).
  -- FOR UPDATE so two concurrent submissions serialise instead of racing past
  -- the check and both inserting.
  SELECT id INTO v_existing
    FROM public.school_execution_plans
   WHERE school_id = p_school_id
     AND status <> 'approved'
   ORDER BY created_at DESC
   LIMIT 1
     FOR UPDATE;

  IF v_existing IS NOT NULL THEN
    UPDATE public.school_execution_plans
       SET laptops_count = coalesce(p_laptops_count, 0),
           projectors_count = coalesce(p_projectors_count, 0),
           hdmi_cables_count = coalesce(p_hdmi_cables_count, 0),
           extension_boards_count = coalesce(p_extension_boards_count, 0),
           teaching_kits_count = coalesce(p_teaching_kits_count, 0),
           speakers_count = coalesce(p_speakers_count, 0),
           other_equipment = nullif(trim(p_other_equipment), ''),
           distance_km = p_distance_km,
           transport_mode = nullif(trim(p_transport_mode), ''),
           estimated_travel_cost = coalesce(p_estimated_travel_cost, 0),
           meeting_departure_notes = nullif(trim(p_meeting_departure_notes), ''),
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
     WHERE id = v_existing;

    v_id := v_existing;
  ELSE
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
  END IF;

  UPDATE public.schools SET operational_phase = 'execution_planning' WHERE id = p_school_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'school_execution_plan_submitted', 'school_execution_plan', v_id,
          jsonb_build_object(
            'school_id', p_school_id,
            'reused_open_plan', v_existing IS NOT NULL,
            'transport_budget', coalesce(p_transport_budget, 0),
            'materials_budget', coalesce(p_materials_budget, 0),
            'equipment_budget', coalesce(p_equipment_budget, 0),
            'other_budget', coalesce(p_other_budget, 0),
            'total_budget', coalesce(p_transport_budget,0) + coalesce(p_materials_budget,0)
                          + coalesce(p_equipment_budget,0) + coalesce(p_other_budget,0)));

  FOR rec IN
    SELECT id FROM public.users
     WHERE is_active AND role = 'campus_lead'
       AND campus_id IS NOT DISTINCT FROM v_school.campus_id
  LOOP
    PERFORM public.notify_user(
      rec.id,
      'school_execution_plan_submitted',
      'Execution plan submitted: ' || v_school.name,
      public.execution_plan_budget_summary(v_id),
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

-- ─── 5. Campus review forwards the figures to Finance ────────────────────────
-- Same gap on the second leg: Finance was told "The Campus Lead approved this
-- plan" with no amounts, and the audit row recorded only the decision. Both now
-- carry the total and the category split.
CREATE OR REPLACE FUNCTION public.review_school_execution_plan_campus(
  p_plan_id uuid,
  p_decision text,
  p_comments text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_plan       public.school_execution_plans;
  v_school     public.schools;
  v_summary    text;
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
  v_summary := public.execution_plan_budget_summary(p_plan_id);

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'school_execution_plan_campus_review', 'school_execution_plan', p_plan_id,
          jsonb_build_object(
            'decision', p_decision,
            'comments', p_comments,
            'transport_budget', coalesce(v_plan.transport_budget, 0),
            'materials_budget', coalesce(v_plan.materials_budget, 0),
            'equipment_budget', coalesce(v_plan.equipment_budget, 0),
            'other_budget', coalesce(v_plan.other_budget, 0),
            'total_budget', coalesce(v_plan.transport_budget,0) + coalesce(v_plan.materials_budget,0)
                          + coalesce(v_plan.equipment_budget,0) + coalesce(v_plan.other_budget,0)));

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
        'Approved by the Campus Lead. ' || v_summary,
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
      CASE p_decision
        WHEN 'approved' THEN 'Forwarded to Finance Lead for review. ' || v_summary
        ELSE coalesce('Comments: ' || p_comments, 'No comments.')
      END,
      '/dashboard/schools/' || v_plan.school_id,
      'school',
      v_plan.school_id
    );
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.review_school_execution_plan_campus FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_school_execution_plan_campus TO authenticated;
