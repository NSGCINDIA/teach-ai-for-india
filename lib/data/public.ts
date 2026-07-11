import { createPublicClient } from '@/lib/supabase/public'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import type {
  PublicImpactStats, PublicCampusCard, MediaFileType,
  PublicCampusSession, PublicCampusTeamMember,
} from '@/types/database'
import type { EvidenceItem } from '@/components/shared/evidence-grid'
import { CONTACT_INFO_FALLBACK, type ContactInfo } from '@/app/(public)/content'

/**
 * Public-site data access with GRACEFUL DEGRADATION (PRD §7.1):
 * if Supabase is unreachable or unconfigured, return last-known-good values so
 * no number widget ever renders broken.
 */

export const FALLBACK_IMPACT: PublicImpactStats = {
  schools_reached: 18,
  students_impacted: 1842,
  sessions_completed: 19,
  active_campuses: 9,
  states_count: 2,
}

export async function getImpactStats(): Promise<PublicImpactStats> {
  if (!hasSupabaseEnv()) return FALLBACK_IMPACT
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase.from('public_impact_stats').select('*').single()
    if (error || !data) return FALLBACK_IMPACT
    // Never show zeros on a live site that has history — fall back per-field.
    return {
      schools_reached: data.schools_reached || FALLBACK_IMPACT.schools_reached,
      students_impacted: data.students_impacted || FALLBACK_IMPACT.students_impacted,
      sessions_completed: data.sessions_completed || FALLBACK_IMPACT.sessions_completed,
      active_campuses: data.active_campuses || FALLBACK_IMPACT.active_campuses,
      states_count: data.states_count || FALLBACK_IMPACT.states_count,
    }
  } catch {
    return FALLBACK_IMPACT
  }
}

export async function getCampusCards(): Promise<PublicCampusCard[]> {
  if (!hasSupabaseEnv()) return []
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('public_campus_cards')
      .select('*')
      .order('students_impacted', { ascending: false })
    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

export async function getCampusBySlug(slug: string): Promise<PublicCampusCard | null> {
  if (!hasSupabaseEnv()) return null
  try {
    const supabase = createPublicClient()
    const { data } = await supabase.from('public_campus_cards').select('*').eq('slug', slug).single()
    return data ?? null
  } catch {
    return null
  }
}

/** Recent verified sessions for a campus — the public timeline (PRD §7.1). */
export async function getCampusSessions(campusId: string, limit = 8): Promise<PublicCampusSession[]> {
  if (!hasSupabaseEnv()) return []
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('public_campus_sessions')
      .select('*')
      .eq('campus_id', campusId)
      .order('date', { ascending: false })
      .limit(limit)
    return (data as PublicCampusSession[] | null) ?? []
  } catch {
    return []
  }
}

/** Active team roster for a campus — leads first, then execs, then volunteers. */
export async function getCampusTeam(campusId: string): Promise<PublicCampusTeamMember[]> {
  if (!hasSupabaseEnv()) return []
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('public_campus_team')
      .select('*')
      .eq('campus_id', campusId)
      .limit(60)
    const rows = (data as PublicCampusTeamMember[] | null) ?? []
    const order: Record<string, number> = { campus_lead: 0, outreach_head: 1, exec_lead: 2, volunteer: 3 }
    return rows.sort(
      (a, b) => (order[a.role] ?? 9) - (order[b.role] ?? 9) || a.full_name.localeCompare(b.full_name),
    )
  } catch {
    return []
  }
}

export async function getContentBlock<T = Record<string, unknown>>(
  key: string,
  fallback: T,
): Promise<T> {
  if (!hasSupabaseEnv()) return fallback
  try {
    const supabase = createPublicClient()
    const { data } = await supabase.from('content_blocks').select('content').eq('block_key', key).single()
    return (data?.content as T) ?? fallback
  } catch {
    return fallback
  }
}

/**
 * Contact details for the footer + contact page. Coalesces every field against
 * the fallback so a partial or legacy CMS block (e.g. a null `phone`) can never
 * crash a render — the footer is on every page, so this must always be complete.
 */
export async function getContactInfo(): Promise<ContactInfo> {
  const cms = await getContentBlock<Partial<ContactInfo>>('contact_info', {})
  return {
    email: cms.email || CONTACT_INFO_FALLBACK.email,
    phone: cms.phone || CONTACT_INFO_FALLBACK.phone,
    address: cms.address || CONTACT_INFO_FALLBACK.address,
    social: cms.social?.length ? cms.social : CONTACT_INFO_FALLBACK.social,
  }
}

export async function getPublicGallery(limit = 24, campusId?: string): Promise<EvidenceItem[]> {
  if (!hasSupabaseEnv()) return []
  try {
    const supabase = createPublicClient()
    let query = supabase
      .from('media_assets')
      .select('id, storage_path, file_name, file_type, caption, campus_id, created_at')
      .eq('is_public', true)
      .eq('approval_status', 'approved')
      .is('deleted_at', null)
    if (campusId) query = query.eq('campus_id', campusId)
    const { data } = await query.order('created_at', { ascending: false }).limit(limit)
    if (!data) return []
    const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-assets/`
    return data.map((m) => ({
      id: m.id,
      url: `${base}${m.storage_path}`,
      fileType: m.file_type as MediaFileType,
      fileName: m.file_name,
      caption: m.caption,
      campusId: m.campus_id,
      createdAt: m.created_at,
    }))
  } catch {
    return []
  }
}
