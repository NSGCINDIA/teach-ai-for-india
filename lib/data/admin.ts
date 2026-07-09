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
  if (failed?.error) throw new Error(`getAdminAlerts failed: ${failed.error.message}`)

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
export type AdminUser = UserRow & { campus: { id: string; name: string } | null }

export interface UserFilters {
  role?: UserRole
  campus_id?: string
  active?: boolean
}

export async function listAdminUsers(filters: UserFilters = {}): Promise<AdminUser[]> {
  const supabase = await createClient()
  let query = supabase
    .from('users')
    // Disambiguate the FK: campuses links back to users twice (campus_id and
    // lead_user_id), so an unqualified embed errors (PGRST201) and drops rows.
    .select('*, campus:campuses!users_campus_id_fkey(id, name)')
    .order('created_at', { ascending: false })
    .limit(1000)
  if (filters.role) query = query.eq('role', filters.role)
  if (filters.campus_id) query = query.eq('campus_id', filters.campus_id)
  if (filters.active !== undefined) query = query.eq('is_active', filters.active)
  const { data, error } = await query
  if (error) throw new Error(`listAdminUsers failed: ${error.message}`)
  return (data as unknown as AdminUser[]) ?? []
}

// ─── Self-signup requests (PRD §7.2) ─────────────────────────────────────────
export type PendingSignup = SignupRequestRow & { campus: { id: string; name: string } | null }

export async function listPendingSignups(): Promise<PendingSignup[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('signup_requests')
    .select('*, campus:campuses(id, name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  if (error) throw new Error(`listPendingSignups failed: ${error.message}`)
  return (data as unknown as PendingSignup[]) ?? []
}

// ─── Volunteer applications (PRD §7.1/§11 — public "Join" form triage) ───────
export async function listVolunteerApplications(): Promise<VolunteerApplicationRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('volunteer_applications')
    .select('*')
    .in('status', ['new', 'reviewing'])
    .order('created_at', { ascending: true })
  if (error) throw new Error(`listVolunteerApplications failed: ${error.message}`)
  return (data as VolunteerApplicationRow[]) ?? []
}

// ─── Campus management (PRD §7.9 — campus config) ────────────────────────────
export type AdminCampus = CampusRow & { lead: { id: string; full_name: string } | null }

export async function listCampusesFull(): Promise<AdminCampus[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('campuses')
    .select('*, lead:users!campuses_lead_user_id_fkey(id, full_name)')
    .order('name')
  return (data as unknown as AdminCampus[]) ?? []
}

export async function getCampusById(id: string): Promise<AdminCampus | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('campuses')
    .select('*, lead:users!campuses_lead_user_id_fkey(id, full_name)')
    .eq('id', id)
    .single()
  return (data as unknown as AdminCampus) ?? null
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
