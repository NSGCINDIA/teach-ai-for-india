import { createClient } from '@/lib/supabase/server'
import type { SchoolVisitRow } from '@/types/database'

/** All logged visits for a school, newest first (school-detail panel). */
export async function listSchoolVisitsForSchool(schoolId: string): Promise<SchoolVisitRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('school_visits')
    .select('*')
    .eq('school_id', schoolId)
    .order('visited_at', { ascending: false })
  if (error) throw new Error(`listSchoolVisitsForSchool failed: ${error.message}`)
  return (data as SchoolVisitRow[]) ?? []
}
