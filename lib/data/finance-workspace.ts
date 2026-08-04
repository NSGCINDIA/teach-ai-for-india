import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export interface FinanceActionItem {
  id: string
  kind: 'EXECUTION_PLAN' | 'MISSING_BILL' | 'BUDGET_OVERRUN' | 'EXTRA_BUDGET_REQUEST' | 'OUTREACH_VISIT_REQUEST'
  title: string
  subtitle: string
  amount: number
  schoolId?: string
  sessionId?: string
  status: string
}

export interface FinanceWorkspaceData {
  allocatedBudget: number
  reservedBudget: number
  spentBudget: number
  availableBudget: number
  utilizationRate: number
  activeSchoolsCount: number
  pendingExpensesCount: number
  extraBudgetRequestsCount: number
  actionItems: FinanceActionItem[]
}

export const getFinanceLeadWorkspace = cache(async (campusId?: string | null): Promise<FinanceWorkspaceData> => {
  const supabase = await createClient()

  // 1. Campus Budget
  let budgetQuery = supabase
    .from('campus_budgets')
    .select('allocated_amount, reserved_amount')
  if (campusId) budgetQuery = budgetQuery.eq('campus_id', campusId)
  const { data: budget } = await budgetQuery.maybeSingle()

  const allocatedBudget = budget?.allocated_amount ?? 100000
  const reservedBudget = budget?.reserved_amount ?? 0

  // 2. Total Spent
  let expensesQuery = supabase
    .from('operational_expenses')
    .select('amount, status')
  if (campusId) expensesQuery = expensesQuery.eq('campus_id', campusId)
  const { data: expenses } = await expensesQuery

  const spentBudget = (expenses ?? []).reduce((sum, e) => sum + Number(e.amount), 0)
  const availableBudget = Math.max(0, allocatedBudget - reservedBudget - spentBudget)
  const utilizationRate = allocatedBudget > 0 ? Math.round(((reservedBudget + spentBudget) / allocatedBudget) * 100) : 0

  // 3. Active schools
  let schoolsQuery = supabase
    .from('schools')
    .select('id, name, status')
    .eq('status', 'sessions_active')
  if (campusId) schoolsQuery = schoolsQuery.eq('campus_id', campusId)
  const { data: schools } = await schoolsQuery

  const activeSchoolsCount = schools?.length ?? 0

  // 4. Pending Outreach Visit Requests awaiting Finance Lead Review
  let outreachQuery = supabase
    .from('outreach_visit_requests')
    .select('id, school_id, estimated_travel_cost, priority, expected_outcomes, school:schools(name)')
    .eq('finance_lead_review', 'pending')
  if (campusId) outreachQuery = outreachQuery.eq('campus_id', campusId)
  const { data: pendingOutreachRequests } = await outreachQuery

  // 5. Pending execution plan budget reviews
  let execPlanQuery = supabase
    .from('school_execution_plans')
    .select('id, school_id, total_budget, school:schools(name)')
    .eq('status', 'campus_approved')
  if (campusId) execPlanQuery = execPlanQuery.eq('campus_id', campusId)
  const { data: pendingExecPlans } = await execPlanQuery

  // 6. Missing bills / recorded expenses
  let unverifiedQuery = supabase
    .from('operational_expenses')
    .select('id, school_id, amount, category, school:schools(name)')
    .eq('status', 'recorded')
  if (campusId) unverifiedQuery = unverifiedQuery.eq('campus_id', campusId)
  const { data: unverifiedExpenses } = await unverifiedQuery

  // 7. Extra budget requests
  let extraQuery = supabase
    .from('budget_increase_requests')
    .select('id, requested_amount, reason, status')
    .eq('status', 'pending')
  if (campusId) extraQuery = extraQuery.eq('campus_id', campusId)
  const { data: extraRequests } = await extraQuery

  const actionItems: FinanceActionItem[] = []

  if (pendingOutreachRequests) {
    for (const r of pendingOutreachRequests as any[]) {
      const outcomes = Array.isArray(r.expected_outcomes) ? r.expected_outcomes.join(', ') : ''
      actionItems.push({
        id: r.id,
        kind: 'OUTREACH_VISIT_REQUEST',
        title: `Outreach Visit Travel Cost Approval: ${r.school?.name ?? 'School'}`,
        subtitle: `Est. Travel Cost ₹${r.estimated_travel_cost} · ${r.priority ?? 'Normal'} Priority${outcomes ? ` (${outcomes})` : ''}`,
        amount: Number(r.estimated_travel_cost),
        schoolId: r.school_id,
        status: 'Awaiting Finance Review',
      })
    }
  }

  if (pendingExecPlans) {
    for (const p of pendingExecPlans as any[]) {
      actionItems.push({
        id: p.id,
        kind: 'EXECUTION_PLAN',
        title: `Execution Plan Budget Review: ${p.school?.name ?? 'School'}`,
        subtitle: 'Reviewed by Campus Lead; awaiting Finance Lead budget approval',
        amount: Number(p.total_budget),
        schoolId: p.school_id,
        status: 'Awaiting Review',
      })
    }
  }

  if (unverifiedExpenses) {
    for (const e of unverifiedExpenses as any[]) {
      actionItems.push({
        id: e.id,
        kind: 'MISSING_BILL',
        title: `Bill Attached Needed: ${e.school?.name ?? 'School'} (${e.category})`,
        subtitle: 'Expense recorded; receipt upload/verification required',
        amount: Number(e.amount),
        schoolId: e.school_id,
        status: 'Bill Missing',
      })
    }
  }

  if (extraRequests) {
    for (const r of extraRequests as any[]) {
      actionItems.push({
        id: r.id,
        kind: 'EXTRA_BUDGET_REQUEST',
        title: `Extra Budget Request: ₹${r.requested_amount}`,
        subtitle: r.reason || 'Additional funding request',
        amount: Number(r.requested_amount),
        status: 'Pending Campus Approval',
      })
    }
  }

  return {
    allocatedBudget,
    reservedBudget,
    spentBudget,
    availableBudget,
    utilizationRate,
    activeSchoolsCount,
    pendingExpensesCount: unverifiedExpenses?.length ?? 0,
    extraBudgetRequestsCount: extraRequests?.length ?? 0,
    actionItems,
  }
})
