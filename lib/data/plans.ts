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
