import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { CampusRow, UserRow, UserRole, SignupRequestRow, VolunteerApplicationRow } from '@/types/database'
import type { StatusTone } from '@/lib/constants/status'

// ─── Alert feed (PRD §7.9 — 6 always-on alert types) ─────────────────────────
export interface AdminAlert {
  key: string
  label: string
  count: number
  href: string
  tone: StatusTone
}

/** The six operational alerts surfaced on the admin overview (PRD §7.9). */
export async function getAdminAlerts(): Promise<AdminAlert[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const head = { count: 'exact' as const, head: true }
  const [claims, verify, anomalyRows, followups, applications, messages, signups] = await Promise.all([
    supabase.from('reimbursements').select('id', head).in('status', ['submitted', 'under_review']),
    supabase.from('sessions').select('id', head).in('status', ['reported', 'campus_approved']),
    // Array-length filters are fragile over PostgREST — count non-empty flags in JS.
    supabase.from('reimbursements').select('anomaly_flags').eq('status', 'under_review'),
    supabase.from('schools').select('id', head).lt('next_action_date', today)
      .not('status', 'in', '(completed,archived)'),
    supabase.from('volunteer_applications').select('id', head).eq('status', 'new'),
    supabase.from('contact_messages').select('id', head).eq('is_handled', false),
    supabase.from('signup_requests').select('id', head).eq('status', 'pending'),
  ])
  const failed = [claims, verify, anomalyRows, followups, applications, messages, signups].find((r) => r.error)
  if (failed?.error) {
    console.error('getAdminAlerts failed:', failed.error.message)
    // Return empty alerts instead of throwing so the admin overview still loads.
    return []
  }

  const anomalyCount = ((anomalyRows.data as { anomaly_flags: string[] | null }[] | null) ?? [])
    .filter((r) => (r.anomaly_flags?.length ?? 0) > 0).length

  return [
    { key: 'claims', label: 'Reimbursement claims awaiting review', count: claims.count ?? 0, href: '/admin/finance', tone: 'pending' },
    { key: 'verify', label: 'Sessions awaiting verification', count: verify.count ?? 0, href: '/admin/sessions', tone: 'info' },
    { key: 'anomalies', label: 'Claims flagged for anomalies', count: anomalyCount, href: '/admin/finance', tone: 'danger' },
    { key: 'followups', label: 'Schools with overdue follow-up', count: followups.count ?? 0, href: '/admin/schools', tone: 'pending' },
    { key: 'signups', label: 'Account signups awaiting approval', count: signups.count ?? 0, href: '/admin/volunteers', tone: 'pending' },
    { key: 'applications', label: 'New volunteer applications', count: applications.count ?? 0, href: '/admin/volunteers', tone: 'progress' },
    { key: 'messages', label: 'Unhandled contact messages', count: messages.count ?? 0, href: '/admin/settings', tone: 'neutral' },
  ]
}

// ─── User / volunteer management (PRD §7.9) ──────────────────────────────────
export type AdminUser = UserRow & {
  campus: { id: string; name: string } | null
  assignments?: {
    id: string
    status: string
    session: {
      id: string
      date: string
      topic: string
      status: string
      school: {
        id: string
        name: string
      } | null
    } | null
  }[]
}

export interface UserFilters {
  role?: UserRole
  campus_id?: string
  active?: boolean
}

