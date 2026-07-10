-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0041 Gate outreach visit request filing by school status
--
-- create_outreach_visit_request() (0028) never checked schools.status, unlike
-- its sibling create_outreach_request()/log_school_visit() (0037/0038) — so a
-- school that had already moved past outreach_requested (e.g. once the Campus
-- Lead approved outreach) could still have a brand-new visit request filed
-- against it. The UI-side fix (VisitRequestPanel) mirrors the same
-- lead_identified/outreach_requested window already used to decide whether
-- the "Outreach visit request" card even renders (school-detail.tsx); this
-- adds the matching server-side guard so the RPC enforces it too.
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
      actor_role in ('super_admin','mgmt_admin')
      or (actor_role in ('campus_lead','outreach_lead')
          and v_school.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to file a visit request for this school'
        using errcode = '42501';
    end if;
  end if;

  if v_school.status not in ('lead_identified', 'outreach_requested') then
    raise exception 'A school must be at Lead Identified (or Outreach Requested) to have a visit request filed'
      using errcode = '23514';
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

comment on function public.create_outreach_visit_request(uuid, text, date, numeric, uuid[]) is
  'File an outreach visit request; notifies the campus Campus Lead + Finance Lead (Operational Workflow Spec v2.0, Phase 2 Stage 2). Only callable while the school is at Lead Identified or Outreach Requested.';
