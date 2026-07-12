-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0026 Campus budgets (Operational Workflow Spec v2.0)
--
-- Foundation only: a per-campus, per-period allocated budget pool. Later
-- phases (Outreach Visit Request in Phase 2, Execution Planning + Session
-- Approval in Phase 3, Finance Processing in Phase 5) will read/reserve
-- against this table as those entities are built. This migration does not
-- add any consumption logic — reserved_amount is a placeholder column Phase 3
-- will start writing to.
--
-- Deliberately no `spent_amount` column: actual spend is already derivable
-- from `reimbursements` (see finance_campus_spend, 0005_views.sql) by
-- campus_id — storing it again here would be a second source of truth.
-- ═══════════════════════════════════════════════════════════════════════════

create table campus_budgets (
  id                uuid primary key default gen_random_uuid(),
  campus_id         uuid not null references campuses(id) on delete cascade,
  period            text not null,   -- free text, same convention as campuses.quarter, e.g. 'Q3-2026'
  allocated_amount  numeric(12,2) not null default 0 check (allocated_amount >= 0),
  reserved_amount   numeric(12,2) not null default 0 check (reserved_amount >= 0),
  notes             text,
  created_by        uuid references users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (campus_id, period)
);
comment on table campus_budgets is
  'Per-campus, per-period budget pool (Operational Workflow Spec steps 2/5/6/9). Phase 1: allocation only.';

create index campus_budgets_campus_idx on campus_budgets (campus_id);

create trigger trg_campus_budgets_updated
  before update on campus_budgets for each row execute function public.touch_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table campus_budgets enable row level security;

-- Read: admins everywhere; campus leadership (Campus Lead, Campus Management
-- Admin, Finance Lead) on their own campus.
create policy campus_budgets_select on campus_budgets for select to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','campus_mgmt_admin','finance_lead') and campus_id = auth_campus())
  );

-- Write: admin-only in Phase 1 — budget allocation is an org-level financial
-- decision, mirrors how campuses.target_* columns are gated (campuses_write).
create policy campus_budgets_write on campus_budgets for all to authenticated
  using ( is_admin() ) with check ( is_admin() );

-- ─── set_campus_budget() — audited allocate/adjust ────────────────────────────
-- Follows the change_school_status() precedent (atomic + audit_log entry) for
-- financial-control writes, rather than a raw client-side UPDATE.
create or replace function public.set_campus_budget(
  p_campus_id uuid,
  p_period text,
  p_allocated_amount numeric,
  p_note text default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_id       uuid;
  actor      uuid := auth.uid();
  actor_role user_role;
begin
  if actor is not null then
    select role into actor_role from public.users where id = actor;
    if actor_role not in ('super_admin','mgmt_admin') then
      raise exception 'Only management can set a campus budget' using errcode = '42501';
    end if;
  end if;

  insert into campus_budgets (campus_id, period, allocated_amount, created_by, notes)
  values (p_campus_id, p_period, p_allocated_amount, actor, p_note)
  on conflict (campus_id, period)
  do update set allocated_amount = excluded.allocated_amount, notes = excluded.notes
  returning id into v_id;

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'budget_allocate', 'campus_budget', v_id,
          jsonb_build_object('campus_id', p_campus_id, 'period', p_period,
                              'allocated_amount', p_allocated_amount, 'note', p_note));

  return v_id;
end;
$$;

comment on function public.set_campus_budget(uuid, text, numeric, text) is
  'Allocate/adjust a campus''s budget for a period, audited (Operational Workflow Spec v2.0, Phase 1).';

grant execute on function public.set_campus_budget(uuid, text, numeric, text) to authenticated;
