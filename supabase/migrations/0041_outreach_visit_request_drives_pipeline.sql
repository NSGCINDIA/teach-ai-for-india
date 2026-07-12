-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0041 Outreach visit request also drives the pipeline
--
-- outreach_visit_requests (0028) was originally designed to sit independent
-- of schools.status ("layered on top of the school pipeline rather than
-- replacing any of its states") since it's usable at any point in a school's
-- lifecycle (e.g. a follow-up visit long after registration). Per product
-- decision, it should now ALSO advance the pipeline — but only when doing so
-- makes sense: filing one moves a school still at lead_identified to
-- outreach_requested; both legs approving moves a school still at
-- outreach_requested to outreach_approved. A visit request filed/approved for
-- a school that has already moved past that stage (e.g. already registered)
-- leaves schools.status untouched — the original "usable at any stage"
-- property is preserved, it just no longer means "isolated from the pipeline"
-- for the common early-stage case.
--
-- The approval-time advance is done as a direct inline update, NOT via
-- change_school_status() — that RPC's role gate doesn't include finance_lead,
-- but finance_lead's own review can be the one that completes both legs (the
-- two reviews can land in either order), and calling a role-gated RPC from
-- inside recompute_outreach_visit_request_status() would then fail and roll
-- back the finance_lead's own already-authorized review. The file-time
-- advance has no such issue — create_outreach_visit_request()'s caller is
-- always super_admin/campus_lead/outreach_lead, which already matches
-- change_school_status()'s allowed set exactly.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.create_outreach_visit_request(
  p_school_id uuid,
  p_purpose text,
  p_proposed_visit_date date,
  p_estimated_travel_cost numeric,
  p_team_member_ids uuid[]
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_school      schools;
  v_id          uuid;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
  rec           record;
begin
  select * into v_school from schools where id = p_school_id;
  if not found then
    raise exception 'School % not found', p_school_id;
  end if;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin')
      or (actor_role in ('campus_lead','outreach_lead')
          and v_school.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to file a visit request for this school'
        using errcode = '42501';
    end if;
  end if;

  if coalesce(trim(p_purpose), '') = '' then
    raise exception 'Purpose of visit is required' using errcode = '23514';
  end if;
  if p_estimated_travel_cost is null or p_estimated_travel_cost <= 0 then
    raise exception 'Estimated travel cost must be greater than zero' using errcode = '23514';
  end if;
  if coalesce(array_length(p_team_member_ids, 1), 0) = 0 then
    raise exception 'Select at least one outreach team member' using errcode = '23514';
  end if;

  insert into outreach_visit_requests
    (school_id, campus_id, purpose, proposed_visit_date, estimated_travel_cost, team_member_ids, created_by)
  values
    (p_school_id, v_school.campus_id, trim(p_purpose), p_proposed_visit_date, p_estimated_travel_cost,
     p_team_member_ids, actor)
  returning id into v_id;

  -- Advance the pipeline only from the very first stage — a visit request
  -- filed for a school already past it (e.g. a later follow-up visit) leaves
  -- schools.status untouched.
  if v_school.status = 'lead_identified' then
    perform change_school_status(p_school_id, 'outreach_requested', 'Outreach visit requested');
  end if;

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'outreach_visit_request_create', 'outreach_visit_request', v_id,
          jsonb_build_object('school_id', p_school_id, 'estimated_travel_cost', p_estimated_travel_cost,
                              'proposed_visit_date', p_proposed_visit_date));

  for rec in
    select id from public.users
     where is_active
       and role in ('campus_lead','finance_lead')
       and campus_id is not distinct from v_school.campus_id
  loop
    perform notify_user(
      rec.id,
      'outreach_visit_request_created',
      'New outreach visit request: ' || v_school.name,
      trim(p_purpose) || ' — proposed for ' || to_char(p_proposed_visit_date, 'DD Mon YYYY')
        || ', est. ₹' || p_estimated_travel_cost || '.',
      '/dashboard/schools/' || p_school_id,
      'school',
      p_school_id
    );
  end loop;

  return v_id;
end;
$$;

create or replace function public.recompute_outreach_visit_request_status(p_id uuid)
returns approval_status language plpgsql security definer set search_path = public as $$
declare
  v_campus         approval_status;
  v_finance        approval_status;
  v_new            approval_status;
  v_school_id      uuid;
  v_school_status  school_status;
begin
  select campus_lead_review, finance_lead_review, school_id into v_campus, v_finance, v_school_id
    from outreach_visit_requests where id = p_id;

  v_new := case
    when v_campus = 'rejected' or v_finance = 'rejected' then 'rejected'
    when v_campus = 'approved' and v_finance = 'approved' then 'approved'
    else 'pending'
  end;

  update outreach_visit_requests set status = v_new where id = p_id;

  -- Both legs approved: advance the pipeline — bypassing change_school_status()
  -- deliberately (see migration header) since either reviewer role can be the
  -- one that completes this, and finance_lead isn't allowed to call it directly.
  -- Only fires while the school is still exactly at outreach_requested.
  if v_new = 'approved' then
    select status into v_school_status from schools where id = v_school_id;
    if v_school_status = 'outreach_requested' then
      update schools set status = 'outreach_approved' where id = v_school_id;
      insert into school_status_history (school_id, previous_status, new_status, changed_by, note)
      values (v_school_id, 'outreach_requested', 'outreach_approved', auth.uid(),
              'Outreach visit request fully approved');
      insert into audit_log (actor_id, action, entity_type, entity_id, detail)
      values (auth.uid(), 'status_change', 'school', v_school_id,
              jsonb_build_object('from', 'outreach_requested', 'to', 'outreach_approved',
                                  'note', 'Outreach visit request fully approved',
                                  'source', 'outreach_visit_request_dual_approval'));
    end if;
  end if;

  return v_new;
end;
$$;
