import { createClient } from '@/lib/supabase/server'
import type { OutreachVisitRequestRow } from '@/types/database'

/** All visit requests filed for a school, newest first (school-detail panel). */
export async function listOutreachVisitRequestsForSchool(
  schoolId: string,
): Promise<OutreachVisitRequestRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('outreach_visit_requests')
    .select('*')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`listOutreachVisitRequestsForSchool failed: ${error.message}`)
  return (data as OutreachVisitRequestRow[]) ?? []
}
