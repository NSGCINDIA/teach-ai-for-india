import { createClient } from '@/lib/supabase/server'
import { PRESENT_STATUSES } from '@/lib/constants/sessions'
import { listSchoolProgress } from '@/lib/data/schools'
import type { SchoolStatus, SessionStatus } from '@/types/database'

/**
 * Per-role dashboard aggregations (Team Dashboard PRD). Every query is campus
 * scoped by `campusId`; RLS is the real boundary, this is the display filter.
 * All functions are server-only (imported by server components).
 */

const today = () => new Date().toISOString().slice(0, 10)
const OPEN_SESSION: SessionStatus[] = ['planned', 'in_progress']

export interface SessionLite {
  id: string
  topic: string
  date: string
  start_time: string | null
  status: SessionStatus
  school_name: string
}
export interface SchoolLite {
  id: string
  name: string
  district: string
  status: SchoolStatus
  next_action_date: string | null
  latest_session_number?: number
  latest_session_status?: SessionStatus
}
export interface ReimbLite {
  id: string
  reference_number: string
  amount: number
  status: string
  claimant_name: string
}
export interface BudgetRequestLite {
  id: string
  requested_amount: number
  reason: string
  period: string
  created_at: string
  requester_name: string
}

const SESSION_COLS = 'id, topic, date, start_time, status, school:schools(name)'
type SessionRowRaw = {
  id: string; topic: string; date: string; start_time: string | null
  status: SessionStatus; school: { name: string } | { name: string }[] | null
}
function toSessionLite(rows: SessionRowRaw[] | null): SessionLite[] {
  return (rows ?? []).map((r) => ({
    id: r.id, topic: r.topic, date: r.date, start_time: r.start_time, status: r.status,
    school_name: Array.isArray(r.school) ? (r.school[0]?.name ?? '—') : (r.school?.name ?? '—'),
  }))
}

// ─── Campus Lead ──────────────────────────────────────────────────────────────
export interface CampusLeadData {
  kpis: {
    schoolsActive: number; studentsImpacted: number; sessionsCompleted: number
    upcomingSessions: number; volunteersActive: number; pendingReports: number
    pendingPayments: number; evidenceUploaded: number
  }
  todaySessions: SessionLite[]
  upcomingSessions: SessionLite[]
  pendingApprovals: SchoolLite[]
  pendingReports: SessionLite[]
  pendingReimbursements: ReimbLite[]
  pendingBudgetRequests: BudgetRequestLite[]
}

export async function getCampusLeadData(campusId: string): Promise<CampusLeadData> {
  const supabase = await createClient()
  const t = today()
  const head = { count: 'exact' as const, head: true }

  const [
    schoolsActive, sessionsCompleted, upcomingCount, volunteers, pendingReportsCount,
    pendingPayments, evidence, students,
    todaySessions, upcomingSessions, pendingApprovals, pendingReports, pendingReimb, pendingBudgetReq,
  ] = await Promise.all([
    supabase.from('schools').select('id', head).eq('campus_id', campusId).neq('status', 'archived'),
    supabase.from('sessions').select('id', head).eq('campus_id', campusId).eq('status', 'verified'),
    supabase.from('sessions').select('id', head).eq('campus_id', campusId).gte('date', t).in('status', OPEN_SESSION),
    supabase.from('users').select('id', head).eq('campus_id', campusId).eq('is_active', true).eq('role', 'volunteer'),
    supabase.from('sessions').select('id', head).eq('campus_id', campusId).lte('date', t).in('status', OPEN_SESSION),
    supabase.from('reimbursements').select('id', head).eq('campus_id', campusId).eq('status', 'approved'),
    supabase.from('media_assets').select('id', head).eq('campus_id', campusId).is('deleted_at', null),
    supabase.from('schools').select('total_students').eq('campus_id', campusId),
    supabase.from('sessions').select(SESSION_COLS).eq('campus_id', campusId).eq('date', t).order('start_time'),
    supabase.from('sessions').select(SESSION_COLS).eq('campus_id', campusId).gt('date', t).in('status', OPEN_SESSION).order('date').limit(5),
    supabase.from('schools').select('id, name, district, status, next_action_date').eq('campus_id', campusId).eq('status', 'approval_requested').order('next_action_date').limit(5),
    supabase.from('sessions').select(SESSION_COLS).eq('campus_id', campusId).lte('date', t).in('status', OPEN_SESSION).order('date').limit(5),
    supabase.from('reimbursements').select('id, reference_number, amount, status, claimant:users!reimbursements_claimant_id_fkey(full_name)').eq('campus_id', campusId).in('status', ['submitted', 'under_review']).order('created_at').limit(5),
    supabase.from('budget_increase_requests').select('id, requested_amount, reason, period, created_at, requester:users!budget_increase_requests_created_by_fkey(full_name)').eq('campus_id', campusId).eq('status', 'pending').order('created_at').limit(5),
  ])

  const studentsImpacted = ((students.data as { total_students: number }[] | null) ?? [])
    .reduce((sum, s) => sum + (s.total_students ?? 0), 0)

  return {
    kpis: {
      schoolsActive: schoolsActive.count ?? 0,
      studentsImpacted,
      sessionsCompleted: sessionsCompleted.count ?? 0,
      upcomingSessions: upcomingCount.count ?? 0,
      volunteersActive: volunteers.count ?? 0,
      pendingReports: pendingReportsCount.count ?? 0,
      pendingPayments: pendingPayments.count ?? 0,
      evidenceUploaded: evidence.count ?? 0,
    },
    todaySessions: toSessionLite(todaySessions.data as SessionRowRaw[] | null),
    upcomingSessions: toSessionLite(upcomingSessions.data as SessionRowRaw[] | null),
    pendingApprovals: (pendingApprovals.data as SchoolLite[] | null) ?? [],
    pendingReports: toSessionLite(pendingReports.data as SessionRowRaw[] | null),
    pendingReimbursements: toReimbLite(pendingReimb.data),
    pendingBudgetRequests: toBudgetRequestLite(pendingBudgetReq.data),
  }
}

