-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0028 Execution Plans (Operational Workflow Spec v2.0,
-- Phase 3, Stages 5-6)
--
-- Execution Lead submits an execution plan for an existing (planned) session:
-- logistics, equipment checklist, teaching resources, estimated transport
-- cost, session readiness. Two SEQUENTIAL reviews (unlike Phase 2's either-
-- order dual approval — spec Stage 6 explicitly says Campus Lead approval is
-- "automatically forwarded to" Finance Lead):
--   • Campus Lead — volunteer team / equipment / logistics / readiness.
--   • Finance Lead — transport budget, checked+reserved against the campus's
--     current-quarter campus_budgets row (0026), ONLY reachable once the
--     Campus Lead leg is approved.
-- Full approval gates the existing session state machine: a session cannot
-- move planned → in_progress until its execution plan is approved (added to
-- enforce_session_transition() below).
--
-- NOTE: sessions.status = 'campus_approved' is an existing, unrelated,
-- POST-report review status — do not confuse it with this PRE-execution
-- execution-plan approval concept.
-- ═══════════════════════════════════════════════════════════════════════════

create table execution_plans (
  id                        uuid primary key default gen_random_uuid(),
  session_id                uuid not null references sessions(id) on delete cascade,
  campus_id                 uuid references campuses(id) on delete set null,

  logistics_notes           text not null,

  has_laptop                boolean not null default false,
  has_projector             boolean not null default false,
  has_hdmi_cable            boolean not null default false,
  has_extension_board       boolean not null default false,
  has_speaker               boolean not null default false,
  has_internet_device       boolean not null default false,
  other_equipment           text,

  teaching_resources        text,
  estimated_transport_cost  numeric(12,2) not null check (estimated_transport_cost >= 0),
  session_ready             boolean not null default false,

  -- Derived overall state, stamped directly by the RPCs below (not a view) —
  -- same convention as outreach_visit_requests.status.
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
comment on table execution_plans is
  'Execution Plan — Execution Lead submits, sequential Campus Lead → Finance Lead review; approval gates sessions.planned → in_progress (Operational Workflow Spec v2.0, Phase 3 Stages 5-6).';

create index execution_plans_session_idx on execution_plans (session_id);
create index execution_plans_campus_idx on execution_plans (campus_id);

-- At most one open (pending) plan per session — same convention as
-- outreach_visit_requests_one_pending_per_school (0027). Resubmission after
-- rejection creates a new row.
create unique index execution_plans_one_pending_per_session
  on execution_plans (session_id) where (status = 'pending');

create trigger trg_execution_plans_updated
  before update on execution_plans for each row execute function public.touch_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table execution_plans enable row level security;

create policy execution_plans_select on execution_plans for select to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','exec_lead','finance_lead','campus_mgmt_admin')
        and campus_id = auth_campus())
    or created_by = auth.uid()
  );

-- Admin-only direct writes — every real mutation (create + both reviews) is
-- audited/notified and goes through the SECURITY DEFINER RPCs below, same
-- model as outreach_visit_requests_write (0027).
create policy execution_plans_write on execution_plans for all to authenticated
  using ( is_admin() ) with check ( is_admin() );

