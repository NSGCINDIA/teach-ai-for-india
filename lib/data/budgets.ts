import { createClient } from '@/lib/supabase/server'
import type { CampusBudgetRow, BudgetIncreaseRequestRow } from '@/types/database'

/** A campus's budget for one period (its current quarter), if allocated. */
export async function getCampusBudget(campusId: string, period: string): Promise<CampusBudgetRow | null> {
  if (!period) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from('campus_budgets')
    .select('*')
    .eq('campus_id', campusId)
    .eq('period', period)
    .maybeSingle()
  return (data as CampusBudgetRow | null) ?? null
}

/** A campus's budget increase requests, newest first (pending + history). */
export async function listBudgetIncreaseRequests(
  campusId: string,
  limit = 10,
): Promise<BudgetIncreaseRequestRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('budget_increase_requests')
    .select('*')
    .eq('campus_id', campusId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data as BudgetIncreaseRequestRow[] | null) ?? []
}
