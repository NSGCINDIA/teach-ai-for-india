-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0031 Finance Lead reimbursements + Campus Finance
-- Dashboard (Operational Workflow Spec v2.0, Phase 5, final)
--
-- Gives Finance Lead campus-scoped reimbursement approve/pay power (spec:
-- "Process reimbursements") via two SECURITY DEFINER RPCs, same pattern as
-- review_outreach_visit_request_finance()/review_execution_plan_finance()
-- (0028/0029): the RPC runs as table owner, which bypasses RLS entirely in
-- Postgres (no table here has FORCE ROW LEVEL SECURITY set), so all
-- role+campus gating lives in the function body — reimb_update's existing
-- admin-only RLS policy needs NO change.
--
-- The existing enforce_reimbursement_rules() trigger (0010) remains the sole
-- authority on transition legality, reviewed_by/reviewed_at stamping, and
-- terminal-state guards — these RPCs perform a plain `update` and let that
-- trigger validate/stamp, exactly as it already does for the admin path.
--
-- Also adds campus_finance_summary, joining campus_budgets to
-- finance_campus_spend for the Campus Finance Dashboard (spec: Total
-- Allocated / Approved Expenses / Remaining / Pending).
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── review_reimbursement_finance() ──────────────────────────────────────────
create or replace function public.review_reimbursement_finance(
  p_reimbursement_id uuid,
  p_decision reimbursement_status,
  p_note text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_reimb      reimbursements;
  actor        uuid := auth.uid();
  actor_role   user_role;
  actor_campus uuid;
begin
  if p_decision not in ('under_review','approved','rejected') then
    raise exception 'A review decision must be under_review, approved or rejected' using errcode = '22023';
  end if;

  select * into v_reimb from reimbursements where id = p_reimbursement_id for update;
  if not found then
    raise exception 'Reimbursement claim % not found', p_reimbursement_id;
  end if;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin','mgmt_admin')
      or (actor_role = 'finance_lead' and v_reimb.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to review this claim' using errcode = '42501';
    end if;
  end if;

  if p_decision = 'rejected' and coalesce(trim(p_note), '') = '' then
    raise exception 'A reason is required when rejecting' using errcode = '23514';
  end if;

  -- Transition legality + reviewed_by/reviewed_at stamping stays with
  -- trg_reimbursement_rules (0010) — deliberately not duplicated here.
  update reimbursements
     set status = p_decision, reviewer_note = coalesce(nullif(trim(p_note), ''), reviewer_note)
   where id = p_reimbursement_id;

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'reimbursement_finance_review', 'reimbursement', p_reimbursement_id,
          jsonb_build_object('decision', p_decision, 'note', p_note, 'amount', v_reimb.amount));

  perform notify_user(
    v_reimb.claimant_id,
    'reimbursement_' || p_decision,
    case p_decision
      when 'approved' then 'Your reimbursement claim was approved'
      when 'rejected' then 'Your reimbursement claim was rejected'
      else 'Your reimbursement claim is under review'
    end,
    case when p_note is not null and trim(p_note) <> '' then 'Note: ' || p_note else null end,
    '/dashboard/reimbursements/' || p_reimbursement_id,
    'reimbursement',
    p_reimbursement_id
  );
end;
$$;

comment on function public.review_reimbursement_finance(uuid, reimbursement_status, text) is
  'Finance Lead (or admin) reviews a reimbursement claim for their own campus (Operational Workflow Spec v2.0, Phase 5).';

grant execute on function public.review_reimbursement_finance(uuid, reimbursement_status, text) to authenticated;

-- ─── pay_reimbursement_finance() ─────────────────────────────────────────────
create or replace function public.pay_reimbursement_finance(
  p_reimbursement_id uuid,
  p_payment_date date default null,
  p_payment_reference text default null,
  p_payment_method text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_reimb      reimbursements;
  actor        uuid := auth.uid();
  actor_role   user_role;
  actor_campus uuid;
begin
  select * into v_reimb from reimbursements where id = p_reimbursement_id for update;
  if not found then
    raise exception 'Reimbursement claim % not found', p_reimbursement_id;
  end if;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin','mgmt_admin')
      or (actor_role = 'finance_lead' and v_reimb.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to mark this claim as paid' using errcode = '42501';
    end if;
  end if;

  if v_reimb.status <> 'approved' then
    raise exception 'Only approved claims can be marked as paid' using errcode = '23514';
  end if;

  update reimbursements
     set status = 'paid',
         payment_date = coalesce(p_payment_date, current_date),
         payment_reference = nullif(trim(p_payment_reference), ''),
         payment_method = nullif(trim(p_payment_method), '')
   where id = p_reimbursement_id;

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'reimbursement_finance_pay', 'reimbursement', p_reimbursement_id,
          jsonb_build_object('amount', v_reimb.amount, 'payment_reference', p_payment_reference,
                              'payment_method', p_payment_method));

  perform notify_user(
    v_reimb.claimant_id,
    'reimbursement_paid',
    'Your reimbursement claim was paid',
    'Payment of ₹' || v_reimb.amount || ' has been recorded.',
    '/dashboard/reimbursements/' || p_reimbursement_id,
    'reimbursement',
    p_reimbursement_id
  );
end;
$$;

comment on function public.pay_reimbursement_finance(uuid, date, text, text) is
  'Finance Lead (or admin) marks an approved reimbursement claim as paid for their own campus (Operational Workflow Spec v2.0, Phase 5).';

grant execute on function public.pay_reimbursement_finance(uuid, date, text, text) to authenticated;

-- ─── campus_finance_summary — "Campus Finance Dashboard" (spec Stage 9) ─────
-- Driven from campuses (publicly readable) so every active campus produces a
-- row; allocated/reserved/remaining are NULL (not 0) when no campus_budgets
-- row exists for the campus's current quarter, so the UI can distinguish
-- "no budget allocated" from "budget of ₹0". approved_expenses is
-- finance_campus_spend.approved_total ALONE — that column already includes
-- paid claims (sum(amount) filter (where status in ('approved','paid'))), so
-- adding paid_total on top would double-count every paid claim.
-- security_invoker matches campus_rollups/finance_campus_spend (0005): RLS on
-- campus_budgets/reimbursements applies per viewer. Callers must always scope
-- to a single campus_id (see lib/data/finance.ts) — querying unscoped would
-- silently null out RLS-hidden campuses' figures, indistinguishable from
-- "genuinely unbudgeted."
create or replace view campus_finance_summary
with (security_invoker = on) as
select
  c.id as campus_id,
  c.name as campus_name,
  c.quarter as period,
  b.id as budget_id,
  b.allocated_amount,
  b.reserved_amount,
  coalesce(fs.approved_total, 0) as approved_expenses,
  coalesce(fs.paid_total, 0) as paid_total,
  coalesce(fs.unpaid_liabilities, 0) as unpaid_liabilities,
  coalesce(fs.pending_count, 0) as pending_count,
  case when b.id is not null
    then b.allocated_amount - b.reserved_amount - coalesce(fs.approved_total, 0)
    else null
  end as remaining_amount
from campuses c
left join campus_budgets b on b.campus_id = c.id and b.period = c.quarter
left join finance_campus_spend fs on fs.campus_id = c.id
where c.is_active;

comment on view campus_finance_summary is
  'Per-campus Allocated/Reserved/Approved Expenses/Remaining for the Campus Finance Dashboard (Operational Workflow Spec v2.0, Phase 5). Always query scoped to one campus_id — see caller note in lib/data/finance.ts.';
