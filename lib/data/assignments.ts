import { createClient } from '@/lib/supabase/server'
import type { SessionAssignmentRow, SessionStatus } from '@/types/database'

export type AssignmentWithVolunteer = SessionAssignmentRow & {
  volunteer: { id: string; full_name: string; role: string } | null
}

/** Session card embedded on a volunteer/leader assignment row. */
type AssignmentSession = {
  id: string; date: string; topic: string; status: SessionStatus
  start_time: string | null; end_time: string | null
  school: { id: string; name: string; district: string } | null
  campus: { id: string; name: string } | null
}

export type AssignmentWithSession = SessionAssignmentRow & {
  session: AssignmentSession | null
}

export type MyAssignment = AssignmentWithSession

/** Campus board row — carries both the volunteer and the session context. */
export type AssignmentBoardRow = AssignmentWithSession & {
  volunteer: { id: string; full_name: string; role: string } | null
}

/** Assignments for one session, with the volunteer's name (RLS scopes rows). */
export async function getSessionAssignments(sessionId: string): Promise<AssignmentWithVolunteer[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('session_assignments')
    .select('*, volunteer:users!session_assignments_volunteer_id_fkey(id, full_name, role)')
    .eq('session_id', sessionId)
    .order('assigned_at', { ascending: true })
  if (error) throw new Error(`getSessionAssignments failed: ${error.message}`)
  return (data as unknown as AssignmentWithVolunteer[] | null) ?? []
}

/** A volunteer's own assignments, upcoming first (RLS: self, or a lead/admin of their campus). */
export async function listMyAssignments(userId: string): Promise<MyAssignment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('session_assignments')
    .select(
      `*, session:sessions(id, date, topic, status, start_time, end_time,
         school:schools(id, name, district), campus:campuses(id, name))`,
    )
    .eq('volunteer_id', userId)
    .order('assigned_at', { ascending: false })
    .limit(200)
  if (error) throw new Error(`listMyAssignments failed: ${error.message}`)
  return (data as unknown as MyAssignment[] | null) ?? []
}

/** All assignments across a campus — the Volunteer Lead's coordination board. */
export async function listCampusAssignments(campusId: string | null): Promise<AssignmentBoardRow[]> {
  const supabase = await createClient()
  let query = supabase
    .from('session_assignments')
    .select(
      `*, volunteer:users!session_assignments_volunteer_id_fkey(id, full_name, role),
       session:sessions(id, date, topic, status, start_time, end_time,
         school:schools(id, name, district), campus:campuses(id, name))`,
    )
    .order('assigned_at', { ascending: false })
    .limit(500)
  if (campusId) query = query.eq('campus_id', campusId)
  const { data, error } = await query
  if (error) throw new Error(`listCampusAssignments failed: ${error.message}`)
  return (data as unknown as AssignmentBoardRow[] | null) ?? []
}
