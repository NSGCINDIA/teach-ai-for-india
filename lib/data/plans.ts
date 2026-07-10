import { createClient } from '@/lib/supabase/server'
import type { SessionPlanRow } from '@/types/database'

/**
 * The current OPEN (draft) planning record for a school, if one exists — the
 * next-session handoff. A school accumulates one approved session_plans row
 * per session it's run (school lifecycle v2, 0036/0037); this fetches only
 * the still-in-progress one. RLS scopes visibility to the campus. Returns
 * null when no plan is currently open (e.g. between sessions).
 */
export async function getPlanForSchool(schoolId: string): Promise<SessionPlanRow | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('session_plans')
    .select('*')
    .eq('school_id', schoolId)
    .eq('status', 'draft')
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
