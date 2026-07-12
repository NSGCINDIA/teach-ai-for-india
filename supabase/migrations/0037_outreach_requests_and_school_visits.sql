-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0037 Outreach requests + School visits
--
-- Two new, purely additive tables for the two new pre-registration stages
-- introduced by 0036 (school_status: lead_identified → outreach_requested →
-- outreach_approved → visit_completed → registered → ...):
--
--   • outreach_requests — Outreach Lead/Campus Lead files a request to pursue
--     a lead; single-reviewer approval by that campus's Campus Lead (not the
--     dual Campus+Finance review outreach_visit_requests uses, since no
--     travel cost is being committed yet). Modeled on budget_increase_requests
--     (0032): single reviewer, mandatory rejection reason, one-pending-at-a-time.
--   • school_visits — an un-reviewed log of what happened on the onboarding
--     visit (visited-by, when, notes). Distinct from outreach_visit_requests
--     (0028), which is a dual-reviewed request-to-visit for schools already
--     active in the CRM — that feature is untouched by this migration.
--
-- Both RPCs drive schools.status forward via change_school_status(), same
-- pattern as create_outreach_visit_request/approve_session_plan already do.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- Additive only — safe outside the enum-rebuild dance 0036 needed for
-- school_status/user_role (which required removing values, not adding one).
alter type media_entity_type add value if not exists 'school_visit';

commit;

begin;

-- ─── outreach_requests ──────────────────────────────────────────────────────

create table outreach_requests (
  id                uuid primary key default gen_random_uuid(),
  school_id         uuid not null references schools(id) on delete cascade,
  campus_id         uuid references campuses(id) on delete set null,

  reason            text not null,
  proposed_approach text,

  status            approval_status not null default 'pending',
  reviewed_by       uuid references users(id) on delete set null,
  reviewed_at       timestamptz,
  review_note       text,

  created_by        uuid references users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
comment on table outreach_requests is
  'Outreach Lead/Campus Lead requests pursuing a school lead; single-reviewer approval by that campus''s Campus Lead. Approval advances schools.status to outreach_approved.';

create index outreach_requests_school_idx on outreach_requests (school_id);
create index outreach_requests_campus_idx on outreach_requests (campus_id);

-- At most one open request per school — same convention as
-- outreach_visit_requests_one_pending_per_school (0028).
create unique index outreach_requests_one_pending_per_school
  on outreach_requests (school_id) where (status = 'pending');

create trigger trg_outreach_requests_updated
  before update on outreach_requests for each row execute function public.touch_updated_at();

create or replace function public.set_outreach_request_campus()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.campus_id is null then
    select campus_id into new.campus_id from schools where id = new.school_id;
  end if;
  return new;
end;
$$;

create trigger trg_outreach_request_campus
  before insert or update on outreach_requests
  for each row execute function public.set_outreach_request_campus();

alter table outreach_requests enable row level security;

create policy outreach_requests_select on outreach_requests for select to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_lead','exec_lead','campus_mgmt_admin') and campus_id = auth_campus())
    or created_by = auth.uid()
  );

-- Admin-only direct writes — every real mutation goes through the RPCs below.
create policy outreach_requests_write on outreach_requests for all to authenticated
  using ( is_admin() ) with check ( is_admin() );

create or replace function public.create_outreach_request(
  p_school_id uuid,
  p_reason text,
  p_proposed_approach text default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_school     schools;
  v_id         uuid;
  actor        uuid := auth.uid();
  actor_role   user_role;
  actor_campus uuid;
  rec          record;
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
      raise exception 'You do not have permission to file an outreach request for this school' using errcode = '42501';
    end if;
  end if;

  if v_school.status <> 'lead_identified' then
    raise exception 'Only a school still at Lead Identified can have an outreach request filed'
      using errcode = '23514';
  end if;

  if coalesce(trim(p_reason), '') = '' then
    raise exception 'A reason is required' using errcode = '23514';
  end if;

  insert into outreach_requests (school_id, campus_id, reason, proposed_approach, created_by)
  values (p_school_id, v_school.campus_id, trim(p_reason), nullif(trim(p_proposed_approach), ''), actor)
  returning id into v_id;

  perform change_school_status(p_school_id, 'outreach_requested', 'Outreach request filed');

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'outreach_request_create', 'outreach_request', v_id,
          jsonb_build_object('school_id', p_school_id, 'reason', p_reason));

  for rec in
    select id from public.users
     where is_active and role = 'campus_lead' and campus_id is not distinct from v_school.campus_id
  loop
    perform notify_user(
      rec.id,
      'outreach_request_created',
      'New outreach request: ' || v_school.name,
      trim(p_reason),
      '/dashboard/schools/' || p_school_id,
      'school',
      p_school_id
    );
  end loop;

  return v_id;
end;
$$;

comment on function public.create_outreach_request(uuid, text, text) is
  'Outreach Lead/Campus Lead requests pursuing a school lead; notifies the campus Campus Lead(s); advances the school to outreach_requested.';

grant execute on function public.create_outreach_request(uuid, text, text) to authenticated;

