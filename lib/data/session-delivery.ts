import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { SessionRow, SessionParticipantRow, UserRow, MediaAssetRow } from '@/types/database'

export type SessionWithDetails = SessionRow & {
  participants: (SessionParticipantRow & { volunteer: Pick<UserRow, 'id' | 'full_name' | 'email'> })[]
  media: MediaAssetRow[]
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

  const [{ data: session }, { data: participants }, { data: media }] = await Promise.all([
    supabase.from('sessions').select('*').eq('id', sessionId).single(),
    supabase.from('session_participants').select('*, volunteer:users(id, full_name, email)').eq('session_id', sessionId),
    supabase.from('media_assets').select('*').eq('session_id', sessionId).is('deleted_at', null),
  ])

  if (!session) return null

  return {
    ...(session as SessionRow),
    participants: (participants ?? []) as unknown as (SessionParticipantRow & { volunteer: Pick<UserRow, 'id' | 'full_name' | 'email'> })[],
    media: (media ?? []) as MediaAssetRow[],
  }
})
