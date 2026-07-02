import { createClient } from '@/lib/supabase/server'
import type { SessionPlanRow } from '@/types/database'

/**
 * The planning record for a school, if one exists (unique per school — the
 * next-session handoff). RLS scopes visibility to the campus. Returns null when
 * no plan has been started yet.
 */
export async function getPlanForSchool(schoolId: string): Promise<SessionPlanRow | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('session_plans')
    .select('*')
    .eq('school_id', schoolId)
    .maybeSingle()
  return (data as SessionPlanRow | null) ?? null
}

export type CampusPlan = SessionPlanRow & { school: { id: string; name: string } | null }

/** Every planning record for a campus — approval-letter tracking index (Team Dashboard PRD follow-up). */
export async function listPlansForCampus(campusId: string): Promise<CampusPlan[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('session_plans')
    .select('*, school:schools(id, name)')
    .eq('campus_id', campusId)
    .order('planned_date', { ascending: true, nullsFirst: false })
  return (data as unknown as CampusPlan[] | null) ?? []
}