export async function listAdminUsers(filters: UserFilters = {}): Promise<AdminUser[]> {
  const supabase = await createClient()

  // First fetch users + campus (lightweight). The session_assignments join is
  // attempted separately so a missing table or RLS policy never kills the page.
  let query = supabase
    .from('users')
    // Disambiguate the FK: campuses links back to users twice (campus_id and
    // lead_user_id), so an unqualified embed errors (PGRST201) and drops rows.
    .select(`
      *,
      campus:campuses!users_campus_id_fkey(id, name),
      assignments:session_assignments!session_assignments_volunteer_id_fkey(
        id,
        status,
        session:sessions(
          id,
          date,
          topic,
          status,
          school:schools(id, name)
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(1000)
  if (filters.role) query = query.eq('role', filters.role)
  if (filters.campus_id) query = query.eq('campus_id', filters.campus_id)
  if (filters.active !== undefined) query = query.eq('is_active', filters.active)
  const { data, error } = await query

  if (error) {
    // The assignments join may not exist yet in some DB environments — fall
    // back to users + campus only so the page still renders.
    console.error('listAdminUsers (with assignments) failed, retrying without assignments join:', error.message)
    const supabase2 = await createClient()
    let fallback = supabase2
      .from('users')
      .select('*, campus:campuses!users_campus_id_fkey(id, name)')
      .order('created_at', { ascending: false })
      .limit(1000)
    if (filters.role) fallback = fallback.eq('role', filters.role)
    if (filters.campus_id) fallback = fallback.eq('campus_id', filters.campus_id)
    if (filters.active !== undefined) fallback = fallback.eq('is_active', filters.active)
    const { data: data2, error: error2 } = await fallback
    if (error2) throw new Error(`listAdminUsers failed: ${error2.message}`)
    return (data2 as unknown as AdminUser[]) ?? []
  }

  return (data as unknown as AdminUser[]) ?? []
}

// Wrapped in React cache() so a page and its generateMetadata (which both
// call this for the same id) share one round trip instead of two.
export const getAdminUser = cache(async (id: string): Promise<AdminUser | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*, campus:campuses!users_campus_id_fkey(id, name)')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(`getAdminUser failed: ${error.message}`)
  return (data as unknown as AdminUser) ?? null
})

// ─── Self-signup requests (PRD §7.2) ─────────────────────────────────────────
export type PendingSignup = SignupRequestRow & { campus: { id: string; name: string } | null }

export async function listPendingSignups(): Promise<PendingSignup[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('signup_requests')
      .select('*, campus:campuses(id, name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    if (error) {
      console.error('listPendingSignups failed:', error.message)
      return []
    }
    return (data as unknown as PendingSignup[]) ?? []
  } catch (err) {
    console.error('listPendingSignups unexpected error:', err)
    return []
  }
}

// ─── Volunteer applications (PRD §7.1/§11 — public "Join" form triage) ───────
export async function listVolunteerApplications(): Promise<VolunteerApplicationRow[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('volunteer_applications')
      .select('*')
      .in('status', ['new', 'reviewing'])
      .order('created_at', { ascending: true })
    if (error) {
      console.error('listVolunteerApplications failed:', error.message)
      return []
    }
    return (data as VolunteerApplicationRow[]) ?? []
  } catch (err) {
    console.error('listVolunteerApplications unexpected error:', err)
    return []
  }
}

// ─── Campus management (PRD §7.9 — campus config) ────────────────────────────
export type AdminCampus = CampusRow & { lead: { id: string; full_name: string } | null }

export async function listCampusesFull(): Promise<AdminCampus[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('campuses')
      .select('*, lead:users!campuses_lead_user_id_fkey(id, full_name)')
      .order('name')
    if (error) {
      // FK hint may be wrong for some DB versions — fall back to unqualified embed.
      console.error('listCampusesFull (qualified) failed, retrying without FK hint:', error.message)
      const supabase2 = await createClient()
      const { data: data2, error: error2 } = await supabase2
        .from('campuses')
        .select('*, lead:users!campuses_lead_user_id_fkey(id, full_name)')
        .order('name')
      if (error2) {
        console.error('listCampusesFull fallback failed:', error2.message)
        return []
      }
      return (data2 as unknown as AdminCampus[]) ?? []
    }
    return (data as unknown as AdminCampus[]) ?? []
  } catch (err) {
    console.error('listCampusesFull unexpected error:', err)
    return []
  }
}

export async function getCampusById(id: string): Promise<AdminCampus | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('campuses')
      .select('*, lead:users!campuses_lead_user_id_fkey(id, full_name)')
      .eq('id', id)
      .single()
    if (error) {
      console.error('getCampusById failed:', error.message)
      return null
    }
    return (data as unknown as AdminCampus) ?? null
  } catch (err) {
    console.error('getCampusById unexpected error:', err)
    return null
  }
}

// ─── CMS content blocks (PRD §7.10) ──────────────────────────────────────────
export type ContentBlock = { block_key: string; content: Record<string, unknown>; updated_at: string }

export async function listContentBlocks(): Promise<ContentBlock[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('content_blocks')
    .select('block_key, content, updated_at')
    .order('block_key')
  return (data as ContentBlock[]) ?? []
}

// ─── Finance config / thresholds (PRD §7.6/§7.9) ─────────────────────────────
export async function getFinanceConfig(): Promise<{ claim_window_days: number }> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('content_blocks')
    .select('content')
    .eq('block_key', 'finance_config')
    .single()
  const days = Number((data?.content as Record<string, unknown> | undefined)?.claim_window_days)
  return { claim_window_days: Number.isFinite(days) && days > 0 ? days : 14 }
}

// ─── Contact messages (surfaced from the "unhandled messages" alert) ─────────
export type ContactMessageItem = {
  id: string; name: string; email: string; subject: string | null
  message: string; is_handled: boolean; created_at: string
}

export async function listContactMessages(): Promise<ContactMessageItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)
  return (data as ContactMessageItem[]) ?? []
}
