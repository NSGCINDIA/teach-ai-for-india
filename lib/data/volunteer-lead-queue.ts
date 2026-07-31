import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export interface SchoolTeamWorkItem {
  id: string
  name: string
  district: string
  status: string
  operational_phase: string | null
  required_volunteers: number
  confirmed_count: number
  available_count: number
  requested_count: number
  unavailable_count: number
  student_strength: number
}

export interface VolunteerLeadQueueData {
  schoolsNeedingTeamsCount: number
  incompleteTeamsCount: number
  pendingResponsesCount: number
  teamsReadyCount: number
  workItems: SchoolTeamWorkItem[]
}

export const getVolunteerLeadQueue = cache(async (campusId?: string | null): Promise<VolunteerLeadQueueData> => {
  const supabase = await createClient()

  let query = supabase
    .from('schools')
    .select(`
      id, name, district, status, operational_phase, required_volunteers,
      plan:session_plans(student_strength)
    `)
    .eq('status', 'sessions_active')

  if (campusId) {
    query = query.eq('campus_id', campusId)
  }

  const { data: schools } = await query
  if (!schools || schools.length === 0) {
    return {
      schoolsNeedingTeamsCount: 0,
      incompleteTeamsCount: 0,
      pendingResponsesCount: 0,
      teamsReadyCount: 0,
      workItems: [],
    }
  }

  const schoolIds = schools.map((s) => s.id)

  const { data: teamMembers } = await supabase
    .from('school_team_members')
    .select('school_id, status')
    .in('school_id', schoolIds)

  const teamStatsMap = new Map<string, { confirmed: number; available: number; requested: number; unavailable: number }>()
  let pendingResponsesCount = 0

  if (teamMembers) {
    for (const m of teamMembers) {
      const stats = teamStatsMap.get(m.school_id) ?? { confirmed: 0, available: 0, requested: 0, unavailable: 0 }
      if (m.status === 'confirmed') stats.confirmed += 1
      if (m.status === 'available') stats.available += 1
      if (m.status === 'requested') {
        stats.requested += 1
        pendingResponsesCount += 1
      }
      if (m.status === 'unavailable') stats.unavailable += 1
      teamStatsMap.set(m.school_id, stats)
    }
  }

  const workItems: SchoolTeamWorkItem[] = schools.map((s) => {
    const stats = teamStatsMap.get(s.id) ?? { confirmed: 0, available: 0, requested: 0, unavailable: 0 }
    const p = Array.isArray(s.plan) ? s.plan[0] : s.plan
    return {
      id: s.id,
      name: s.name,
      district: s.district,
      status: s.status,
      operational_phase: s.operational_phase,
      required_volunteers: s.required_volunteers ?? 2,
      confirmed_count: stats.confirmed,
      available_count: stats.available,
      requested_count: stats.requested,
      unavailable_count: stats.unavailable,
      student_strength: p?.student_strength ?? 0,
    }
  })

  const schoolsNeedingTeamsCount = workItems.filter((w) => w.operational_phase === 'team_preparation' || w.confirmed_count < w.required_volunteers).length
  const incompleteTeamsCount = workItems.filter((w) => w.confirmed_count < w.required_volunteers).length
  const teamsReadyCount = workItems.filter((w) => w.confirmed_count >= w.required_volunteers).length

  return {
    schoolsNeedingTeamsCount,
    incompleteTeamsCount,
    pendingResponsesCount,
    teamsReadyCount,
    workItems,
  }
})
