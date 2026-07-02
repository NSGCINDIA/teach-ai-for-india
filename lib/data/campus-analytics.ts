import { createClient } from '@/lib/supabase/server'
import type { CampusRollup, StatusCount } from '@/types/database'

/** Single-campus rollup vs target — RLS-scoped `campus_rollups` view (unused elsewhere until now). */
export async function getCampusRollup(campusId: string): Promise<CampusRollup | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('campus_rollups').select('*').eq('campus_id', campusId).single()
  if (!data) return null
  const row = data as Record<string, unknown>
  return {
    ...(row as unknown as CampusRollup),
    target_schools: Number(row.target_schools), target_students: Number(row.target_students),
    target_sessions: Number(row.target_sessions), schools_total: Number(row.schools_total),
    schools_reached: Number(row.schools_reached), sessions_completed: Number(row.sessions_completed),
    students_impacted: Number(row.students_impacted), volunteers: Number(row.volunteers),
  }
}

/** Session lifecycle breakdown for one campus (own-campus rows only, per RLS). */
export async function getCampusSessionFunnel(campusId: string): Promise<StatusCount[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('sessions').select('status').eq('campus_id', campusId)
  return countByStatus((data as { status: string }[] | null) ?? [])
}

/** School CRM pipeline breakdown for one campus. */
export async function getCampusSchoolPipeline(campusId: string): Promise<StatusCount[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('schools').select('status').eq('campus_id', campusId)
  return countByStatus((data as { status: string }[] | null) ?? [])
}

function countByStatus(rows: { status: string }[]): StatusCount[] {
  const counts = new Map<string, number>()
  for (const r of rows) counts.set(r.status, (counts.get(r.status) ?? 0) + 1)
  return Array.from(counts, ([status, count]) => ({ status, count }))
}
