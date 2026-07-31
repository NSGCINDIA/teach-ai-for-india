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
