import { createClient } from '@/lib/supabase/server'
import type { SessionStatus } from '@/types/database'

export type CalendarSession = {
  id: string
  date: string
  topic: string
  status: SessionStatus
  start_time: string | null
  school: { id: string; name: string } | null
}

/**
 * Scheduled sessions within [from, to) for the calendar grid. RLS scopes rows
 * to what the signed-in user may see; an optional campusId narrows further.
 */
export async function listSessionsInRange(
  from: string,
  to: string,
  campusId?: string | null,
): Promise<CalendarSession[]> {
  const supabase = await createClient()
  let query = supabase
    .from('sessions')
    .select('id, date, topic, status, start_time, school:schools(id, name)')
    .gte('date', from)
    .lt('date', to)
    .order('date', { ascending: true })
    .limit(1000)
  if (campusId) query = query.eq('campus_id', campusId)
  const { data } = await query
  return (data as unknown as CalendarSession[] | null) ?? []
}
