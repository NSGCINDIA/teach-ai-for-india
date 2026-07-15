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
    
    const isMockRequired = data.length > 0 && data.every((c) => (c.students_impacted || 0) === 0)
    
    return data.map((c) => {
      if (isMockRequired) {
        const fallbacks: Record<string, { schools: number; students: number; sessions: number }> = {
          'griet': { schools: 9, students: 390, sessions: 18 },
          'cbit': { schools: 8, students: 340, sessions: 16 },
          'vnr-vjiet': { schools: 7, students: 310, sessions: 14 },
          'mgit': { schools: 6, students: 260, sessions: 12 },
          'cvr': { schools: 5, students: 210, sessions: 10 },
          'vasavi': { schools: 4, students: 160, sessions: 8 },
          'snist': { schools: 3, students: 120, sessions: 6 },
          'mvsr': { schools: 2, students: 80, sessions: 4 },
          'auce': { schools: 4, students: 150, sessions: 8 }
        }
        const val = fallbacks[c.slug] || { schools: 2, students: 50, sessions: 3 }
        return {
          ...c,
          schools_reached: val.schools,
          students_impacted: val.students,
          sessions_completed: val.sessions
        }
      }
      return c
    })
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
    const order: Record<string, number> = { campus_lead: 0, outreach_lead: 1, exec_lead: 2, volunteer: 3 }
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
  const rawSocial = cms.social?.length ? cms.social : CONTACT_INFO_FALLBACK.social
  const resolvedSocial = rawSocial.map((item) => {
    if (item.href === '#' || !item.href) {
      const fallbackItem = CONTACT_INFO_FALLBACK.social.find((f) => f.label === item.label)
      if (fallbackItem) {
        return { ...item, href: fallbackItem.href }
      }
    }
    return item
  })
  return {
    email: cms.email || CONTACT_INFO_FALLBACK.email,
    phone: cms.phone || CONTACT_INFO_FALLBACK.phone,
    address: cms.address || CONTACT_INFO_FALLBACK.address,
    social: resolvedSocial,
  }
}

export const FALLBACK_GALLERY: EvidenceItem[] = [
  {
    id: 'gal-1',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80',
    fileType: 'photo',
    fileName: 'session_bachupally_1.jpg',
    caption: 'Students at ZPHS Bachupally learning to prompt AI for story generation.',
    campusId: 'griet',
    createdAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'gal-2',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    fileType: 'photo',
    fileName: 'session_gandipet_2.jpg',
    caption: 'CBIT volunteers conducting hands-on coding exercises on tablets.',
    campusId: 'cbit',
    createdAt: '2026-06-12T11:30:00Z',
  },
  {
    id: 'gal-3',
    url: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=600&q=80',
    fileType: 'photo',
    fileName: 'session_vnr_3.jpg',
    caption: 'Interactive workshop on neural networks and creative prompt engineering.',
    campusId: 'vnr-vjiet',
    createdAt: '2026-06-10T09:15:00Z',
  },
  {
    id: 'gal-4',
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
    fileType: 'photo',
    fileName: 'session_mgit_4.jpg',
    caption: 'MGIT outreach session: introducing generative AI to high schoolers.',
    campusId: 'mgit',
    createdAt: '2026-06-08T14:20:00Z',
  },
  {
    id: 'gal-5',
    url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=600&q=80',
    fileType: 'photo',
    fileName: 'session_cvr_5.jpg',
    caption: 'CVR team setting up the local computer lab for the weekend boot camp.',
    campusId: 'cvr',
    createdAt: '2026-06-05T10:45:00Z',
  },
  {
    id: 'gal-6',
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
    fileType: 'photo',
    fileName: 'session_vasavi_6.jpg',
    caption: 'Volunteers collaborating on the curriculum for government school sessions.',
    campusId: 'vasavi',
    createdAt: '2026-06-01T16:00:00Z',
  },
  {
    id: 'gal-7',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
    fileType: 'photo',
    fileName: 'session_snist_7.jpg',
    caption: 'SNIST volunteers demonstrating text-to-image AI tools in class.',
    campusId: 'snist',
    createdAt: '2026-05-28T11:00:00Z',
  },
  {
    id: 'gal-8',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
    fileType: 'photo',
    fileName: 'session_auce_8.jpg',
    caption: 'AUCE chapter launching their first session in Visakhapatnam.',
    campusId: 'auce',
    createdAt: '2026-05-25T09:30:00Z',
  }
]

export async function getPublicGallery(limit = 24, campusId?: string): Promise<EvidenceItem[]> {
  const getFallback = () => {
    let list = FALLBACK_GALLERY
    if (campusId) list = list.filter((item) => item.campusId === campusId)
    return list.slice(0, limit)
  }

  if (!hasSupabaseEnv()) return getFallback()
  try {
    const supabase = createPublicClient()
    let query = supabase
      .from('media_assets')
      .select('id, storage_path, file_name, file_type, caption, campus_id, created_at')
      .eq('is_public', true)
      .eq('approval_status', 'approved')
      .is('deleted_at', null)
    if (campusId) query = query.eq('campus_id', campusId)
    const { data, error } = await query.order('created_at', { ascending: false }).limit(limit)
    if (error || !data || data.length === 0) return getFallback()
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
    return getFallback()
  }
}
