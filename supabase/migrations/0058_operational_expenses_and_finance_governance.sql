-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0058 Operational Expenses & Finance Governance (Phase 4)
--
-- Operational Finance & Governance:
--   1. Creates operational_expenses table & categories
--   2. Enforces Hard Budget Safety in review_school_execution_plan_finance RPC
--   3. Adds record_operational_expense & verify_operational_expense RPCs
--   4. RLS policies for campus-bound finance management
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─── 1. Operational Expense Enums & Table ───────────────────────────────────

DO $$ BEGIN
  CREATE TYPE public.operational_expense_category AS ENUM (
    'transport', 'materials', 'equipment', 'printing', 'food', 'logistics', 'school_visit', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.operational_expense_status AS ENUM (
    'draft', 'recorded', 'bill_attached', 'verified', 'closed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.operational_expenses (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id           uuid NOT NULL REFERENCES public.campuses(id) ON DELETE CASCADE,
  school_id           uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  session_id          uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
  execution_plan_id   uuid REFERENCES public.school_execution_plans(id) ON DELETE SET NULL,
  category            public.operational_expense_category NOT NULL DEFAULT 'transport',
  amount              numeric(10,2) NOT NULL CHECK (amount > 0),
  description         text,
  expense_date        date NOT NULL DEFAULT CURRENT_DATE,
  bill_url            text,
  vendor_name         text,
  reference_number    text,
  status              public.operational_expense_status NOT NULL DEFAULT 'recorded',
  created_by          uuid REFERENCES public.users(id),
  verified_by         uuid REFERENCES public.users(id),
  verified_at         timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.operational_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY operational_expenses_select ON public.operational_expenses
  FOR SELECT TO authenticated
  USING (
    auth_campus() IS NULL
    OR campus_id IS NOT DISTINCT FROM auth_campus()
  );

CREATE POLICY operational_expenses_insert ON public.operational_expenses
  FOR INSERT TO authenticated
  WITH CHECK (
    auth_role() IN ('super_admin','finance_lead','campus_mgmt_admin','campus_lead','exec_lead')
    AND (auth_campus() IS NULL OR campus_id IS NOT DISTINCT FROM auth_campus())
  );

CREATE POLICY operational_expenses_update ON public.operational_expenses
  FOR UPDATE TO authenticated
  USING (
    auth_role() IN ('super_admin','finance_lead','campus_mgmt_admin','campus_lead')
    AND (auth_campus() IS NULL OR campus_id IS NOT DISTINCT FROM auth_campus())
  );


-- ─── 2. Hard Budget Safety Check in Finance Review RPC ──────────────────────

CREATE OR REPLACE FUNCTION public.review_school_execution_plan_finance(
  p_plan_id  uuid,
  p_decision text, -- 'approved' | 'changes_requested'
  p_comments text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_plan         school_execution_plans;
  v_school       schools;
  v_budget       campus_budgets;
  v_approved_sum numeric;
  v_available    numeric;
  actor          uuid := auth.uid();
  actor_role     user_role;
  actor_campus   uuid;
BEGIN
  SELECT * INTO v_plan FROM school_execution_plans WHERE id = p_plan_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Execution plan % not found', p_plan_id; END IF;

  IF v_plan.status <> 'campus_approved' THEN
    RAISE EXCEPTION 'Plan must be approved by Campus Lead before Finance review (current status: %)', v_plan.status
      USING errcode = '23514';
  END IF;

  SELECT * INTO v_school FROM schools WHERE id = v_plan.school_id;

  IF actor IS NOT NULL THEN
    SELECT role, campus_id INTO actor_role, actor_campus FROM public.users WHERE id = actor;
    IF NOT (
      actor_role IN ('super_admin')
      OR (actor_role IN ('finance_lead')
          AND v_school.campus_id IS NOT DISTINCT FROM actor_campus)
    ) THEN
      RAISE EXCEPTION 'You do not have permission to review execution plan budgets' USING errcode = '42501';
    END IF;
  END IF;

  IF p_decision = 'approved' THEN
    -- Hard Budget Safety: Check available campus allocation
    IF v_school.campus_id IS NOT NULL THEN
      SELECT * INTO v_budget FROM campus_budgets WHERE campus_id = v_school.campus_id FOR UPDATE;
      IF FOUND THEN
        SELECT coalesce(sum(total_budget), 0) INTO v_approved_sum
          FROM school_execution_plans
         WHERE campus_id = v_school.campus_id AND status = 'approved' AND id <> p_plan_id;

        v_available := coalesce(v_budget.allocated_amount, 0) - coalesce(v_budget.reserved_amount, 0) - v_approved_sum;

        IF v_plan.total_budget > v_available THEN
          RAISE EXCEPTION 'BUDGET LIMIT EXCEEDED: Requested total budget ₹% exceeds available campus budget ₹% (Allocated: ₹%, Reserved: ₹%, Approved Plans: ₹%)',
            v_plan.total_budget, v_available, v_budget.allocated_amount, v_budget.reserved_amount, v_approved_sum
            USING errcode = '23514';
        END IF;

        -- Reserve budget
        UPDATE campus_budgets
           SET reserved_amount = coalesce(reserved_amount, 0) + v_plan.total_budget,
               updated_at = now()
         WHERE campus_id = v_school.campus_id;
      END IF;
    END IF;

    UPDATE school_execution_plans
       SET status = 'approved',
           finance_reviewed_by = actor,
           finance_reviewed_at = now(),
           finance_comments = p_comments,
           updated_at = now()
     WHERE id = p_plan_id;

    UPDATE schools
       SET operational_phase = 'execution_ready',
           updated_at = now()
     WHERE id = v_plan.school_id;

  ELSIF p_decision = 'changes_requested' THEN
    IF coalesce(nullif(trim(p_comments),''), null) IS NULL THEN
      RAISE EXCEPTION 'Comments are required when requesting budget changes' USING errcode = '23514';
    END IF;

    UPDATE school_execution_plans
       SET status = 'finance_changes_requested',
           finance_reviewed_by = actor,
           finance_reviewed_at = now(),
           finance_comments = p_comments,
           updated_at = now()
     WHERE id = p_plan_id;

  ELSE
    RAISE EXCEPTION 'Invalid decision %', p_decision USING errcode = '23514';
  END IF;

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'review_school_execution_plan_finance', 'school_execution_plan', p_plan_id,
          jsonb_build_object('decision', p_decision, 'total_budget', v_plan.total_budget));
END;
$$;

GRANT EXECUTE ON FUNCTION public.review_school_execution_plan_finance TO authenticated;


-- ─── 3. Record Operational Expense RPC ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.record_operational_expense(
  p_school_id           uuid,
  p_session_id          uuid DEFAULT NULL,
  p_category            public.operational_expense_category DEFAULT 'transport',
  p_amount              numeric DEFAULT 0,
  p_description         text DEFAULT NULL,
  p_expense_date        date DEFAULT CURRENT_DATE,
  p_bill_url            text DEFAULT NULL,
  p_vendor_name         text DEFAULT NULL,
  p_reference_number    text DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_school      schools;
  v_expense_id  uuid;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
  v_status      public.operational_expense_status := 'recorded';
BEGIN
  SELECT * INTO v_school FROM schools WHERE id = p_school_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'School % not found', p_school_id; END IF;

  IF actor IS NOT NULL THEN
    SELECT role, campus_id INTO actor_role, actor_campus FROM public.users WHERE id = actor;
    IF NOT (
      actor_role IN ('super_admin')
      OR (actor_role IN ('finance_lead','exec_lead','campus_mgmt_admin','campus_lead')
          AND v_school.campus_id IS NOT DISTINCT FROM actor_campus)
    ) THEN
      RAISE EXCEPTION 'You do not have permission to record operational expenses' USING errcode = '42501';
    END IF;
  END IF;

  IF coalesce(p_amount, 0) <= 0 THEN
    RAISE EXCEPTION 'Expense amount must be greater than zero' USING errcode = '23514';
  END IF;

  IF coalesce(nullif(trim(p_bill_url),''), null) IS NOT NULL THEN
    v_status := 'bill_attached';
  END IF;

  INSERT INTO operational_expenses (
    campus_id, school_id, session_id, category, amount, description,
    expense_date, bill_url, vendor_name, reference_number, status, created_by
  ) VALUES (
    v_school.campus_id, p_school_id, p_session_id, p_category, p_amount, p_description,
    coalesce(p_expense_date, CURRENT_DATE), p_bill_url, p_vendor_name, p_reference_number,
    v_status, actor
  ) RETURNING id INTO v_expense_id;

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'record_operational_expense', 'operational_expense', v_expense_id,
          jsonb_build_object('school_id', p_school_id, 'session_id', p_session_id, 'amount', p_amount, 'category', p_category));

  RETURN v_expense_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_operational_expense TO authenticated;


-- ─── 4. Verify Operational Expense RPC ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.verify_operational_expense(
  p_expense_id uuid
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_expense    operational_expenses;
  actor        uuid := auth.uid();
  actor_role   user_role;
  actor_campus uuid;
BEGIN
  SELECT * INTO v_expense FROM operational_expenses WHERE id = p_expense_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Expense % not found', p_expense_id; END IF;

  IF actor IS NOT NULL THEN
    SELECT role, campus_id INTO actor_role, actor_campus FROM public.users WHERE id = actor;
    IF NOT (
      actor_role IN ('super_admin')
      OR (actor_role IN ('finance_lead')
          AND v_expense.campus_id IS NOT DISTINCT FROM actor_campus)
    ) THEN
      RAISE EXCEPTION 'Only Finance Lead can verify operational expenses' USING errcode = '42501';
    END IF;
  END IF;

  UPDATE operational_expenses
     SET status = 'verified',
         verified_by = actor,
         verified_at = now(),
         updated_at = now()
   WHERE id = p_expense_id;

  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail)
  VALUES (actor, 'verify_operational_expense', 'operational_expense', p_expense_id,
          jsonb_build_object('amount', v_expense.amount, 'category', v_expense.category));
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_operational_expense TO authenticated;

COMMIT;
