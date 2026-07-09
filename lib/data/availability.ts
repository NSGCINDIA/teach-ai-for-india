import { createClient } from '@/lib/supabase/server'
import type { AvailabilityRow } from '@/types/database'

export type CampusAvailability = AvailabilityRow & {
  volunteer: { id: string; full_name: string } | null
}

/** A volunteer's own availability marks, fromDate onward (RLS: self, or a lead/admin of their campus). */
export async function listMyAvailability(volunteerId: string, fromDate: string): Promise<AvailabilityRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('volunteer_availability')
    .select('*')
    .eq('volunteer_id', volunteerId)
    .gte('date', fromDate)
    .order('date', { ascending: true })
    .limit(200)
  if (error) throw new Error(`listMyAvailability failed: ${error.message}`)
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
