import { createClient } from '@/lib/supabase/server'
import type { MediaAssetRow, MediaFileType, ApprovalStatus } from '@/types/database'

export type EvidenceListItem = MediaAssetRow & {
  campus: { id: string; name: string } | null
  school: { id: string; name: string } | null
  session: { id: string; topic: string; session_number: number } | null
  /** Signed URL for previewing/downloading (evidence bucket is private). */
  signed_url: string | null
}

export interface EvidenceFilters {
  campus_id?: string
  school_id?: string
  session_id?: string
  file_type?: MediaFileType
  approval_status?: ApprovalStatus
  q?: string
  from?: string
  to?: string
}

const EVIDENCE_SELECT =
  `*, campus:campuses(id, name), school:schools(id, name), session:sessions(id, topic, session_number)`

/** Batch-sign storage paths so private evidence can be previewed/downloaded. */
async function signPaths(paths: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  if (paths.length === 0) return map
  const supabase = await createClient()
  const { data } = await supabase.storage.from('evidence').createSignedUrls(paths, 3600)
  for (const item of data ?? []) {
    if (item.signedUrl && item.path) map.set(item.path, item.signedUrl)
  }
  return map
}

export async function listEvidence(filters: EvidenceFilters = {}): Promise<EvidenceListItem[]> {
  const supabase = await createClient()
  let query = supabase
    .from('media_assets')
    .select(EVIDENCE_SELECT)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(500)

  if (filters.campus_id) query = query.eq('campus_id', filters.campus_id)
  if (filters.school_id) query = query.eq('school_id', filters.school_id)
  if (filters.session_id) query = query.eq('session_id', filters.session_id)
  if (filters.file_type) query = query.eq('file_type', filters.file_type)
  if (filters.approval_status) query = query.eq('approval_status', filters.approval_status)
  if (filters.from) query = query.gte('created_at', filters.from)
  if (filters.to) query = query.lte('created_at', filters.to)
  if (filters.q) query = query.ilike('file_name', `%${filters.q.replace(/[%_]/g, '')}%`)

  const { data, error } = await query
  if (error || !data) return []
  const rows = data as unknown as EvidenceListItem[]
  const signed = await signPaths(rows.map((r) => r.storage_path))
  for (const r of rows) r.signed_url = signed.get(r.storage_path) ?? null
  return rows
}

/** Evidence attached to a single session (for the session detail page). */
export async function listSessionEvidence(sessionId: string): Promise<EvidenceListItem[]> {
  return listEvidence({ session_id: sessionId })
}

export async function listEvidenceFilterOptions(): Promise<{
  campuses: { id: string; name: string }[]
  schools: { id: string; name: string }[]
  sessions: { id: string; label: string }[]
}> {
  const supabase = await createClient()
  const [campuses, schools, sessions] = await Promise.all([
    supabase.from('campuses').select('id, name').order('name'),
    supabase.from('schools').select('id, name').order('name').limit(1000),
    supabase.from('sessions').select('id, topic, session_number, date').order('date', { ascending: false }).limit(500),
  ])
  return {
    campuses: (campuses.data as { id: string; name: string }[]) ?? [],
    schools: (schools.data as { id: string; name: string }[]) ?? [],
    sessions:
      (sessions.data as { id: string; topic: string; session_number: number }[] | null)?.map((s) => ({
        id: s.id,
        label: `#${s.session_number} · ${s.topic}`,
      })) ?? [],
  }
}