type ReimbRaw = {
  id: string; reference_number: string; amount: number; status: string
  claimant: { full_name: string } | { full_name: string }[] | null
}
function toReimbLite(rows: unknown): ReimbLite[] {
  return ((rows as ReimbRaw[] | null) ?? []).map((r) => ({
    id: r.id, reference_number: r.reference_number, amount: r.amount, status: r.status,
    claimant_name: Array.isArray(r.claimant) ? (r.claimant[0]?.full_name ?? '—') : (r.claimant?.full_name ?? '—'),
  }))
}

type BudgetRequestRaw = {
  id: string; requested_amount: number; reason: string; period: string; created_at: string
  requester: { full_name: string } | { full_name: string }[] | null
}
function toBudgetRequestLite(rows: unknown): BudgetRequestLite[] {
  return ((rows as BudgetRequestRaw[] | null) ?? []).map((r) => ({
    id: r.id, requested_amount: r.requested_amount, reason: r.reason, period: r.period, created_at: r.created_at,
    requester_name: Array.isArray(r.requester) ? (r.requester[0]?.full_name ?? '—') : (r.requester?.full_name ?? '—'),
  }))
}

// ─── Outreach Lead ──────────────────────────────────────────────────────────
export interface OutreachData {
  kpis: { totalSchools: number; approved: number; sessionsScheduled: number; leads: number }
  pipeline: { status: SchoolStatus; count: number }[]
  awaitingFollowup: SchoolLite[]
  upcomingVisits: SchoolLite[]
  recentlyAdded: SchoolLite[]
}

export async function getOutreachData(campusId: string): Promise<OutreachData> {
  const supabase = await createClient()
  const t = today()
  const [{ data }, progress] = await Promise.all([
    supabase
      .from('schools')
      .select('id, name, district, status, next_action_date, created_at')
      .eq('campus_id', campusId)
      .order('created_at', { ascending: false })
      .limit(1000),
    listSchoolProgress(),
  ])

  const rows = (data as (SchoolLite & { created_at: string })[] | null) ?? []
  for (const r of rows) Object.assign(r, progress.get(r.id))
  const counts = new Map<SchoolStatus, number>()
  for (const r of rows) counts.set(r.status, (counts.get(r.status) ?? 0) + 1)

  const pipelineOrder: SchoolStatus[] = [
    'lead_identified', 'contacted', 'followup_pending', 'approval_requested',
    'approval_received', 'session_scheduled', 'session_in_progress', 'completed',
  ]

  return {
    kpis: {
      totalSchools: rows.filter((r) => r.status !== 'archived').length,
      approved: counts.get('approval_received') ?? 0,
      sessionsScheduled: counts.get('session_scheduled') ?? 0,
      leads: (counts.get('lead_identified') ?? 0) + (counts.get('contacted') ?? 0),
    },
    pipeline: pipelineOrder.map((status) => ({ status, count: counts.get(status) ?? 0 })),
    awaitingFollowup: rows
      .filter((r) => r.status === 'followup_pending' || r.status === 'approval_requested')
      .slice(0, 6),
    upcomingVisits: rows
      .filter((r) => r.next_action_date && r.next_action_date >= t && r.status !== 'archived' && r.status !== 'completed')
      .sort((a, b) => (a.next_action_date! < b.next_action_date! ? -1 : 1))
      .slice(0, 6),
    recentlyAdded: rows.slice(0, 6),
  }
}

// ─── Volunteer Lead ─────────────────────────────────────────────────────────
export interface VolunteerLeadData {
  kpis: { volunteersAvailable: number; upcomingSessions: number; attendanceRate: number; sessionsThisMonth: number }
  upcomingSessions: SessionLite[]
  attendance: { present: number; total: number }
}

