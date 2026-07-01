-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0016 Session Planning handoff (Team Dashboard PRD, Phase 2)
--
-- The outreach→execution handoff. Once a school reaches `approval_received`,
-- Outreach fills an expanded PLANNING form (coordinator, student strength,
-- class/section/classroom counts, lab/projector/internet, dates, approval
-- letter + images). A Campus/Outreach Lead then "Approves Planning", which:
--   • creates the first session (status 'planned') from the plan,
--   • links the plan to that session and marks it 'approved',
--   • advances the school pipeline approval_received → session_scheduled,
--   • notifies Execution Lead + Volunteer Lead of the campus (in-app feed).
--
-- This is the first real consumer of notify_user() (0002) — until now no code
-- path created notifications.
-- ═══════════════════════════════════════════════════════════════════════════

create type session_plan_status as enum ('draft', 'approved', 'cancelled');

create table session_plans (
  id                      uuid primary key default gen_random_uuid(),
  school_id               uuid not null references schools(id) on delete cascade,
  campus_id               uuid references campuses(id) on delete set null,
  status                  session_plan_status not null default 'draft',

  -- Point of contact who coordinates the visit (PRD §7.3 planning layer)
  coordinator_name        text,
  coordinator_phone       text,
  coordinator_designation text,

  -- Scale of the visit
  student_strength        int check (student_strength is null or student_strength >= 0),
  num_classes             int check (num_classes    is null or num_classes    >= 0),
  num_sections            int check (num_sections   is null or num_sections   >= 0),
  num_classrooms          int check (num_classrooms is null or num_classrooms >= 0),

  -- On-site infrastructure
  has_lab                 boolean not null default false,
  has_projector           boolean not null default false,
  has_internet            boolean not null default false,

  -- Scheduling seed for the created session
  session_type            session_type not null default 'awareness',
  topic                   text,
  planned_date            date,
  backup_date             date,
  start_time              time,
  end_time                time,

  -- Supporting documents (storage paths in the private `evidence` bucket)
  approval_letter_path    text,
  image_paths             text[] not null default '{}',
  logistics_notes         text,

  -- Handoff link + audit
  session_id              uuid references sessions(id) on delete set null,
  created_by              uuid references users(id) on delete set null,
  approved_by             uuid references users(id) on delete set null,
  approved_at             timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  -- One planning record per school (the next-session handoff). Re-planning for
  -- later sessions is out of Phase 2 scope.
  unique (school_id)
);
comment on table session_plans is 'Outreach→Execution planning handoff. Approve → auto-creates a session (Team Dashboard PRD Phase 2).';

create index session_plans_school_idx on session_plans (school_id);
create index session_plans_campus_idx on session_plans (campus_id);

create trigger trg_session_plans_updated
  before update on session_plans for each row execute function public.touch_updated_at();

-- Keep campus_id in sync with the school so RLS + notifications resolve.
create or replace function public.set_session_plan_campus()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.campus_id is null then
    select campus_id into new.campus_id from schools where id = new.school_id;
  end if;
  return new;
end;
$$;

create trigger trg_session_plan_campus
  before insert or update on session_plans
  for each row execute function public.set_session_plan_campus();

-- ─── RLS: campus-scoped, mirrors the schools/sessions access model ───────────
alter table session_plans enable row level security;

-- Read: admins everywhere; campus leadership (incl. Volunteer + Exec Lead) on
-- their own campus; the author.
create policy session_plans_select on session_plans for select to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_head','exec_lead','volunteer_lead')
        and campus_id = auth_campus())
    or created_by = auth.uid()
  );

-- Write (draft): the people who own outreach — Campus Lead / Outreach Head of
-- the campus, plus admins. Approval itself goes through the SECURITY DEFINER fn.
create policy session_plans_write on session_plans for all to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_head') and campus_id = auth_campus())
  )
  with check (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_head') and campus_id = auth_campus())
  );

-- ─── approve_session_plan() — the handoff ────────────────────────────────────
-- Creates the session, advances the school, and fans notifications out to the
-- campus Execution + Volunteer Leads. Trusted contexts (auth.uid() IS NULL)
-- skip the role gate, consistent with 0009/0010/0011.
create or replace function public.approve_session_plan(p_plan_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_plan        session_plans;
  v_school      schools;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
  v_session_id  uuid;
  v_topic       text;
  rec           record;
begin
  select * into v_plan from session_plans where id = p_plan_id for update;
  if not found then
    raise exception 'Planning record % not found', p_plan_id;
  end if;
  if v_plan.status = 'approved' then
    raise exception 'This planning record is already approved' using errcode = '23514';
  end if;

  select * into v_school from schools where id = v_plan.school_id;

  -- Role gate — only trusted contexts skip it.
  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin','mgmt_admin')
      or (actor_role in ('campus_lead','outreach_head')
          and v_school.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to approve this planning record' using errcode = '42501';
    end if;
  end if;

  -- A session can only be scheduled once approval has been received.
  if v_school.status <> 'approval_received' then
    raise exception 'The school must be in Approval Received before planning can be approved'
      using errcode = '42501';
  end if;

  v_topic := coalesce(nullif(trim(v_plan.topic), ''), 'AI Literacy Session');

  -- Create the session (session_number + campus_id are set by trg_session_number).
  insert into sessions (school_id, session_type, date, start_time, end_time, topic,
                        student_count, created_by)
  values (
    v_plan.school_id, v_plan.session_type,
    coalesce(v_plan.planned_date, current_date),
    v_plan.start_time, v_plan.end_time, v_topic,
    v_plan.student_strength, coalesce(actor, v_plan.created_by)
  )
  returning id into v_session_id;

  update session_plans
     set status = 'approved', session_id = v_session_id, approved_by = actor, approved_at = now()
   where id = p_plan_id;

  -- Advance the pipeline (writes school_status_history + audit_log; re-checks
  -- the actor's role, which the approver already satisfies).
  perform change_school_status(
    v_plan.school_id, 'session_scheduled',
    'Planning approved — session scheduled for ' || coalesce(v_plan.planned_date::text, 'a date to be confirmed')
  );

  -- Fan out to the campus Execution + Volunteer Leads (first use of notify_user).
  for rec in
    select id from public.users
     where is_active
       and role in ('exec_lead','volunteer_lead')
       and campus_id is not distinct from v_school.campus_id
  loop
    perform notify_user(
      rec.id,
      'session_scheduled',
      'Session scheduled: ' || v_school.name,
      'Planning was approved. A session has been created and needs a team assigned.',
      '/dashboard/sessions/' || v_session_id,
      'session',
      v_session_id
    );
  end loop;

  return v_session_id;
end;
$$;

comment on function public.approve_session_plan(uuid) is
  'Approve a planning record → create session, advance school, notify Exec + Volunteer Leads (Team Dashboard PRD Phase 2).';

grant execute on function public.approve_session_plan(uuid) to authenticated;
