import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { OperationalExpenseCategory, OperationalExpenseStatus } from '@/types/database'

export interface OperationalExpenseItem {
  id: string
  school_id: string
  session_id: string | null
  category: OperationalExpenseCategory
  amount: number
  description: string | null
  expense_date: string
  bill_url: string | null
  vendor_name: string | null
  reference_number: string | null
  status: OperationalExpenseStatus
  created_at: string
}

export interface SchoolFinanceSummary {
  schoolId: string
  approvedBudget: number
  budgetBreakdown: {
    transport: number
    materials: number
    equipment: number
    other: number
  }
  actualSpend: number
  remaining: number
  variance: number // positive = under budget, negative = over budget
  isOverBudget: boolean
  verifiedBillsCount: number
  totalExpensesCount: number
  categorySpends: Record<string, number>
  expenses: OperationalExpenseItem[]
  status: 'NO_PLAN' | 'IN_PROGRESS' | 'ATTENTION_REQUIRED' | 'CLOSED'
}

export interface SessionFinanceSummary {
  sessionId: string
  sessionNumber: number
  plannedBudget: number
  actualSpend: number
  variance: number
  isOverBudget: boolean
  verifiedBillsCount: number
  totalExpensesCount: number
  expenses: OperationalExpenseItem[]
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ATTENTION_REQUIRED' | 'CLOSED'
}

export interface ActivityTimelineItem {
  id: string
  action: string
  actorName: string
  createdAt: string
  detail: Record<string, any>
}

export const getSchoolFinanceSummary = cache(async (schoolId: string): Promise<SchoolFinanceSummary> => {
  try {
    const supabase = await createClient()

    const [{ data: execPlan }, { data: expensesRaw }] = await Promise.all([
      supabase
        .from('school_execution_plans')
        .select('total_budget, transport_budget, materials_budget, equipment_budget, other_budget, estimated_travel_cost, status')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('operational_expenses')
        .select('*')
        .eq('school_id', schoolId)
        .order('expense_date', { ascending: false }),
    ])

    const transportVal = Number(execPlan?.transport_budget || execPlan?.estimated_travel_cost || 0)
    const materialsVal = Number(execPlan?.materials_budget ?? 0)
    const equipmentVal = Number(execPlan?.equipment_budget ?? 0)
    const otherVal = Number(execPlan?.other_budget ?? 0)
    const totalVal = Number(execPlan?.total_budget ?? 0)

    const approvedBudget = totalVal > 0 ? totalVal : (transportVal + materialsVal + equipmentVal + otherVal)
    const budgetBreakdown = {
      transport: transportVal,
      materials: materialsVal,
      equipment: equipmentVal,
      other: otherVal,
    }

    const expenses = (expensesRaw ?? []).map((e: any) => ({
      id: e.id,
      school_id: e.school_id,
      session_id: e.session_id,
      category: e.category,
      amount: Number(e.amount ?? 0),
      description: e.description,
      expense_date: e.expense_date,
      bill_url: e.bill_url,
      vendor_name: e.vendor_name,
      reference_number: e.reference_number,
      status: e.status,
      created_at: e.created_at,
    }))

    const actualSpend = expenses.reduce((sum, e) => sum + e.amount, 0)
    const remaining = Math.max(0, approvedBudget - actualSpend)
    const variance = approvedBudget - actualSpend
    const isOverBudget = actualSpend > approvedBudget
    const verifiedBillsCount = expenses.filter((e) => e.status === 'verified').length
    const totalExpensesCount = expenses.length

    const categorySpends: Record<string, number> = {}
    for (const e of expenses) {
      if (e.category) {
        categorySpends[e.category] = (categorySpends[e.category] ?? 0) + e.amount
      }
    }

    let status: 'NO_PLAN' | 'IN_PROGRESS' | 'ATTENTION_REQUIRED' | 'CLOSED' = 'IN_PROGRESS'
    if (!execPlan) status = 'NO_PLAN'
    else if (isOverBudget || expenses.some((e) => e.status === 'recorded')) status = 'ATTENTION_REQUIRED'
    else if (totalExpensesCount > 0 && verifiedBillsCount === totalExpensesCount) status = 'CLOSED'

    return {
      schoolId,
      approvedBudget,
      budgetBreakdown,
      actualSpend,
      remaining,
      variance,
      isOverBudget,
      verifiedBillsCount,
      totalExpensesCount,
      categorySpends,
      expenses,
      status,
    }
  } catch (err) {
    console.error('getSchoolFinanceSummary error:', err)
    return {
      schoolId,
      approvedBudget: 0,
      budgetBreakdown: { transport: 0, materials: 0, equipment: 0, other: 0 },
      actualSpend: 0,
      remaining: 0,
      variance: 0,
      isOverBudget: false,
      verifiedBillsCount: 0,
      totalExpensesCount: 0,
      categorySpends: {},
      expenses: [],
      status: 'NO_PLAN',
    }
  }
})

