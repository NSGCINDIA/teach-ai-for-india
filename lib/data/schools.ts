import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type {
  SchoolRow,
  SchoolContactRow,
  SchoolStatusHistoryRow,
  SchoolStatus,
  SessionStatus,
  CampusRow,
  SessionPlanRow,
} from '@/types/database'

export interface SchoolProgress {
  latest_session_number: number
  latest_session_status: SessionStatus
}

export type SchoolListItem = SchoolRow & {
  campus: Pick<CampusRow, 'id' | 'name'> | null
} & Partial<SchoolProgress>

export type SchoolDetail = SchoolRow & {
  campus: Pick<CampusRow, 'id' | 'name' | 'quarter'> | null
  contacts: SchoolContactRow[]
  history: SchoolStatusHistoryRow[]
  /** The current OPEN (draft) planning record, if one is in progress — null between sessions. */
  plan: SessionPlanRow | null
  /** Curriculum position — the highest-numbered non-cancelled session (spec §5). */
  progress: SchoolProgress | null
}

export type SimilarSchool = {
  id: string
  name: string
  district: string
  campus_id: string | null
  status: SchoolStatus
  distance: number
}

export interface SchoolFilters {
  q?: string
  status?: SchoolStatus
  campus_id?: string
  /** Restrict to a single outreach lead (used by the "My Schools" view). */
  outreach_lead_id?: string
}

/**
 * List schools the signed-in user may see (RLS scopes the rows). Filters are
 * applied server-side. Cross-campus SELECT is allowed by RLS (US-CRM-03), so
 * admin and team views share this query and differ only by filter.
 */
export async function listSchools(filters: SchoolFilters = {}): Promise<SchoolListItem[]> {
  const supabase = await createClient()
  let query = supabase
    .from('schools')
    .select('*, campus:campuses(id, name)')
    .order('updated_at', { ascending: false })
    .limit(500)

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.campus_id) query = query.eq('campus_id', filters.campus_id)
  if (filters.outreach_lead_id) query = query.eq('outreach_lead_id', filters.outreach_lead_id)
  if (filters.q) {
    const term = `%${filters.q.replace(/[%_]/g, '')}%`
    query = query.or(`name.ilike.${term},district.ilike.${term},dise_code.ilike.${term}`)
  }

  const [{ data, error }, progress] = await Promise.all([query, listSchoolProgress()])
  if (error || !data) return []
  const rows = data as unknown as SchoolListItem[]
  for (const r of rows) Object.assign(r, progress.get(r.id))
  return rows
}

/**
 * Bulk curriculum-progress lookup — ONE query, RLS-scoped (school_session_progress
 * is security_invoker), for however many schools the caller can see. Schools with
 * zero non-cancelled sessions simply have no entry (callers fall back to the
 * pipeline status badge). Never per-row — see 0030_mandatory_evidence.sql.
 */
export async function listSchoolProgress(): Promise<Map<string, SchoolProgress>> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('school_session_progress')
    .select('school_id, latest_session_number, latest_session_status')
    .limit(2000)
  const map = new Map<string, SchoolProgress>()
  for (const r of (data ?? []) as { school_id: string; latest_session_number: number; latest_session_status: SessionStatus }[]) {
    map.set(r.school_id, { latest_session_number: r.latest_session_number, latest_session_status: r.latest_session_status })
  }
  return map
}

// Wrapped in React cache() so a page and its generateMetadata (which both
// call this for the same id) share one round trip instead of two.
export const getSchool = cache(async (id: string): Promise<SchoolDetail | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('schools')
    .select(
      `*, campus:campuses(id, name, quarter),
       contacts:school_contacts(*),
       history:school_status_history(*)`,
    )
    .eq('id', id)
    .single()
  if (error || !data) return null

  const detail = data as unknown as SchoolDetail
  // Newest status change first for the timeline.
  detail.history = (detail.history ?? []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
  detail.contacts = (detail.contacts ?? []).sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary),
  )
  // The current open (draft) planning record, if any — a school accumulates
  // one approved session_plans row per session it's run, so this is fetched
  // separately (filtered to 'draft') to keep the type a single object.
  const { data: plan } = await supabase
    .from('session_plans')
    .select('*')
    .eq('school_id', id)
    .eq('status', 'draft')
    .maybeSingle()
  detail.plan = (plan as SessionPlanRow | null) ?? null

  const { data: progress } = await supabase
    .from('school_session_progress')
    .select('latest_session_number, latest_session_status')
    .eq('school_id', id)
    .maybeSingle()
  detail.progress = (progress as SchoolProgress | null) ?? null

  return detail
})

/**
 * Fuzzy duplicate search (PRD §7.3 — Levenshtein ≤ 3, same district). Backed by
 * the find_similar_schools RPC. Surfaced to the user as a blocking warning
 * before insert; returns [] on any error so dedup never blocks creation.
 */
export async function findSimilarSchools(
  name: string,
  district: string,
): Promise<SimilarSchool[]> {
  if (!name.trim() || !district.trim()) return []
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('find_similar_schools', {
    p_name: name,
    p_district: district,
    p_max_distance: 3,
  })
  if (error || !data) return []
  return data as unknown as SimilarSchool[]
}

/** Campuses for select inputs (id + name only). */
export async function listCampusOptions(): Promise<Pick<CampusRow, 'id' | 'name'>[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('campuses').select('id, name').order('name')
  return (data as Pick<CampusRow, 'id' | 'name'>[]) ?? []
}
