import { createClient } from '@/lib/supabase/server'
import type { AvailabilityRow } from '@/types/database'

export type CampusAvailability = AvailabilityRow & {
  volunteer: { id: string; full_name: string } | null
}

/** The signed-in volunteer's own availability marks (today onward). */
export async function listMyAvailability(fromDate: string): Promise<AvailabilityRow[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('volunteer_availability')
    .select('*')
    .eq('volunteer_id', user.id)
    .gte('date', fromDate)
    .order('date', { ascending: true })
    .limit(200)
  return (data as AvailabilityRow[] | null) ?? []
}

/** Campus-wide availability for the Volunteer Lead board (today onward). */
export async function listCampusAvailability(
  campusId: string | null,
  fromDate: string,
): Promise<CampusAvailability[]> {
  const supabase = await createClient()
  let query = supabase
    .from('volunteer_availability')
    .select('*, volunteer:users!volunteer_availability_volunteer_id_fkey(id, full_name)')
    .gte('date', fromDate)
    .order('date', { ascending: true })
    .limit(1000)
  if (campusId) query = query.eq('campus_id', campusId)
  const { data } = await query
  return (data as unknown as CampusAvailability[] | null) ?? []
}
