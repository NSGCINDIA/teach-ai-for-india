import { createClient } from '@/lib/supabase/server'
import type {
  SchoolRow,
  SchoolContactRow,
  SchoolStatusHistoryRow,
  SchoolStatus,
  CampusRow,
  SessionPlanRow,
} from '@/types/database'

export type SchoolListItem = SchoolRow & {
  campus: Pick<CampusRow, 'id' | 'name'> | null
}

export type SchoolDetail = SchoolRow & {
  campus: Pick<CampusRow, 'id' | 'name' | 'quarter'> | null
  contacts: SchoolContactRow[]
  history: SchoolStatusHistoryRow[]
  /** The outreach→execution planning record, if one has been started. */
  plan: SessionPlanRow | null
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

  const { data, error } = await query
  if (error || !data) return []
  return data as unknown as SchoolListItem[]
}

export async function getSchool(id: string): Promise<SchoolDetail | null> {
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
  // The planning record is a to-one relation; fetch it separately so the type
  // stays a single object (RLS scopes visibility to the campus).
  const { data: plan } = await supabase
    .from('session_plans')
    .select('*')
    .eq('school_id', id)
    .maybeSingle()
  detail.plan = (plan as SessionPlanRow | null) ?? null
  return detail
}

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
