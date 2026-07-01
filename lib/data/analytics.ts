import { createClient } from '@/lib/supabase/server'
import type {
  ProgramSummary,
  CampusPerformance,
  StatusCount,
  MonthlyActivity,
} from '@/types/database'

const EMPTY_SUMMARY: ProgramSummary = {
  schools_total: 0, schools_reached: 0, sessions_completed: 0, students_impacted: 0,
  active_volunteers: 0, active_campuses: 0, states_count: 0, approved_spend: 0,
  pending_claims: 0, target_students: 0, target_sessions: 0, target_schools: 0,
}

/** Tier 1 — org-wide KPIs (PRD §7.8 / US-ANLT-01). */
export async function getProgramSummary(): Promise<ProgramSummary> {
  const supabase = await createClient()
  const { data } = await supabase.from('program_summary').select('*').single()
  if (!data) return EMPTY_SUMMARY
  // Views return numerics as strings over PostgREST — coerce to Number.
  return Object.fromEntries(
    Object.entries(EMPTY_SUMMARY).map(([k]) => [k, Number((data as Record<string, unknown>)[k] ?? 0)]),
  ) as ProgramSummary
}

/** Tier 2 — per-campus performance vs target (PRD §7.8 / US-ANLT-02). */
export async function listCampusPerformance(): Promise<CampusPerformance[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('campus_performance').select('*').order('name')
  return ((data as CampusPerformance[] | null) ?? []).map((c) => ({
    ...c,
    target_schools: Number(c.target_schools), target_students: Number(c.target_students),
    target_sessions: Number(c.target_sessions), schools_total: Number(c.schools_total),
    schools_reached: Number(c.schools_reached), sessions_completed: Number(c.sessions_completed),
    students_impacted: Number(c.students_impacted), volunteers: Number(c.volunteers),
    approved_spend: Number(c.approved_spend),
  }))
}

/** Tier 3 — session lifecycle funnel. */
export async function getSessionFunnel(): Promise<StatusCount[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('session_funnel').select('*')
  return normalizeCounts(data as StatusCount[] | null)
}

/** Tier 3 — school CRM pipeline breakdown. */
export async function getSchoolPipeline(): Promise<StatusCount[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('school_pipeline').select('*')
  return normalizeCounts(data as StatusCount[] | null)
}

/** Tier 3 — verified sessions + students per month. */
export async function getMonthlyActivity(): Promise<MonthlyActivity[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('monthly_activity').select('*').order('month')
  return ((data as MonthlyActivity[] | null) ?? []).map((m) => ({
    month: m.month,
    sessions_completed: Number(m.sessions_completed),
    students_impacted: Number(m.students_impacted),
  }))
}

function normalizeCounts(rows: StatusCount[] | null): StatusCount[] {
  return (rows ?? []).map((r) => ({ status: r.status, count: Number(r.count) }))
}
