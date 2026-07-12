-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0042 Retire the Outreach Request feature
--
-- Product decision: the standalone Outreach Request (outreach_requests table,
-- single Campus Lead approval) is redundant with Outreach Visit Request
-- (outreach_visit_requests, dual Campus Lead + Finance Lead approval) — both
-- were the first gate a fresh lead had to clear, and having both confused
-- users into thinking approving one should clear the other. Outreach Visit
-- Request now becomes the sole first gate and takes over driving
-- schools.status forward:
--   • create_outreach_visit_request(): lead_identified/outreach_requested →
--     outreach_requested (previously only create_outreach_request did this).
--   • Both review legs approved (recompute_outreach_visit_request_status
--     reaching 'approved') → outreach_approved (previously only
--     review_outreach_request's approval branch did this).
--
-- The outreach_requests TABLE and its historical rows are kept (not dropped)
-- so existing audit/history data isn't lost — only its two RPCs (the only
-- app-facing surface) are removed. Nothing else references the table once
-- this ships (app code removed in the same change).
--
-- Advancing schools.status from inside the visit-request RPCs can't reuse
-- change_school_status() directly: that function only lets super_admin /
-- campus_lead / outreach_lead (and exec_lead within a later sub-range) act as
-- the transition's actor, but a visit request can be completed by whichever
-- reviewer signs off second — which may be the Finance Lead, who has no
-- general permission to change a school's status. Each visit-request RPC
-- already independently authorizes its own specific action (who may file, who
-- may review as Campus/Finance Lead); the resulting stage bump is a business
-- rule consequence of that already-authorized action, not a new privilege
-- being exercised. advance_school_status_unchecked() factors out
-- change_school_status()'s transition-validate + write-3-tables tail without
-- its actor-role gate, and is intentionally NOT granted to `authenticated` —
-- only callable from within other SECURITY DEFINER functions that already did
-- their own gating.
-- ═══════════════════════════════════════════════════════════════════════════

drop function if exists public.review_outreach_request(uuid, approval_status, text);
drop function if exists public.create_outreach_request(uuid, text, text);

-- ─── advance_school_status_unchecked() — internal, no actor-permission gate ──
create or replace function public.advance_school_status_unchecked(
  p_school_id uuid,
  p_new_status school_status,
  p_note text,
  p_actor uuid
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_prev school_status;
begin
  select status into v_prev from schools where id = p_school_id for update;
  if v_prev is null then
    raise exception 'School % not found', p_school_id;
  end if;

  if p_new_status = v_prev then
    return;
  end if;

  if not school_transition_allowed(v_prev, p_new_status) then
    raise exception 'Illegal school transition % → %', v_prev, p_new_status using errcode = '42501';
  end if;

  update schools set status = p_new_status where id = p_school_id;

  insert into school_status_history (school_id, previous_status, new_status, changed_by, note)
  values (p_school_id, v_prev::text, p_new_status::text, p_actor, p_note);

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (p_actor, 'status_change', 'school', p_school_id,
          jsonb_build_object('from', v_prev, 'to', p_new_status, 'note', p_note));
end;
$$;

comment on function public.advance_school_status_unchecked(uuid, school_status, text, uuid) is
  'Internal-only: validates and applies a school_status transition without change_school_status''s actor-role gate. Callers must independently authorize their own action first. Not granted to authenticated.';

-- ─── create_outreach_visit_request() — now also advances schools.status ─────
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

  perform advance_school_status_unchecked(p_school_id, 'outreach_requested', 'Outreach visit request filed', actor);

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
  'File an outreach visit request; advances the school to outreach_requested; notifies the campus Campus Lead + Finance Lead (Operational Workflow Spec v2.0, Phase 2 Stage 2).';

-- ─── recompute_outreach_visit_request_status() — now also advances schools.status
create or replace function public.recompute_outreach_visit_request_status(p_id uuid)
returns approval_status language plpgsql security definer set search_path = public as $$
declare
  v_campus     approval_status;
  v_finance    approval_status;
  v_new        approval_status;
  v_school_id  uuid;
begin
  select campus_lead_review, finance_lead_review, school_id
    into v_campus, v_finance, v_school_id
    from outreach_visit_requests where id = p_id;

  v_new := case
    when v_campus = 'rejected' or v_finance = 'rejected' then 'rejected'
    when v_campus = 'approved' and v_finance = 'approved' then 'approved'
    else 'pending'
  end;

  update outreach_visit_requests set status = v_new where id = p_id;

  -- Rejection deliberately leaves the school at outreach_requested (same as
  -- the retired review_outreach_request's rejection branch) so a fresh visit
  -- request can be re-filed without reverting to lead_identified.
  if v_new = 'approved' then
    perform advance_school_status_unchecked(
      v_school_id, 'outreach_approved',
      'Outreach visit request approved (Campus Lead + Finance Lead)', auth.uid()
    );
  end if;

  return v_new;
end;
$$;
