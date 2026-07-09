-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0027 Outreach Visit Requests (Operational Workflow
-- Spec v2.0, Phase 2, Stage 2)
--
-- Before visiting a school, the Outreach Lead files a visit request: purpose,
-- proposed date, estimated travel cost, and the outreach team. Two independent
-- reviewers must each sign off, in either order:
--   • Campus Lead — school suitability / outreach necessity.
--   • Finance Lead — estimated cost against the campus's current-quarter
--     campus_budgets row (0026); approval reserves the amount.
-- The visit "proceeds" once BOTH legs are approved. Recording what actually
-- happened on the visit (Stage 3) is a later phase — this table only
-- represents request → dual-review → ready-to-proceed.
--
-- A separate table, not a school_status value — mirrors session_plans (0016):
-- its own record with its own review state, layered on top of the school
-- pipeline rather than replacing any of its states. school_transition_allowed()
-- (0011) is untouched.
-- ═══════════════════════════════════════════════════════════════════════════

create table outreach_visit_requests (
  id                        uuid primary key default gen_random_uuid(),
  school_id                 uuid not null references schools(id) on delete cascade,
  campus_id                 uuid references campuses(id) on delete set null,

  purpose                   text not null,
  proposed_visit_date       date not null,
  estimated_travel_cost     numeric(12,2) not null check (estimated_travel_cost >= 0),
  team_member_ids           uuid[] not null default '{}',

  -- Derived overall state, stamped directly by the RPCs below (not a view) —
  -- same convention as session_plans.status / schools.status.
  status                    approval_status not null default 'pending',

  campus_lead_review        approval_status not null default 'pending',
  campus_lead_reviewed_by   uuid references users(id) on delete set null,
  campus_lead_reviewed_at   timestamptz,
  campus_lead_note          text,

  finance_lead_review       approval_status not null default 'pending',
  finance_lead_reviewed_by  uuid references users(id) on delete set null,
  finance_lead_reviewed_at  timestamptz,
  finance_lead_note         text,

  created_by                uuid references users(id) on delete set null,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);
comment on table outreach_visit_requests is
  'Outreach Visit Request — dual independent review (Campus Lead + Finance Lead) before a school visit (Operational Workflow Spec v2.0, Phase 2 Stage 2).';

create index outreach_visit_requests_school_idx on outreach_visit_requests (school_id);
create index outreach_visit_requests_campus_idx on outreach_visit_requests (campus_id);

-- At most one open (pending) request per school — keeps "the active request"
-- unambiguous in the UI, and doubles as the concurrent-create race guard.
create unique index outreach_visit_requests_one_pending_per_school
  on outreach_visit_requests (school_id) where (status = 'pending');

create trigger trg_outreach_visit_requests_updated
  before update on outreach_visit_requests for each row execute function public.touch_updated_at();

create or replace function public.set_outreach_visit_request_campus()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.campus_id is null then
    select campus_id into new.campus_id from schools where id = new.school_id;
  end if;
  return new;
end;
$$;

create trigger trg_outreach_visit_request_campus
  before insert or update on outreach_visit_requests
  for each row execute function public.set_outreach_visit_request_campus();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table outreach_visit_requests enable row level security;

create policy outreach_visit_requests_select on outreach_visit_requests for select to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','finance_lead','campus_mgmt_admin','outreach_lead')
        and campus_id = auth_campus())
    or created_by = auth.uid()
  );

-- Admin-only direct writes — every real mutation (create + both reviews) is
-- audited/notified and goes through the SECURITY DEFINER RPCs below, mirroring
-- campus_budgets_write's model rather than session_plans_write's (which has a
-- plain-editable draft phase this table has no equivalent of).
create policy outreach_visit_requests_write on outreach_visit_requests for all to authenticated
  using ( is_admin() ) with check ( is_admin() );

-- ─── create_outreach_visit_request() ─────────────────────────────────────────
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
  'File an outreach visit request; notifies the campus Campus Lead + Finance Lead (Operational Workflow Spec v2.0, Phase 2 Stage 2).';

