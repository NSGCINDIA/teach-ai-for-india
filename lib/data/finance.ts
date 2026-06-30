import { createClient } from '@/lib/supabase/server'
import type { ReimbursementRow, ReimbursementStatus } from '@/types/database'

export type ReimbursementListItem = ReimbursementRow & {
  claimant: { id: string; full_name: string } | null
  session: { id: string; topic: string; session_number: number; date: string } | null
  campus: { id: string; name: string } | null
}

export interface ClaimFilters {
  status?: ReimbursementStatus
  campus_id?: string
  claimant_id?: string
}

const SELECT =
  `*, claimant:users!reimbursements_claimant_id_fkey(id, full_name),
   session:sessions(id, topic, session_number, date),
   campus:campuses(id, name)`

export async function listReimbursements(filters: ClaimFilters = {}): Promise<ReimbursementListItem[]> {
  const supabase = await createClient()
  let query = supabase
    .from('reimbursements')
    .select(SELECT)
    .order('created_at', { ascending: false })
    .limit(500)

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.campus_id) query = query.eq('campus_id', filters.campus_id)
  if (filters.claimant_id) query = query.eq('claimant_id', filters.claimant_id)

  const { data, error } = await query
  if (error || !data) return []
  return data as unknown as ReimbursementListItem[]
}

export async function getReimbursement(id: string): Promise<ReimbursementListItem | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('reimbursements').select(SELECT).eq('id', id).single()
  if (error || !data) return null
  return data as unknown as ReimbursementListItem
}

export type ClaimableSession = { id: string; topic: string; session_number: number; date: string }

/** Sessions the user attended within the claim window — candidates for a new claim. */
export async function listClaimableSessions(userId: string): Promise<ClaimableSession[]> {
  const supabase = await createClient()
  const { data: windowDays } = await supabase.rpc('reimbursement_window_days')
  const days = typeof windowDays === 'number' ? windowDays : 14
  const cutoff = new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10)

  const { data } = await supabase
    .from('attendance_records')
    .select('session:sessions(id, topic, session_number, date)')
    .eq('user_id', userId)
    .in('status', ['present', 'late', 'left_early'])

  const rows = (data as unknown as { session: ClaimableSession | null }[] | null) ?? []
  const seen = new Set<string>()
  const out: ClaimableSession[] = []
  for (const r of rows) {
    const s = r.session
    if (s && s.date >= cutoff && !seen.has(s.id)) {
      seen.add(s.id)
      out.push(s)
    }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date))
}

export type FinanceSummary = {
  pending_count: number
  approved_total: number
  paid_total: number
  unpaid_liabilities: number
  month_to_date: number
}

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('finance_campus_spend')
    .select('pending_count, approved_total, paid_total, unpaid_liabilities, month_to_date')
  const rows = (data as FinanceSummary[] | null) ?? []
  return rows.reduce<FinanceSummary>(
    (acc, r) => ({
      pending_count: acc.pending_count + Number(r.pending_count || 0),
      approved_total: acc.approved_total + Number(r.approved_total || 0),
      paid_total: acc.paid_total + Number(r.paid_total || 0),
      unpaid_liabilities: acc.unpaid_liabilities + Number(r.unpaid_liabilities || 0),
      month_to_date: acc.month_to_date + Number(r.month_to_date || 0),
    }),
    { pending_count: 0, approved_total: 0, paid_total: 0, unpaid_liabilities: 0, month_to_date: 0 },
  )
}

export async function getMonthlyTrend(): Promise<{ month: string; approved_total: number }[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('finance_monthly_trend')
    .select('month, approved_total')
    .order('month', { ascending: true })
  return (data as { month: string; approved_total: number }[] | null) ?? []
}
