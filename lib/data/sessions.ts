import { createClient } from '@/lib/supabase/server'
import type {
  SessionRow,
  AttendanceRow,
  SessionStatus,
  CampusRow,
  UserRole,
} from '@/types/database'

export type SessionListItem = SessionRow & {
  school: { id: string; name: string; district: string } | null
  campus: Pick<CampusRow, 'id' | 'name'> | null
}

export type AttendanceWithUser = AttendanceRow & {
  user: { id: string; full_name: string; role: UserRole } | null
}

export type SessionDetail = Omit<SessionListItem, 'campus'> & {
  campus: Pick<CampusRow, 'id' | 'name' | 'quarter'> | null
  attendance: AttendanceWithUser[]
}

export type TeamMember = { id: string; full_name: string; role: UserRole }

export interface SessionFilters {
  status?: SessionStatus
  campus_id?: string
  school_id?: string
}

export async function listSessions(filters: SessionFilters = {}): Promise<SessionListItem[]> {
  const supabase = await createClient()
  let query = supabase
    .from('sessions')
    .select('*, school:schools(id, name, district), campus:campuses(id, name)')
    .order('date', { ascending: false })
    .limit(500)

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.campus_id) query = query.eq('campus_id', filters.campus_id)
  if (filters.school_id) query = query.eq('school_id', filters.school_id)

  const { data, error } = await query
  if (error || !data) return []
  return data as unknown as SessionListItem[]
}

export async function getSession(id: string): Promise<SessionDetail | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(
      `*, school:schools(id, name, district), campus:campuses(id, name, quarter),
       attendance:attendance_records(*, user:users!attendance_records_user_id_fkey(id, full_name, role))`,
    )
    .eq('id', id)
    .single()
  if (error || !data) return null

  const detail = data as unknown as SessionDetail
  detail.attendance = (detail.attendance ?? []).sort((a, b) =>
    (a.user?.full_name ?? '').localeCompare(b.user?.full_name ?? ''),
  )
  return detail
}

/** Schools for the create-session picker (optionally scoped to a campus). */
export async function listSchoolOptions(
  campusId?: string | null,
): Promise<{ id: string; name: string; district: string }[]> {
  const supabase = await createClient()
  let query = supabase.from('schools').select('id, name, district').order('name').limit(1000)
  if (campusId) query = query.eq('campus_id', campusId)
  const { data, error } = await query
  if (error) throw new Error(`listSchoolOptions failed: ${error.message}`)
  return (data as { id: string; name: string; district: string }[]) ?? []
}

/** Campus team members eligible for a session roster (active). */
export async function listTeamMembers(campusId: string | null): Promise<TeamMember[]> {
  const supabase = await createClient()
  let query = supabase
    .from('users')
    .select('id, full_name, role')
    .eq('is_active', true)
    .order('full_name')
    .limit(500)
  if (campusId) query = query.eq('campus_id', campusId)
  const { data, error } = await query
  if (error) throw new Error(`listTeamMembers failed: ${error.message}`)
  return (data as TeamMember[]) ?? []
}
