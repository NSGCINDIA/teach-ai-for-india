import { createClient } from '@/lib/supabase/server'
import type { SchoolVisitRow } from '@/types/database'

export type SchoolVisitListItem = SchoolVisitRow & {
  visited_by_user: { full_name: string } | null
  creator: { full_name: string } | null
}

/** All logged visits for a school, newest first (school-detail panel). */
export async function listSchoolVisitsForSchool(schoolId: string): Promise<SchoolVisitListItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('school_visits')
    .select('*, visited_by_user:users!school_visits_visited_by_fkey(full_name), creator:users!school_visits_created_by_fkey(full_name)')
    .eq('school_id', schoolId)
    .order('visited_at', { ascending: false })
  if (error) throw new Error(`listSchoolVisitsForSchool failed: ${error.message}`)
  return (data as unknown as SchoolVisitListItem[]) ?? []
}
