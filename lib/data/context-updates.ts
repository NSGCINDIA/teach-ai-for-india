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

// ─── Embedded-relation shapes ────────────────────────────────────────────────
// Declared by hand because they cannot currently be inferred: every table in
// types/database.ts carries `Relationships: []`, so supabase-js resolves any
// embedded select to `SelectQueryError<"could not find the relation…">`. That
// is why this module previously used `any` at ten call sites.
//
// The real fix is `supabase gen types typescript`, which emits the foreign-key
// metadata that makes embeds infer on their own. It needs live project access,
// which was unavailable — see the implementation report. Until then these types
// describe exactly the columns each select below asks for, so the module is
// type-checked against its own queries rather than opted out of checking.

interface SchoolEmbed { id?: string; name: string; campus_id: string | null }
interface SessionTopicEmbed { topic: string | null }
interface SessionWithSchoolEmbed { id: string; topic: string | null; school: SchoolEmbed | SchoolEmbed[] | null }
interface VolunteerEmbed { full_name: string }

/**
 * Normalise an embedded to-one relation and give it its declared shape.
 *
 * PostgREST returns a single object for a to-one join and an array for a
 * to-many, so both are handled. This is the module's single narrowing point:
 * one documented assertion instead of an `any` at every call site.
 */
function one<T>(rel: unknown): T | null {
  const value = Array.isArray(rel) ? rel[0] : rel
  return (value ?? null) as T | null
}

/**
 * Narrow a result set to the caller's campus unless their role sees all
 * campuses. Purely a UI convenience — RLS has already scoped the rows.
 */
function scopeToCampus<T>(
  rows: T[],
  isAll: boolean,
  campusId: string | null,
  campusOf: (row: T) => string | null | undefined,
): T[] {
  if (isAll) return rows
  return rows.filter((row) => campusOf(row) === campusId)
}

const TAKE = 5

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

  return scopeToCampus(data, isAll, user.campus_id, (s) => one<SchoolEmbed>(s.school)?.campus_id)
    .slice(0, TAKE)
    .map((s) => ({
      id: s.id,
      title: `Session #${s.session_number}: ${s.topic || 'No topic'}`,
      description: `At ${one<SchoolEmbed>(s.school)?.name || 'School'}. Date: ${s.date}`,
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

  return scopeToCampus(data, isAll, user.campus_id, (r) => r.campus_id)
    .slice(0, TAKE)
    .map((r) => ({
      id: r.id,
      title: `Claim for ₹${r.amount}`,
      description: `Session: ${one<SessionTopicEmbed>(r.session)?.topic || 'Travel'}. Mode: ${r.travel_mode}`,
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

  return scopeToCampus(data, isAll, user.campus_id, (m) => one<SchoolEmbed>(m.school)?.campus_id)
    .slice(0, TAKE)
    .map((m) => ({
      id: m.id,
      title: `Evidence: ${m.file_name}`,
      description: `Type: ${m.file_type}. School: ${one<SchoolEmbed>(m.school)?.name || 'Unknown'}`,
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

  return scopeToCampus(data, isAll, user.campus_id, (a) => one<SchoolEmbed>(one<SessionWithSchoolEmbed>(a.session)?.school)?.campus_id)
    .slice(0, TAKE)
    .map((a) => {
      const session = one<SessionWithSchoolEmbed>(a.session)
      return {
        id: a.id,
        title: `Assignment: ${one<VolunteerEmbed>(a.volunteer)?.full_name || 'Volunteer'}`,
        description: `For ${session?.topic || 'Session'} at ${one<SchoolEmbed>(session?.school)?.name || 'School'}`,
        date: a.assigned_at,
        badgeText: a.status,
        href: session ? `/dashboard/sessions/${session.id}` : `/dashboard/assignments`,
      }
    })
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

  return scopeToCampus(data, isAll, user.campus_id, (h) => one<SchoolEmbed>(h.school)?.campus_id)
    .slice(0, TAKE)
    .map((h) => {
      const school = one<SchoolEmbed>(h.school)
      return {
        id: h.id,
        title: `School: ${school?.name || 'Unknown'}`,
        description: `Changed from ${h.previous_status || 'none'} to ${h.new_status}.${h.note ? ` Note: ${h.note}` : ''}`,
        date: h.created_at,
        badgeText: h.new_status,
        href: school ? `/dashboard/schools/${school.id}` : `/dashboard/schools`,
      }
    })
}
