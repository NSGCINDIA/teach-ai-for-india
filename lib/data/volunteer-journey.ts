import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export interface VolunteerJourneyData {
  hasActiveTeam: boolean
  school?: {
    id: string
    name: string
    district: string
    status: string
    operational_phase: string | null
    required_volunteers: number
    team_status: string // 'confirmed' | 'available' | 'requested'
  } | null
  nextSession?: {
    id: string
    session_number: number
    topic: string
    scheduled_at: string
    school_name: string
    district: string
    meeting_point: string
    departure_time: string
    team_size: number
  } | null
  progress: {
    completedSessions: number
    totalSessions: number
    attendanceRate: number
    evidenceContributions: number
    schoolCompletionPercentage: number
    certificate: {
      status: 'unlocked' | 'locked'
      certificateNumber?: string
      issuedAt?: string
      title?: string
      missingSessions?: number
    }
  }
  history: {
    session_number: number
    topic: string
    scheduled_at: string | null
    status: 'present' | 'absent' | 'excused' | 'expected' | 'upcoming' | 'locked'
    verified: boolean
  }[]
}

export const getVolunteerJourney = cache(async (volunteerId: string): Promise<VolunteerJourneyData> => {
  const supabase = await createClient()

  // 1. Fetch current active team membership
  const { data: teamMemberships } = await supabase
    .from('school_team_members')
    .select(`
      id, status, assigned_at,
      school:schools(id, name, district, status, operational_phase, required_volunteers)
    `)
    .eq('volunteer_id', volunteerId)
    .eq('is_active', true)
    .order('assigned_at', { ascending: false })

  const activeMembership = teamMemberships && teamMemberships.length > 0 ? teamMemberships[0] : null
  const activeSchool = activeMembership ? (Array.isArray(activeMembership.school) ? activeMembership.school[0] : activeMembership.school) : null

  // 2. Fetch certificate status
  const { data: certificate } = await supabase
    .from('certificates')
    .select('id, serial, issued_at, title')
    .eq('volunteer_id', volunteerId)
    .order('issued_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!activeSchool || !activeMembership) {
    return {
      hasActiveTeam: false,
      school: null,
      nextSession: null,
      progress: {
        completedSessions: 0,
        totalSessions: 4,
        attendanceRate: 100,
        evidenceContributions: 0,
        schoolCompletionPercentage: 0,
        certificate: certificate ? {
          status: 'unlocked',
          certificateNumber: (certificate as any).serial ?? (certificate as any).certificate_number ?? 'CERT-101',
          issuedAt: certificate.issued_at,
          title: certificate.title,
        } : {
          status: 'locked',
          missingSessions: 4,
        },
      },
      history: [],
    }
  }

  // 3. Fetch school sessions 1-4
  const { data: schoolSessions } = await supabase
    .from('sessions')
    .select('id, session_number, topic, date, status')
    .eq('school_id', activeSchool.id)
    .order('session_number', { ascending: true })

  // 4. Fetch volunteer's participation records
  const { data: participantRecords } = await supabase
    .from('session_participants')
    .select('session_id, participated, notes')
    .eq('volunteer_id', volunteerId)

  const participantMap = new Map<string, boolean>()
  if (participantRecords) {
    for (const p of participantRecords as any[]) {
      participantMap.set(p.session_id, p.participated)
    }
  }

  // 5. Fetch evidence contributions count
  const { data: evidenceAssets } = await supabase
    .from('media_assets')
    .select('id')
    .eq('uploaded_by', volunteerId)

  // Determine next session
  const upcomingSession = schoolSessions?.find((s) => s.status === 'planned' || s.status === 'in_progress')
  const verifiedSessionsCount = schoolSessions?.filter((s) => s.status === 'verified').length ?? 0
  const attendedCount = participantRecords?.filter((p: any) => p.participated === true).length ?? 0

  const history = [1, 2, 3, 4].map((num) => {
    const s = schoolSessions?.find((sess) => sess.session_number === num)
    if (!s) {
      return {
        session_number: num,
        topic: `Session ${num}`,
        scheduled_at: null,
        status: 'locked' as const,
        verified: false,
      }
    }
    const didParticipate = participantMap.get(s.id)
    let status: 'present' | 'absent' | 'excused' | 'expected' | 'upcoming' | 'locked' = 'upcoming'

    if (s.status === 'verified' || s.status === 'campus_approved' || s.status === 'reported') {
      if (didParticipate === true || didParticipate === undefined) status = 'present'
      else status = 'absent'
    } else if (s.status === 'planned' || s.status === 'in_progress') {
      status = 'upcoming'
    } else {
      status = 'locked'
    }

    return {
      session_number: num,
      topic: s.topic || `Session ${num}`,
      scheduled_at: s.date,
      status,
      verified: s.status === 'verified',
    }
  })

  return {
    hasActiveTeam: true,
    school: {
      id: activeSchool.id,
      name: activeSchool.name,
      district: activeSchool.district,
      status: activeSchool.status,
      operational_phase: activeSchool.operational_phase,
      required_volunteers: activeSchool.required_volunteers ?? 2,
      team_status: activeMembership.status,
    },
    nextSession: upcomingSession ? {
      id: upcomingSession.id,
      session_number: upcomingSession.session_number,
      topic: upcomingSession.topic || `Session ${upcomingSession.session_number}`,
      scheduled_at: upcomingSession.date || new Date().toISOString(),
      school_name: activeSchool.name,
      district: activeSchool.district,
      meeting_point: 'NIAT Campus Gate',
      departure_time: '08:30 AM',
      team_size: activeSchool.required_volunteers ?? 2,
    } : null,
    progress: {
      completedSessions: verifiedSessionsCount,
      totalSessions: 4,
      attendanceRate: verifiedSessionsCount > 0 ? Math.round((attendedCount / Math.max(verifiedSessionsCount, 1)) * 100) : 100,
      evidenceContributions: evidenceAssets?.length ?? 0,
      schoolCompletionPercentage: Math.round((verifiedSessionsCount / 4) * 100),
      certificate: certificate ? {
        status: 'unlocked',
        certificateNumber: (certificate as any).serial ?? (certificate as any).certificate_number ?? 'CERT-101',
        issuedAt: certificate.issued_at,
        title: certificate.title,
      } : {
        status: 'locked',
        missingSessions: Math.max(0, 4 - verifiedSessionsCount),
      },
    },
    history,
  }
})
