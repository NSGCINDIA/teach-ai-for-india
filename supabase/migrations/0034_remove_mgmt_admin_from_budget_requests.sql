-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0034 Remove mgmt_admin from the budget-request RPCs
--
-- 0032_budget_increase_requests.sql (a concurrent, unrelated feature) was
-- written before/alongside 0033's role removal and still inlines the old
-- 'mgmt_admin' role-check pattern in three functions. Same treatment as 0033:
-- byte-for-byte copy of each function's current live body with ONLY
-- 'mgmt_admin' removed from the role-list literal.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.finance_allocate_campus_budget(
  p_campus_id uuid,
  p_allocated_amount numeric,
  p_note text default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_period     text;
  v_existing   campus_budgets;
  v_id         uuid;
  actor        uuid := auth.uid();
  actor_role   user_role;
  actor_campus uuid;
begin
  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin')
      or (actor_role = 'finance_lead' and p_campus_id is not distinct from actor_campus)
    ) then
      raise exception 'Only the Finance Lead may allocate a campus budget' using errcode = '42501';
    end if;
  end if;

  if p_allocated_amount is null or p_allocated_amount <= 0 then
    raise exception 'Enter an allocated amount greater than zero' using errcode = '23514';
  end if;

  select quarter into v_period from campuses where id = p_campus_id;
  if coalesce(trim(v_period), '') = '' then
    raise exception 'No active budget period is set for this campus' using errcode = '23514';
  end if;

  select * into v_existing from campus_budgets where campus_id = p_campus_id and period = v_period;
  if found then
    raise exception 'A budget has already been allocated for %; file a budget increase request instead of reallocating',
      v_period using errcode = '23514';
  end if;

  insert into campus_budgets (campus_id, period, allocated_amount, created_by, notes)
  values (p_campus_id, v_period, p_allocated_amount, actor, p_note)
  returning id into v_id;

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'budget_allocate', 'campus_budget', v_id,
          jsonb_build_object('campus_id', p_campus_id, 'period', v_period,
                              'allocated_amount', p_allocated_amount, 'source', 'finance_lead_self_service'));

  return v_id;
end;
$$;


create or replace function public.create_budget_increase_request(
  p_campus_id uuid,
  p_requested_amount numeric,
  p_reason text
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_period     text;
  v_budget     campus_budgets;
  v_campus     campuses;
  v_id         uuid;
  actor        uuid := auth.uid();
  actor_role   user_role;
  actor_campus uuid;
  rec          record;
begin
  select * into v_campus from campuses where id = p_campus_id;
  if not found then
    raise exception 'Campus % not found', p_campus_id;
  end if;
  v_period := v_campus.quarter;
  if coalesce(trim(v_period), '') = '' then
    raise exception 'No active budget period is set for this campus' using errcode = '23514';
  end if;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin')
      or (actor_role = 'finance_lead' and p_campus_id is not distinct from actor_campus)
    ) then
      raise exception 'Only the Finance Lead may request a budget increase' using errcode = '42501';
    end if;
  end if;

  select * into v_budget from campus_budgets where campus_id = p_campus_id and period = v_period;
  if not found then
    raise exception 'No budget exists yet for %; allocate an initial budget before requesting an increase',
      v_period using errcode = '23514';
  end if;

  if p_requested_amount is null or p_requested_amount <= 0 then
    raise exception 'Enter the additional amount needed, greater than zero' using errcode = '23514';
  end if;
  if coalesce(trim(p_reason), '') = '' then
    raise exception 'A reason is required' using errcode = '23514';
  end if;

  insert into budget_increase_requests (campus_id, period, budget_id, requested_amount, reason, created_by)
  values (p_campus_id, v_period, v_budget.id, p_requested_amount, trim(p_reason), actor)
  returning id into v_id;

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'budget_increase_request_create', 'budget_increase_request', v_id,
          jsonb_build_object('campus_id', p_campus_id, 'period', v_period, 'requested_amount', p_requested_amount));

  for rec in
    select id from public.users
     where is_active and role = 'campus_lead' and campus_id is not distinct from p_campus_id
  loop
    perform notify_user(
      rec.id,
      'budget_increase_request_created',
      'Budget increase requested: ' || v_period,
      trim(p_reason) || ' — requesting an additional ₹' || p_requested_amount || '.',
      '/dashboard',
      'budget_increase_request',
      v_id
    );
  end loop;

  return v_id;
end;
$$;


create or replace function public.review_budget_increase_request(
  p_request_id uuid,
  p_decision approval_status,
  p_note text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_req        budget_increase_requests;
  v_budget     campus_budgets;
  actor        uuid := auth.uid();
  actor_role   user_role;
  actor_campus uuid;
begin
  if p_decision not in ('approved','rejected') then
    raise exception 'A review decision must be approved or rejected' using errcode = '22023';
  end if;

  select * into v_req from budget_increase_requests where id = p_request_id for update;
  if not found then
    raise exception 'Budget increase request % not found', p_request_id;
  end if;
  if v_req.status <> 'pending' then
    raise exception 'This budget increase request has already been reviewed' using errcode = '23514';
  end if;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin')
      or (actor_role = 'campus_lead' and v_req.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to review this budget increase request' using errcode = '42501';
    end if;
  end if;

  if p_decision = 'rejected' and coalesce(trim(p_note), '') = '' then
    raise exception 'A reason is required when rejecting' using errcode = '23514';
  end if;

  if p_decision = 'approved' then
    if v_req.budget_id is not null then
      select * into v_budget from campus_budgets where id = v_req.budget_id for update;
    end if;
    if v_budget.id is null then
      -- Original row was deleted (or its FK went null) — fall back to a fresh
      -- lookup by the request's own campus_id/period in case it was re-allocated.
      select * into v_budget from campus_budgets
        where campus_id = v_req.campus_id and period = v_req.period for update;
    end if;
    if v_budget.id is null then
      raise exception 'No budget allocation exists for % anymore; ask the Finance Lead to allocate one before re-requesting an increase',
        v_req.period using errcode = '23514';
    end if;

    update campus_budgets set allocated_amount = allocated_amount + v_req.requested_amount
     where id = v_budget.id;
  end if;

  update budget_increase_requests
     set status = p_decision, reviewed_by = actor, reviewed_at = now(), review_note = nullif(trim(p_note), '')
   where id = p_request_id;

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'budget_increase_request_review', 'budget_increase_request', p_request_id,
          jsonb_build_object('decision', p_decision, 'note', p_note, 'requested_amount', v_req.requested_amount));

  if v_req.created_by is not null then
    perform notify_user(
      v_req.created_by,
      'budget_increase_request_' || p_decision,
      'Campus Lead ' || p_decision || ' your budget increase request',
      case
        when p_decision = 'approved' then
          'Additional ₹' || v_req.requested_amount || ' has been added to the ' || v_req.period || ' budget.'
        else coalesce('Reason: ' || p_note, 'No reason given.')
      end,
      '/dashboard/finance',
      'budget_increase_request',
      p_request_id
    );
  end if;
end;
$$;
