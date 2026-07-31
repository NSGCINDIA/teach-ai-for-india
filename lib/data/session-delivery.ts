import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { SessionRow, SessionParticipantRow, UserRow, MediaAssetRow } from '@/types/database'

export type SessionWithDetails = SessionRow & {
  participants: (SessionParticipantRow & { volunteer: Pick<UserRow, 'id' | 'full_name' | 'email'> })[]
  media: MediaAssetRow[]
  previousSession?: {
    id: string
    session_number: number
    topic: string
    notes: string | null
    challenges: string | null
    next_steps: string | null
    improvement_notes: string | null
  } | null
  schoolExecutionPlan?: any
}

export const getSchoolSessions = cache(async (schoolId: string): Promise<SessionRow[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('school_id', schoolId)
    .order('session_number', { ascending: true })

  if (error || !data) return []
  return data as SessionRow[]
})

export const getSessionWithDetails = cache(async (sessionId: string): Promise<SessionWithDetails | null> => {
  const supabase = await createClient()

  const { data: session } = await supabase.from('sessions').select('*').eq('id', sessionId).single()
  if (!session) return null

  const [
    { data: participants },
    { data: media },
    { data: prevSess },
    { data: execPlan },
  ] = await Promise.all([
    supabase.from('session_participants').select('*, volunteer:users(id, full_name, email)').eq('session_id', sessionId),
    supabase.from('media_assets').select('*').eq('session_id', sessionId).is('deleted_at', null),
    session.previous_session_id
      ? supabase.from('sessions').select('id, session_number, topic, notes, challenges, next_steps, improvement_notes').eq('id', session.previous_session_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('school_execution_plans').select('*').eq('school_id', session.school_id).eq('status', 'approved').maybeSingle(),
  ])

  return {
    ...(session as SessionRow),
    participants: (participants ?? []) as unknown as (SessionParticipantRow & { volunteer: Pick<UserRow, 'id' | 'full_name' | 'email'> })[],
    media: (media ?? []) as MediaAssetRow[],
    previousSession: prevSess,
    schoolExecutionPlan: execPlan,
  }
})