export async function getVolunteerLeadData(campusId: string): Promise<VolunteerLeadData> {
  const supabase = await createClient()
  const t = today()
  const head = { count: 'exact' as const, head: true }
  const monthStart = t.slice(0, 8) + '01'

  const [volunteers, upcomingCount, upcomingSessions, attTotal, attPresent, monthCount] = await Promise.all([
    supabase.from('users').select('id', head).eq('campus_id', campusId).eq('is_active', true).eq('role', 'volunteer'),
    supabase.from('sessions').select('id', head).eq('campus_id', campusId).gte('date', t).in('status', OPEN_SESSION),
    supabase.from('sessions').select(SESSION_COLS).eq('campus_id', campusId).gte('date', t).in('status', OPEN_SESSION).order('date').limit(6),
    supabase.from('attendance_records').select('id, sessions!inner(campus_id)', head).eq('sessions.campus_id', campusId),
    supabase.from('attendance_records').select('id, sessions!inner(campus_id)', head).eq('sessions.campus_id', campusId).in('status', PRESENT_STATUSES),
    supabase.from('sessions').select('id', head).eq('campus_id', campusId).gte('date', monthStart).eq('status', 'verified'),
  ])

  const present = attPresent.count ?? 0
  const total = attTotal.count ?? 0
  return {
    kpis: {
      volunteersAvailable: volunteers.count ?? 0,
      upcomingSessions: upcomingCount.count ?? 0,
      attendanceRate: total ? Math.round((present / total) * 100) : 0,
      sessionsThisMonth: monthCount.count ?? 0,
    },
    upcomingSessions: toSessionLite(upcomingSessions.data as SessionRowRaw[] | null),
    attendance: { present, total },
  }
}

// ─── Execution Lead ─────────────────────────────────────────────────────────
export interface ExecData {
  kpis: { todayCount: number; upcomingCount: number; pendingReports: number; myClaims: number }
  todaySessions: SessionLite[]
  upcomingSessions: SessionLite[]
  pendingReports: SessionLite[]
}

export async function getExecData(campusId: string, userId: string): Promise<ExecData> {
  const supabase = await createClient()
  const t = today()
  const head = { count: 'exact' as const, head: true }

  const [todayCount, upcomingCount, pendingCount, myClaims, todaySessions, upcomingSessions, pendingReports] =
    await Promise.all([
      supabase.from('sessions').select('id', head).eq('campus_id', campusId).eq('date', t),
      supabase.from('sessions').select('id', head).eq('campus_id', campusId).gt('date', t).in('status', OPEN_SESSION),
      supabase.from('sessions').select('id', head).eq('campus_id', campusId).lte('date', t).in('status', OPEN_SESSION),
      supabase.from('reimbursements').select('id', head).eq('claimant_id', userId).in('status', ['draft', 'submitted', 'under_review', 'rejected']),
      supabase.from('sessions').select(SESSION_COLS).eq('campus_id', campusId).eq('date', t).order('start_time'),
      supabase.from('sessions').select(SESSION_COLS).eq('campus_id', campusId).gt('date', t).in('status', OPEN_SESSION).order('date').limit(5),
      supabase.from('sessions').select(SESSION_COLS).eq('campus_id', campusId).lte('date', t).in('status', OPEN_SESSION).order('date').limit(6),
    ])

  return {
    kpis: {
      todayCount: todayCount.count ?? 0,
      upcomingCount: upcomingCount.count ?? 0,
      pendingReports: pendingCount.count ?? 0,
      myClaims: myClaims.count ?? 0,
    },
    todaySessions: toSessionLite(todaySessions.data as SessionRowRaw[] | null),
    upcomingSessions: toSessionLite(upcomingSessions.data as SessionRowRaw[] | null),
    pendingReports: toSessionLite(pendingReports.data as SessionRowRaw[] | null),
  }
}

// ─── Volunteer ──────────────────────────────────────────────────────────────
export interface VolunteerData {
  kpis: { upcomingCount: number; pastSessions: number; hoursContributed: number; myClaims: number }
  upcomingSessions: SessionLite[]
}

export async function getVolunteerData(userId: string): Promise<VolunteerData> {
  const supabase = await createClient()
  const t = today()
  const head = { count: 'exact' as const, head: true }

  const [upcoming, past, hoursRows, myClaims] = await Promise.all([
    supabase.from('sessions').select(SESSION_COLS).contains('team_members_present', [userId]).gte('date', t).order('date').limit(5),
    supabase.from('attendance_records').select('id', head).eq('user_id', userId).in('status', PRESENT_STATUSES),
    supabase.from('attendance_records').select('sessions!inner(duration_minutes)').eq('user_id', userId).in('status', PRESENT_STATUSES),
    supabase.from('reimbursements').select('id', head).eq('claimant_id', userId),
  ])

  const minutes = ((hoursRows.data as { sessions: { duration_minutes: number | null } | { duration_minutes: number | null }[] }[] | null) ?? [])
    .reduce((sum, r) => {
      const s = Array.isArray(r.sessions) ? r.sessions[0] : r.sessions
      return sum + (s?.duration_minutes ?? 0)
    }, 0)

  const upcomingSessions = toSessionLite(upcoming.data as SessionRowRaw[] | null)
  return {
    kpis: {
      upcomingCount: upcomingSessions.length,
      pastSessions: past.count ?? 0,
      hoursContributed: Math.round(minutes / 60),
      myClaims: myClaims.count ?? 0,
    },
    upcomingSessions,
  }
}
