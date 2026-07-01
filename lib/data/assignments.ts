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
  const { data } = await supabase
    .from('session_assignments')
    .select('*, volunteer:users!session_assignments_volunteer_id_fkey(id, full_name, role)')
    .eq('session_id', sessionId)
    .order('assigned_at', { ascending: true })
  return (data as unknown as AssignmentWithVolunteer[] | null) ?? []
}

/** The signed-in volunteer's own assignments, upcoming first. */
export async function listMyAssignments(): Promise<MyAssignment[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('session_assignments')
    .select(
      `*, session:sessions(id, date, topic, status, start_time, end_time,
         school:schools(id, name, district), campus:campuses(id, name))`,
    )
    .eq('volunteer_id', user.id)
    .order('assigned_at', { ascending: false })
    .limit(200)
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
  const { data } = await query
  return (data as unknown as AssignmentBoardRow[] | null) ?? []
}
