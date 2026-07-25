import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'

export interface UpdateItem {
  id: string
  title: string
  description: string
  date: string
  badgeText?: string
  href?: string
}

export async function getSessionUpdates(): Promise<UpdateItem[]> {
  const user = await getSessionUser()
  if (!user) return []

  const supabase = await createClient()
  const isAll = can(user.role, 'view_all_campuses') === 'all'

  const { data } = await supabase
    .from('sessions')
    .select('id, session_number, status, topic, date, school:schools(name, campus_id)')
    .order('updated_at', { ascending: false })
    .limit(10)

  if (!data) return []

  const filtered = isAll ? data : data.filter((s: any) => s.school?.campus_id === user.campus_id)

  return (filtered as any[]).slice(0, 5).map((s) => ({
    id: s.id,
    title: `Session #${s.session_number}: ${s.topic || 'No topic'}`,
    description: `At ${s.school?.name || 'School'}. Date: ${s.date}`,
    date: s.date,
    badgeText: s.status,
    href: `/dashboard/sessions/${s.id}`,
  }))
}

export async function getFinanceUpdates(): Promise<UpdateItem[]> {
  const user = await getSessionUser()
  if (!user) return []

  const supabase = await createClient()
  const isAll = can(user.role, 'view_all_campuses') === 'all'

  const { data } = await supabase
    .from('reimbursements')
    .select('id, amount, status, created_at, travel_mode, session:sessions(topic), campus_id')
    .order('updated_at', { ascending: false })
    .limit(10)

  if (!data) return []

  const filtered = isAll ? data : data.filter((r: any) => r.campus_id === user.campus_id)

  return (filtered as any[]).slice(0, 5).map((r) => ({
    id: r.id,
    title: `Claim for ₹${r.amount}`,
    description: `Session: ${r.session?.topic || 'Travel'}. Mode: ${r.travel_mode}`,
    date: r.created_at,
    badgeText: r.status,
    href: `/dashboard/reimbursements`,
  }))
}

export async function getEvidenceUpdates(): Promise<UpdateItem[]> {
  const user = await getSessionUser()
  if (!user) return []

  const supabase = await createClient()
  const isAll = can(user.role, 'view_all_campuses') === 'all'

  const { data } = await supabase
    .from('media_assets')
    .select('id, file_name, file_type, approval_status, created_at, school:schools(name, campus_id)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!data) return []

  const filtered = isAll ? data : data.filter((m: any) => m.school?.campus_id === user.campus_id)

  return (filtered as any[]).slice(0, 5).map((m) => ({
    id: m.id,
    title: `Evidence: ${m.file_name}`,
    description: `Type: ${m.file_type}. School: ${m.school?.name || 'Unknown'}`,
    date: m.created_at,
    badgeText: m.approval_status,
    href: `/dashboard/evidence`,
  }))
}

export async function getVolunteerUpdates(): Promise<UpdateItem[]> {
  const user = await getSessionUser()
  if (!user) return []

  const supabase = await createClient()
  const isAll = can(user.role, 'view_all_campuses') === 'all'

  const { data } = await supabase
    .from('session_assignments')
    .select('id, status, assigned_at, volunteer:users(full_name), session:sessions(id, topic, school:schools(name, campus_id))')
    .order('assigned_at', { ascending: false })
    .limit(10)

  if (!data) return []

  const filtered = isAll ? data : data.filter((a: any) => a.session?.school?.campus_id === user.campus_id)

  return (filtered as any[]).slice(0, 5).map((a) => ({
    id: a.id,
    title: `Assignment: ${a.volunteer?.full_name || 'Volunteer'}`,
    description: `For ${a.session?.topic || 'Session'} at ${a.session?.school?.name || 'School'}`,
    date: a.assigned_at,
    badgeText: a.status,
    href: a.session ? `/dashboard/sessions/${a.session.id}` : `/dashboard/assignments`,
  }))
}

export async function getSchoolUpdates(): Promise<UpdateItem[]> {
  const user = await getSessionUser()
  if (!user) return []

  const supabase = await createClient()
  const isAll = can(user.role, 'view_all_campuses') === 'all'

  const { data } = await supabase
    .from('school_status_history')
    .select('id, previous_status, new_status, note, created_at, school:schools(id, name, campus_id)')
    .order('created_at', { ascending: false })
    .limit(10)

  if (!data) return []

  const filtered = isAll ? data : data.filter((h: any) => h.school?.campus_id === user.campus_id)

  return (filtered as any[]).slice(0, 5).map((h) => ({
    id: h.id,
    title: `School: ${h.school?.name || 'Unknown'}`,
    description: `Changed from ${h.previous_status || 'none'} to ${h.new_status}.${h.note ? ` Note: ${h.note}` : ''}`,
    date: h.created_at,
    badgeText: h.new_status,
    href: h.school ? `/dashboard/schools/${h.school.id}` : `/dashboard/schools`,
  }))
}