export const getSessionFinanceSummary = cache(async (sessionId: string): Promise<SessionFinanceSummary | null> => {
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('sessions')
    .select('id, school_id, session_number')
    .eq('id', sessionId)
    .single()

  if (!session) return null

  const { data: execPlan } = await supabase
    .from('school_execution_plans')
    .select('total_budget')
    .eq('school_id', session.school_id)
    .eq('status', 'approved')
    .maybeSingle()

  const plannedBudget = execPlan ? Math.round(execPlan.total_budget / 4) : 2500

  const { data: expensesRaw } = await supabase
    .from('operational_expenses')
    .select('*')
    .eq('session_id', sessionId)
    .order('expense_date', { ascending: false })

  const expenses = (expensesRaw ?? []).map((e: any) => ({
    id: e.id,
    school_id: e.school_id,
    session_id: e.session_id,
    category: e.category,
    amount: Number(e.amount),
    description: e.description,
    expense_date: e.expense_date,
    bill_url: e.bill_url,
    vendor_name: e.vendor_name,
    reference_number: e.reference_number,
    status: e.status,
    created_at: e.created_at,
  }))

  const actualSpend = expenses.reduce((sum, e) => sum + e.amount, 0)
  const variance = plannedBudget - actualSpend
  const isOverBudget = actualSpend > plannedBudget
  const verifiedBillsCount = expenses.filter((e) => e.status === 'verified').length
  const totalExpensesCount = expenses.length

  let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ATTENTION_REQUIRED' | 'CLOSED' = 'IN_PROGRESS'
  if (totalExpensesCount === 0) status = 'NOT_STARTED'
  else if (isOverBudget || expenses.some((e) => e.status === 'recorded')) status = 'ATTENTION_REQUIRED'
  else if (verifiedBillsCount === totalExpensesCount) status = 'CLOSED'

  return {
    sessionId,
    sessionNumber: session.session_number,
    plannedBudget,
    actualSpend,
    variance,
    isOverBudget,
    verifiedBillsCount,
    totalExpensesCount,
    expenses,
    status,
  }
})

export const getSchoolActivityTimeline = cache(async (schoolId: string): Promise<ActivityTimelineItem[]> => {
  try {
    const supabase = await createClient()

    const { data: logs, error } = await supabase
      .from('audit_log')
      .select('id, action, detail, created_at, actor:users(full_name)')
      .or(`entity_id.eq.${schoolId},detail->>school_id.eq.${schoolId}`)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error || !logs) return []

    return logs.map((l: any) => {
      const actorObj = Array.isArray(l.actor) ? l.actor[0] : l.actor
      return {
        id: l.id,
        action: l.action ?? 'activity',
        actorName: actorObj?.full_name ?? 'System',
        createdAt: l.created_at,
        detail: l.detail ?? {},
      }
    })
  } catch (err) {
    console.error('getSchoolActivityTimeline error:', err)
    return []
  }
})