-- ─── create_execution_plan() ──────────────────────────────────────────────────
create or replace function public.create_execution_plan(
  p_session_id uuid,
  p_logistics_notes text,
  p_has_laptop boolean,
  p_has_projector boolean,
  p_has_hdmi_cable boolean,
  p_has_extension_board boolean,
  p_has_speaker boolean,
  p_has_internet_device boolean,
  p_other_equipment text default null,
  p_teaching_resources text default null,
  p_estimated_transport_cost numeric default 0,
  p_session_ready boolean default false
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_session     sessions;
  v_id          uuid;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
  rec           record;
begin
  select * into v_session from sessions where id = p_session_id;
  if not found then
    raise exception 'Session % not found', p_session_id;
  end if;

  -- Role gate — exec_lead only (+ admins), deliberately NOT campus_lead: the
  -- submitter and the first-leg approver must be different people.
  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin','mgmt_admin')
      or (actor_role = 'exec_lead' and v_session.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to submit an execution plan for this session'
        using errcode = '42501';
    end if;
  end if;

  if v_session.status <> 'planned' then
    raise exception 'Execution planning is only available while the session is Planned'
      using errcode = '42501';
  end if;

  if exists (select 1 from execution_plans where session_id = p_session_id and status = 'approved') then
    raise exception 'This session already has an approved execution plan' using errcode = '23514';
  end if;

  if coalesce(trim(p_logistics_notes), '') = '' then
    raise exception 'Logistics notes are required' using errcode = '23514';
  end if;
  if not p_session_ready then
    raise exception 'Confirm session readiness before submitting' using errcode = '23514';
  end if;

  insert into execution_plans
    (session_id, campus_id, logistics_notes,
     has_laptop, has_projector, has_hdmi_cable, has_extension_board, has_speaker, has_internet_device,
     other_equipment, teaching_resources, estimated_transport_cost, session_ready, created_by)
  values
    (p_session_id, v_session.campus_id, trim(p_logistics_notes),
     p_has_laptop, p_has_projector, p_has_hdmi_cable, p_has_extension_board, p_has_speaker, p_has_internet_device,
     nullif(trim(p_other_equipment), ''), nullif(trim(p_teaching_resources), ''),
     coalesce(p_estimated_transport_cost, 0), p_session_ready, actor)
  returning id into v_id;

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'execution_plan_create', 'execution_plan', v_id,
          jsonb_build_object('session_id', p_session_id, 'estimated_transport_cost', p_estimated_transport_cost));

  for rec in
    select id from public.users
     where is_active and role = 'campus_lead'
       and campus_id is not distinct from v_session.campus_id
  loop
    perform notify_user(
      rec.id,
      'execution_plan_created',
      'New execution plan: ' || v_session.topic,
      'An execution plan is ready for your review.',
      '/dashboard/sessions/' || p_session_id,
      'session',
      p_session_id
    );
  end loop;

  return v_id;
end;
$$;

comment on function public.create_execution_plan(
  uuid, text, boolean, boolean, boolean, boolean, boolean, boolean, text, text, numeric, boolean
) is 'Execution Lead submits an execution plan; notifies the campus Campus Leads (Operational Workflow Spec v2.0, Phase 3 Stage 5).';

grant execute on function public.create_execution_plan(
  uuid, text, boolean, boolean, boolean, boolean, boolean, boolean, text, text, numeric, boolean
) to authenticated;

-- ─── recompute_execution_plan_status() — shared derivation ──────────────────
create or replace function public.recompute_execution_plan_status(p_id uuid)
returns approval_status language plpgsql security definer set search_path = public as $$
declare
  v_campus  approval_status;
  v_finance approval_status;
  v_new     approval_status;
begin
  select campus_lead_review, finance_lead_review into v_campus, v_finance
    from execution_plans where id = p_id;

  v_new := case
    when v_campus = 'rejected' or v_finance = 'rejected' then 'rejected'
    when v_campus = 'approved' and v_finance = 'approved' then 'approved'
    else 'pending'
  end;

  update execution_plans set status = v_new where id = p_id;
  return v_new;
end;
$$;

-- ─── review_execution_plan_campus() ──────────────────────────────────────────
create or replace function public.review_execution_plan_campus(
  p_plan_id uuid,
  p_decision approval_status,
  p_note text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_plan       execution_plans;
  v_session    sessions;
  actor        uuid := auth.uid();
  actor_role   user_role;
  actor_campus uuid;
  v_status     approval_status;
  rec          record;
begin
  if p_decision not in ('approved','rejected') then
    raise exception 'A review decision must be approved or rejected' using errcode = '22023';
  end if;

  select * into v_plan from execution_plans where id = p_plan_id for update;
  if not found then
    raise exception 'Execution plan % not found', p_plan_id;
  end if;
  if v_plan.campus_lead_review <> 'pending' then
    raise exception 'This plan has already been reviewed by the Campus Lead' using errcode = '23514';
  end if;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin','mgmt_admin')
      or (actor_role = 'campus_lead' and v_plan.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to record the Campus Lead review' using errcode = '42501';
    end if;
  end if;

  if p_decision = 'rejected' and coalesce(trim(p_note), '') = '' then
    raise exception 'A reason is required when rejecting' using errcode = '23514';
  end if;

  update execution_plans
     set campus_lead_review = p_decision, campus_lead_reviewed_by = actor,
         campus_lead_reviewed_at = now(), campus_lead_note = nullif(trim(p_note), '')
   where id = p_plan_id;

  v_status := recompute_execution_plan_status(p_plan_id);

  select * into v_session from sessions where id = v_plan.session_id;

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'execution_plan_campus_review', 'execution_plan', p_plan_id,
          jsonb_build_object('decision', p_decision, 'note', p_note, 'resulting_status', v_status));

  if p_decision = 'approved' then
    -- Forwarded to Finance Lead — notify every Finance Lead of the campus.
    for rec in
      select id from public.users
       where is_active and role = 'finance_lead'
         and campus_id is not distinct from v_plan.campus_id
    loop
      perform notify_user(
        rec.id,
        'execution_plan_forwarded_to_finance',
        'Execution plan ready for finance review: ' || coalesce(v_session.topic, 'a session'),
        'The Campus Lead has approved this execution plan — it now needs your review.',
        '/dashboard/sessions/' || v_plan.session_id,
        'session',
        v_plan.session_id
      );
    end loop;
    if v_plan.created_by is not null then
      perform notify_user(
        v_plan.created_by,
        'execution_plan_campus_approved',
        'Campus Lead approved your execution plan: ' || coalesce(v_session.topic, 'a session'),
        'Forwarded to the Finance Lead for review.',
        '/dashboard/sessions/' || v_plan.session_id,
        'session',
        v_plan.session_id
      );
    end if;
  elsif v_plan.created_by is not null then
    perform notify_user(
      v_plan.created_by,
      'execution_plan_campus_rejected',
      'Campus Lead rejected your execution plan: ' || coalesce(v_session.topic, 'a session'),
      coalesce('Reason: ' || p_note, 'No reason given.'),
      '/dashboard/sessions/' || v_plan.session_id,
      'session',
      v_plan.session_id
    );
  end if;
end;
$$;

comment on function public.review_execution_plan_campus(uuid, approval_status, text) is
  'Campus Lead reviews an execution plan; on approval, forwards to Finance Lead (Operational Workflow Spec v2.0, Phase 3 Stage 6).';

grant execute on function public.review_execution_plan_campus(uuid, approval_status, text) to authenticated;

-- ─── review_execution_plan_finance() ─────────────────────────────────────────
-- Sequential gate: cannot review until the Campus Lead leg is approved. Budget
-- lock/check/reserve mirrors review_outreach_visit_request_finance() (0027) —
-- locks the campus_budgets row before computing availability so concurrent
-- approvals against the same budget pool can't jointly overdraw it. Lock order
-- stays execution_plans row → campus_budgets row, matching 0027's invariant.
create or replace function public.review_execution_plan_finance(
  p_plan_id uuid,
  p_decision approval_status,
  p_note text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_plan        execution_plans;
  v_session     sessions;
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

  select * into v_plan from execution_plans where id = p_plan_id for update;
  if not found then
    raise exception 'Execution plan % not found', p_plan_id;
  end if;
  if v_plan.finance_lead_review <> 'pending' then
    raise exception 'This plan has already been reviewed by the Finance Lead' using errcode = '23514';
  end if;

  select * into v_session from sessions where id = v_plan.session_id;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin','mgmt_admin')
      or (actor_role = 'finance_lead' and v_plan.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to record the Finance Lead review' using errcode = '42501';
    end if;
  end if;

  if v_plan.campus_lead_review <> 'approved' then
    raise exception 'The Campus Lead must approve this execution plan before Finance can review'
      using errcode = '23514';
  end if;

  if p_decision = 'rejected' and coalesce(trim(p_note), '') = '' then
    raise exception 'A reason is required when rejecting' using errcode = '23514';
  end if;

  if p_decision = 'approved' then
    select * into v_campus from campuses where id = v_plan.campus_id;
    if v_campus.id is null or coalesce(trim(v_campus.quarter), '') = '' then
      raise exception 'No active budget period is set for this campus' using errcode = '23514';
    end if;

    select * into v_budget from campus_budgets
      where campus_id = v_plan.campus_id and period = v_campus.quarter
      for update;

    if not found then
      raise exception 'No budget allocated for % in %; ask an admin to allocate one before approving',
        coalesce(v_session.topic, 'this session'), v_campus.quarter using errcode = '23514';
    end if;

    v_available := v_budget.allocated_amount - v_budget.reserved_amount;
    if v_available < v_plan.estimated_transport_cost then
      raise exception 'Insufficient budget for %: ₹% available of ₹% allocated, ₹% requested',
        v_campus.quarter, v_available, v_budget.allocated_amount, v_plan.estimated_transport_cost
        using errcode = '23514';
    end if;

    update campus_budgets set reserved_amount = reserved_amount + v_plan.estimated_transport_cost
     where id = v_budget.id;
  end if;

  update execution_plans
     set finance_lead_review = p_decision, finance_lead_reviewed_by = actor,
         finance_lead_reviewed_at = now(), finance_lead_note = nullif(trim(p_note), '')
   where id = p_plan_id;

  v_status := recompute_execution_plan_status(p_plan_id);

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'execution_plan_finance_review', 'execution_plan', p_plan_id,
          jsonb_build_object('decision', p_decision, 'note', p_note, 'resulting_status', v_status,
                              'estimated_transport_cost', v_plan.estimated_transport_cost));

  if v_plan.created_by is not null then
    perform notify_user(
      v_plan.created_by,
      'execution_plan_finance_' || p_decision,
      'Finance Lead ' || p_decision || ' your execution plan: ' || coalesce(v_session.topic, 'a session'),
      case
        when v_status = 'approved' then 'Both approvals are in — the session may now move to In Progress.'
        when v_status = 'rejected' then coalesce('Reason: ' || p_note, 'No reason given.')
        else null
      end,
      '/dashboard/sessions/' || v_plan.session_id,
      'session',
      v_plan.session_id
    );
  end if;
end;
$$;

comment on function public.review_execution_plan_finance(uuid, approval_status, text) is
  'Finance Lead reviews estimated transport cost vs campus_budgets and reserves on approval; only reachable after Campus Lead approval (Operational Workflow Spec v2.0, Phase 3 Stage 6).';

grant execute on function public.review_execution_plan_finance(uuid, approval_status, text) to authenticated;

-- ─── enforce_session_transition() — add the execution-plan gate ─────────────
-- Full redefinition (same pattern already used by 0024 for change_school_status):
-- byte-for-byte copy of the 0010 body plus one new block. The old.status =
-- 'planned' guard scopes the new check to the FIRST forward transition only,
-- so pre-existing sessions already past 'planned' and the legitimate
-- reported → in_progress reopen edge are both unaffected.
create or replace function public.enforce_session_transition()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  actor uuid := auth.uid();
  actor_role user_role;
  ok boolean;
  n_photos int;
  n_docs int;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  -- Legal edges (PRD §10.3). Cancellation allowed from any non-terminal state.
  ok := case old.status
    when 'planned'         then new.status in ('in_progress','cancelled')
    when 'in_progress'     then new.status in ('reported','cancelled')
    when 'reported'        then new.status in ('campus_approved','in_progress','cancelled')
    when 'campus_approved' then new.status in ('verified','reported','cancelled')
    when 'verified'        then new.status in ('cancelled')
    when 'cancelled'       then false
    else false
  end;
  if not ok then
    raise exception 'Illegal session transition % → %', old.status, new.status using errcode = '42501';
  end if;

  if actor is not null then
    select role into actor_role from public.users where id = actor;
  end if;

  -- Execution plan gate (Operational Workflow Spec v2.0, Phase 3 Stage 6):
  -- a session may only start once its execution plan is approved.
  if new.status = 'in_progress' and old.status = 'planned' then
    if not exists (
      select 1 from execution_plans where session_id = new.id and status = 'approved'
    ) then
      raise exception 'Cannot start session: the execution plan must be approved first'
        using errcode = '23514';
    end if;
  end if;

  -- "Reported" gate: counts, topic, ≥1 photo, ≥1 attendance document.
  if new.status = 'reported' then
    if coalesce(new.student_count,0) <= 0
       or coalesce(new.volunteer_count,0) <= 0
       or coalesce(nullif(trim(new.topic),''), null) is null then
      raise exception 'Cannot report session: student count, volunteer count and topic are required'
        using errcode = '23514';
    end if;
    select count(*) filter (where file_type = 'photo'),
           count(*) filter (where file_type = 'document')
      into n_photos, n_docs
      from media_assets
      where session_id = new.id and deleted_at is null;
    if n_photos < 1 or n_docs < 1 then
      raise exception 'Cannot report session: at least 1 photo and 1 attendance document are required'
        using errcode = '23514';
    end if;
  end if;

  -- Cancellation needs Campus Lead+ and a reason note.
  if new.status = 'cancelled' then
    if actor is not null and not (actor_role in ('super_admin','mgmt_admin','campus_lead')) then
      raise exception 'Only Campus Lead or above may cancel a session' using errcode = '42501';
    end if;
    if coalesce(nullif(trim(new.notes),''), null) is null then
      raise exception 'Cancellation requires a reason in notes' using errcode = '23514';
    end if;
  end if;

  -- Stamp approver/verifier on forward transitions.
  if new.status = 'campus_approved' and actor is not null then
    new.reviewed_by := actor; new.reviewed_at := now();
  elsif new.status = 'verified' and actor is not null then
    new.verified_by := actor; new.verified_at := now();
  end if;

  return new;
end;
$$;
