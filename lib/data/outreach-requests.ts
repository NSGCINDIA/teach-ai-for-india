import { createClient } from '@/lib/supabase/server'
import type { OutreachRequestRow } from '@/types/database'

/** All outreach requests filed for a school, newest first (school-detail panel). */
export async function listOutreachRequestsForSchool(schoolId: string): Promise<OutreachRequestRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('outreach_requests')
    .select('*')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`listOutreachRequestsForSchool failed: ${error.message}`)
  return (data as OutreachRequestRow[]) ?? []
}