grant execute on function public.create_outreach_visit_request(uuid, text, date, numeric, uuid[]) to authenticated;

-- ─── recompute_outreach_visit_request_status() — shared derivation ──────────
create or replace function public.recompute_outreach_visit_request_status(p_id uuid)
returns approval_status language plpgsql security definer set search_path = public as $$
declare
  v_campus  approval_status;
  v_finance approval_status;
  v_new     approval_status;
begin
  select campus_lead_review, finance_lead_review into v_campus, v_finance
    from outreach_visit_requests where id = p_id;

  v_new := case
    when v_campus = 'rejected' or v_finance = 'rejected' then 'rejected'
    when v_campus = 'approved' and v_finance = 'approved' then 'approved'
    else 'pending'
  end;

  update outreach_visit_requests set status = v_new where id = p_id;
  return v_new;
end;
$$;

-- ─── review_outreach_visit_request_campus() ──────────────────────────────────
create or replace function public.review_outreach_visit_request_campus(
  p_request_id uuid,
  p_decision approval_status,
  p_note text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_req        outreach_visit_requests;
  v_school     schools;
  actor        uuid := auth.uid();
  actor_role   user_role;
  actor_campus uuid;
  v_status     approval_status;
begin
  if p_decision not in ('approved','rejected') then
    raise exception 'A review decision must be approved or rejected' using errcode = '22023';
  end if;

  select * into v_req from outreach_visit_requests where id = p_request_id for update;
  if not found then
    raise exception 'Visit request % not found', p_request_id;
  end if;
  if v_req.campus_lead_review <> 'pending' then
    raise exception 'This request has already been reviewed by the Campus Lead' using errcode = '23514';
  end if;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin','mgmt_admin')
      or (actor_role = 'campus_lead' and v_req.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to record the Campus Lead review' using errcode = '42501';
    end if;
  end if;

  if p_decision = 'rejected' and coalesce(trim(p_note), '') = '' then
    raise exception 'A reason is required when rejecting' using errcode = '23514';
  end if;

  update outreach_visit_requests
     set campus_lead_review = p_decision, campus_lead_reviewed_by = actor,
         campus_lead_reviewed_at = now(), campus_lead_note = nullif(trim(p_note), '')
   where id = p_request_id;

  v_status := recompute_outreach_visit_request_status(p_request_id);

  select * into v_school from schools where id = v_req.school_id;

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'outreach_visit_request_campus_review', 'outreach_visit_request', p_request_id,
          jsonb_build_object('decision', p_decision, 'note', p_note, 'resulting_status', v_status));

  if v_req.created_by is not null then
    perform notify_user(
      v_req.created_by,
      'outreach_visit_request_campus_' || p_decision,
      'Campus Lead ' || p_decision || ' your visit request: ' || coalesce(v_school.name, 'a school'),
      case
        when v_status = 'approved' then 'Both approvals are in — the visit may proceed.'
        when v_status = 'rejected' then coalesce('Reason: ' || p_note, 'No reason given.')
        else 'Still awaiting the Finance Lead''s review.'
      end,
      '/dashboard/schools/' || v_req.school_id,
      'school',
      v_req.school_id
    );
  end if;
end;
$$;

comment on function public.review_outreach_visit_request_campus(uuid, approval_status, text) is
  'Campus Lead reviews school suitability for a visit request (Operational Workflow Spec v2.0, Phase 2 Stage 2).';

grant execute on function public.review_outreach_visit_request_campus(uuid, approval_status, text) to authenticated;

-- ─── review_outreach_visit_request_finance() ─────────────────────────────────
-- Budget-critical: locks the campus_budgets row (not just the request row) for
-- the duration of the check-and-reserve so two concurrent finance approvals
-- against the same campus/period can never both pass the availability check
-- and jointly overdraw the pool. Lock order is always outreach_visit_requests
-- row → campus_budgets row (this function is the only one that locks both),
-- so this can't deadlock against itself.
create or replace function public.review_outreach_visit_request_finance(
  p_request_id uuid,
  p_decision approval_status,
  p_note text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_req         outreach_visit_requests;
  v_school      schools;
  v_campus      campuses;
  v_budget      campus_budgets;
  v_available   numeric;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
  v_status      approval_status;
begin
  if p_decision not in ('approved','rejected') then
    raise exception 'A review decision must be approved or rejected' using errcode = '22023';
  end if;

  select * into v_req from outreach_visit_requests where id = p_request_id for update;
  if not found then
    raise exception 'Visit request % not found', p_request_id;
  end if;
  if v_req.finance_lead_review <> 'pending' then
    raise exception 'This request has already been reviewed by the Finance Lead' using errcode = '23514';
  end if;

  select * into v_school from schools where id = v_req.school_id;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin','mgmt_admin')
      or (actor_role = 'finance_lead' and v_req.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to record the Finance Lead review' using errcode = '42501';
    end if;
  end if;

  if p_decision = 'rejected' and coalesce(trim(p_note), '') = '' then
    raise exception 'A reason is required when rejecting' using errcode = '23514';
  end if;

  if p_decision = 'approved' then
    select * into v_campus from campuses where id = v_req.campus_id;
    if v_campus.id is null or coalesce(trim(v_campus.quarter), '') = '' then
      raise exception 'No active budget period is set for this campus' using errcode = '23514';
    end if;

    -- Lock taken here (not after the check) — this is what makes the
    -- check-and-reserve atomic across concurrent requests on this budget.
    select * into v_budget from campus_budgets
      where campus_id = v_req.campus_id and period = v_campus.quarter
      for update;

    if not found then
      raise exception 'No budget allocated for % in %; ask an admin to allocate one before approving',
        coalesce(v_school.name, 'this campus'), v_campus.quarter using errcode = '23514';
    end if;

    v_available := v_budget.allocated_amount - v_budget.reserved_amount;
    if v_available < v_req.estimated_travel_cost then
      raise exception 'Insufficient budget for %: ₹% available of ₹% allocated, ₹% requested',
        v_campus.quarter, v_available, v_budget.allocated_amount, v_req.estimated_travel_cost
        using errcode = '23514';
    end if;

    update campus_budgets set reserved_amount = reserved_amount + v_req.estimated_travel_cost
     where id = v_budget.id;
  end if;

  update outreach_visit_requests
     set finance_lead_review = p_decision, finance_lead_reviewed_by = actor,
         finance_lead_reviewed_at = now(), finance_lead_note = nullif(trim(p_note), '')
   where id = p_request_id;

  v_status := recompute_outreach_visit_request_status(p_request_id);

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'outreach_visit_request_finance_review', 'outreach_visit_request', p_request_id,
          jsonb_build_object('decision', p_decision, 'note', p_note, 'resulting_status', v_status,
                              'estimated_travel_cost', v_req.estimated_travel_cost));

  if v_req.created_by is not null then
    perform notify_user(
      v_req.created_by,
      'outreach_visit_request_finance_' || p_decision,
      'Finance Lead ' || p_decision || ' your visit request: ' || coalesce(v_school.name, 'a school'),
      case
        when v_status = 'approved' then 'Both approvals are in — the visit may proceed.'
        when v_status = 'rejected' then coalesce('Reason: ' || p_note, 'No reason given.')
        else 'Still awaiting the Campus Lead''s review.'
      end,
      '/dashboard/schools/' || v_req.school_id,
      'school',
      v_req.school_id
    );
  end if;
end;
$$;

comment on function public.review_outreach_visit_request_finance(uuid, approval_status, text) is
  'Finance Lead reviews estimated travel cost vs campus_budgets and reserves on approval (Operational Workflow Spec v2.0, Phase 2 Stage 2).';

grant execute on function public.review_outreach_visit_request_finance(uuid, approval_status, text) to authenticated;
