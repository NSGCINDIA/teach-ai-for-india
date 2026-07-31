import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export interface FinanceActionItem {
  id: string
  kind: 'EXECUTION_PLAN' | 'MISSING_BILL' | 'BUDGET_OVERRUN' | 'EXTRA_BUDGET_REQUEST'
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

export const getFinanceLeadWorkspace = cache(async (campusId: string): Promise<FinanceWorkspaceData> => {
  const supabase = await createClient()

  // 1. Campus Budget
  const { data: budget } = await supabase
    .from('campus_budgets')
    .select('allocated_amount, reserved_amount')
    .eq('campus_id', campusId)
    .maybeSingle()

  const allocatedBudget = budget?.allocated_amount ?? 100000
  const reservedBudget = budget?.reserved_amount ?? 0

  // 2. Total Spent
  const { data: expenses } = await supabase
    .from('operational_expenses')
    .select('amount, status')
    .eq('campus_id', campusId)

  const spentBudget = (expenses ?? []).reduce((sum, e) => sum + Number(e.amount), 0)
  const availableBudget = Math.max(0, allocatedBudget - reservedBudget - spentBudget)
  const utilizationRate = allocatedBudget > 0 ? Math.round(((reservedBudget + spentBudget) / allocatedBudget) * 100) : 0

  // 3. Active schools
  const { data: schools } = await supabase
    .from('schools')
    .select('id, name, status')
    .eq('campus_id', campusId)
    .eq('status', 'sessions_active')

  const activeSchoolsCount = schools?.length ?? 0

  // 4. Pending execution plan budget reviews
  const { data: pendingExecPlans } = await supabase
    .from('school_execution_plans')
    .select('id, school_id, total_budget, school:schools(name)')
    .eq('campus_id', campusId)
    .eq('status', 'campus_approved')

  // 5. Missing bills / recorded expenses
  const { data: unverifiedExpenses } = await supabase
    .from('operational_expenses')
    .select('id, school_id, amount, category, school:schools(name)')
    .eq('campus_id', campusId)
    .eq('status', 'recorded')

  // 6. Extra budget requests
  const { data: extraRequests } = await supabase
    .from('budget_increase_requests')
    .select('id, requested_amount, reason, status')
    .eq('campus_id', campusId)
    .eq('status', 'pending')

  const actionItems: FinanceActionItem[] = []

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
