import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { SchoolTeamMemberRow, UserRow } from '@/types/database'

export type SchoolTeamMemberDetail = SchoolTeamMemberRow & {
  volunteer: Pick<UserRow, 'id' | 'full_name' | 'email' | 'phone' | 'avatar_url'>
  assigned_by_user?: Pick<UserRow, 'full_name'> | null
}

export const getSchoolTeam = cache(async (schoolId: string): Promise<SchoolTeamMemberDetail[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('school_team_members')
    .select(`
      *,
      volunteer:users!school_team_members_volunteer_id_fkey(id, full_name, email, phone, avatar_url),
      assigned_by_user:users!school_team_members_assigned_by_fkey(full_name)
    `)
    .eq('school_id', schoolId)
    .order('created_at', { ascending: true })

  if (error || !data) return []
  return data as unknown as SchoolTeamMemberDetail[]
})

export const getVolunteerTeamAssignments = cache(async (volunteerId: string): Promise<{
  id: string
  school_id: string
  school_name: string
  district: string
  status: string
  assigned_at: string
}[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('school_team_members')
    .select(`
      id, school_id, status, assigned_at,
      school:schools(name, district)
    `)
    .eq('volunteer_id', volunteerId)
    .eq('is_active', true)
    .order('assigned_at', { ascending: false })

  if (error || !data) return []

  return data.map((r) => {
    const s = Array.isArray(r.school) ? r.school[0] : r.school
    return {
      id: r.id,
      school_id: r.school_id,
      school_name: s?.name ?? '—',
      district: s?.district ?? '—',
      status: r.status,
      assigned_at: r.assigned_at,
    }
  })
})

export interface CandidateVolunteer {
  id: string
  full_name: string
  email: string
  phone: string | null
  campus_id: string | null
  active_teams_count: number
  conflict?: string | null
}

export const getCandidateVolunteers = cache(async (campusId?: string | null): Promise<CandidateVolunteer[]> => {
  const supabase = await createClient()
  let query = supabase
    .from('users')
    .select('id, full_name, email, phone, campus_id')
    .eq('role', 'volunteer')
    .eq('is_active', true)

  if (campusId) {
    query = query.eq('campus_id', campusId)
  }

  const { data: users } = await query
  if (!users || users.length === 0) return []

  const userIds = users.map((u) => u.id)

  // Fetch active school team assignments to check conflicts
  const { data: activeAssignments } = await supabase
    .from('school_team_members')
    .select('volunteer_id, school_id, school:schools(name, status)')
    .in('volunteer_id', userIds)
    .eq('status', 'confirmed')

  const conflictMap = new Map<string, { count: number; schoolName?: string }>()
  if (activeAssignments) {
    for (const a of activeAssignments) {
      const s = Array.isArray(a.school) ? a.school[0] : a.school
      if (s && s.status === 'sessions_active') {
        const existing = conflictMap.get(a.volunteer_id) ?? { count: 0 }
        conflictMap.set(a.volunteer_id, {
          count: existing.count + 1,
          schoolName: s.name,
        })
      }
    }
  }

  return users.map((u) => {
    const c = conflictMap.get(u.id)
    return {
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      phone: u.phone,
      campus_id: u.campus_id,
      active_teams_count: c?.count ?? 0,
      conflict: c && c.count > 0 ? `Already on active team: ${c.schoolName}` : null,
    }
  })
})