create or replace function public.review_outreach_request(
  p_request_id uuid,
  p_decision approval_status,
  p_note text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_req        outreach_requests;
  actor        uuid := auth.uid();
  actor_role   user_role;
  actor_campus uuid;
begin
  if p_decision not in ('approved','rejected') then
    raise exception 'A review decision must be approved or rejected' using errcode = '22023';
  end if;

  select * into v_req from outreach_requests where id = p_request_id for update;
  if not found then
    raise exception 'Outreach request % not found', p_request_id;
  end if;
  if v_req.status <> 'pending' then
    raise exception 'This outreach request has already been reviewed' using errcode = '23514';
  end if;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin')
      or (actor_role = 'campus_lead' and v_req.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to review this outreach request' using errcode = '42501';
    end if;
  end if;

  if p_decision = 'rejected' and coalesce(trim(p_note), '') = '' then
    raise exception 'A reason is required when rejecting' using errcode = '23514';
  end if;

  update outreach_requests
     set status = p_decision, reviewed_by = actor, reviewed_at = now(), review_note = nullif(trim(p_note), '')
   where id = p_request_id;

  if p_decision = 'approved' then
    perform change_school_status(v_req.school_id, 'outreach_approved', p_note);
  end if;

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'outreach_request_review', 'outreach_request', p_request_id,
          jsonb_build_object('decision', p_decision, 'note', p_note));

  if v_req.created_by is not null then
    perform notify_user(
      v_req.created_by,
      'outreach_request_' || p_decision,
      'Campus Lead ' || p_decision || ' your outreach request',
      case when p_note is not null and trim(p_note) <> '' then 'Note: ' || p_note else null end,
      '/dashboard/schools/' || v_req.school_id,
      'school',
      v_req.school_id
    );
  end if;
end;
$$;

comment on function public.review_outreach_request(uuid, approval_status, text) is
  'Campus Lead approves/rejects an outreach request; approval advances schools.status to outreach_approved. Rejection leaves the school at outreach_requested so it can be re-filed.';

grant execute on function public.review_outreach_request(uuid, approval_status, text) to authenticated;

-- ─── school_visits ───────────────────────────────────────────────────────────

create table school_visits (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references schools(id) on delete cascade,
  campus_id       uuid references campuses(id) on delete set null,

  visited_by      uuid references users(id) on delete set null,
  team_member_ids uuid[] not null default '{}',
  visited_at      timestamptz not null,
  notes           text,

  created_by      uuid references users(id) on delete set null,
  created_at      timestamptz not null default now()
);
comment on table school_visits is
  'Log of the onboarding visit to a school (visited-by, when, notes) — gates the transition to Registration. Not reviewed (unlike outreach_visit_requests, which is a separate, dual-reviewed request-to-visit feature for schools already active in the CRM).';

create index school_visits_school_idx on school_visits (school_id);
create index school_visits_campus_idx on school_visits (campus_id);

create or replace function public.set_school_visit_campus()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.campus_id is null then
    select campus_id into new.campus_id from schools where id = new.school_id;
  end if;
  return new;
end;
$$;

create trigger trg_school_visit_campus
  before insert on school_visits
  for each row execute function public.set_school_visit_campus();

alter table school_visits enable row level security;

create policy school_visits_select on school_visits for select to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_lead','exec_lead','campus_mgmt_admin') and campus_id = auth_campus())
    or created_by = auth.uid()
  );

create policy school_visits_write on school_visits for all to authenticated
  using ( is_admin() ) with check ( is_admin() );

create or replace function public.log_school_visit(
  p_school_id uuid,
  p_visited_at timestamptz,
  p_notes text default null,
  p_team_member_ids uuid[] default '{}'
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_school     schools;
  v_id         uuid;
  actor        uuid := auth.uid();
  actor_role   user_role;
  actor_campus uuid;
  rec          record;
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
      raise exception 'You do not have permission to log a visit for this school' using errcode = '42501';
    end if;
  end if;

  if v_school.status not in ('outreach_approved', 'visit_completed') then
    raise exception 'The outreach request must be approved before a visit can be logged'
      using errcode = '23514';
  end if;

  if p_visited_at is null then
    raise exception 'A visit date/time is required' using errcode = '23514';
  end if;

  insert into school_visits (school_id, visited_by, team_member_ids, visited_at, notes, created_by)
  values (p_school_id, coalesce(actor, v_school.created_by), coalesce(p_team_member_ids, '{}'),
          p_visited_at, nullif(trim(p_notes), ''), actor)
  returning id into v_id;

  -- No-op if already at visit_completed (repeat/follow-up visit) — see 0036's
  -- change_school_status same-status guard.
  perform change_school_status(p_school_id, 'visit_completed', 'Visit logged on ' || p_visited_at::date);

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'school_visit_log', 'school_visit', v_id,
          jsonb_build_object('school_id', p_school_id, 'visited_at', p_visited_at));

  for rec in
    select id from public.users
     where is_active and role in ('campus_lead','outreach_lead') and campus_id is not distinct from v_school.campus_id
  loop
    perform notify_user(
      rec.id,
      'school_visit_logged',
      'Visit logged: ' || v_school.name,
      'The school is ready for Registration.',
      '/dashboard/schools/' || p_school_id,
      'school',
      p_school_id
    );
  end loop;

  return v_id;
end;
$$;

comment on function public.log_school_visit(uuid, timestamptz, text, uuid[]) is
  'Logs an onboarding visit and advances schools.status to visit_completed; repeat calls while already visit_completed are allowed (follow-up visits) and are a no-op on status.';

grant execute on function public.log_school_visit(uuid, timestamptz, text, uuid[]) to authenticated;

commit;
