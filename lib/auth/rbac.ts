import type { UserRole, SchoolStatus } from '@/types/database'
import { EXEC_LEAD_SCHOOL_STATUSES } from '@/lib/constants/status'

/**
 * Role-Based Access Control — the single source of truth for the PRD §7.2
 * permission matrix. Used for UI gating AND middleware route protection.
 * NOTE: this is defense-in-depth. The DATABASE (RLS) is the real enforcement
 * layer (PRD §13.3 — "no client-side role checks only").
 */

export type Permission =
  | 'view_all_campuses'
  | 'edit_school'
  | 'create_session'
  | 'submit_reimbursement'
  | 'approve_reimbursement'
  | 'view_analytics_all'
  | 'view_analytics_campus'
  | 'upload_evidence'
  | 'assign_volunteers'
  | 'edit_cms'
  | 'manage_user_roles'
  | 'export_data'

/** 'all' = unrestricted, 'own' = own campus only (RLS enforces scope), false = denied. */
export type Scope = 'all' | 'own' | false

const MATRIX: Record<UserRole, Record<Permission, Scope>> = {
  super_admin: {
    view_all_campuses: 'all', edit_school: 'all', create_session: 'all',
    submit_reimbursement: 'all', approve_reimbursement: 'all',
    view_analytics_all: 'all', view_analytics_campus: 'all', upload_evidence: 'all',
    assign_volunteers: 'all', edit_cms: 'all', manage_user_roles: 'all', export_data: 'all',
  },
  campus_lead: {
    view_all_campuses: false, edit_school: 'own', create_session: 'own',
    submit_reimbursement: false, approve_reimbursement: false,
    view_analytics_all: false, view_analytics_campus: 'own', upload_evidence: 'own',
    assign_volunteers: 'own', edit_cms: false, manage_user_roles: 'own', export_data: 'own',
  },
  outreach_lead: {
    view_all_campuses: false, edit_school: 'own', create_session: false,
    submit_reimbursement: 'own', approve_reimbursement: false,
    view_analytics_all: false, view_analytics_campus: 'own', upload_evidence: 'own',
    assign_volunteers: false, edit_cms: false, manage_user_roles: false, export_data: false,
  },
  exec_lead: {
    view_all_campuses: false, edit_school: false, create_session: 'own',
    submit_reimbursement: 'own', approve_reimbursement: false,
    view_analytics_all: false, view_analytics_campus: 'own', upload_evidence: 'own',
    assign_volunteers: false, edit_cms: false, manage_user_roles: false, export_data: false,
  },
  volunteer_lead: {
    view_all_campuses: false, edit_school: false, create_session: false,
    submit_reimbursement: false, approve_reimbursement: false,
    view_analytics_all: false, view_analytics_campus: 'own', upload_evidence: false,
    assign_volunteers: 'own', edit_cms: false, manage_user_roles: false, export_data: false,
  },
  volunteer: {
    view_all_campuses: false, edit_school: false, create_session: false,
    submit_reimbursement: 'own', approve_reimbursement: false,
    view_analytics_all: false, view_analytics_campus: false, upload_evidence: 'own',
    assign_volunteers: false, edit_cms: false, manage_user_roles: false, export_data: false,
  },
  // Campus-scoped monitoring roles (Operational Workflow Spec v2.0, Phase 1).
  // Read-only for now — their real review/approve workflows land in later phases.
  campus_mgmt_admin: {
    view_all_campuses: false, edit_school: false, create_session: false,
    submit_reimbursement: false, approve_reimbursement: false,
    view_analytics_all: false, view_analytics_campus: 'own', upload_evidence: false,
    assign_volunteers: false, edit_cms: false, manage_user_roles: false, export_data: false,
  },
  finance_lead: {
    view_all_campuses: false, edit_school: false, create_session: false,
    submit_reimbursement: false, approve_reimbursement: false,
    view_analytics_all: false, view_analytics_campus: 'own', upload_evidence: false,
    assign_volunteers: false, edit_cms: false, manage_user_roles: false, export_data: false,
  },
}

export function can(role: UserRole, permission: Permission): Scope {
  return MATRIX[role]?.[permission] ?? false
}

export function isAdmin(role: UserRole): boolean {
  return role === 'super_admin'
}

/**
 * Resolve a campus-scoped permission against a specific entity. 'all' → always,
 * 'own' → only when the entity belongs to the user's campus, false → never.
 * Mirrors the RLS rule; UI gating only (the DB is the real check).
 */
export function canForEntity(
  role: UserRole,
  permission: Permission,
  userCampusId: string | null,
  entityCampusId: string | null,
): boolean {
  const scope = can(role, permission)
  if (scope === 'all') return true
  if (scope === 'own') return !!userCampusId && userCampusId === entityCampusId
  return false
}

export interface SchoolStatusAccess {
  canEdit: boolean
  /** Present only when the role's moves are restricted to a subset (exec_lead). */
  restrictTo?: SchoolStatus[]
}

/**
 * Whether/how a user may move a school through the pipeline — narrower than
 * `edit_school` (which also gates the profile/contacts editors). Admins: any
 * move. campus_lead/outreach_lead: any move, own campus only. exec_lead: own
 * campus, but only within the execution-stage subset (approval received
 * onward) — mirrors change_school_status() in 0024_exec_lead_school_status.sql.
 */
export function schoolStatusAccess(
  role: UserRole,
  userCampusId: string | null,
  entityCampusId: string | null,
): SchoolStatusAccess {
  if (isAdmin(role)) return { canEdit: true }
  const ownCampus = !!userCampusId && userCampusId === entityCampusId
  if (!ownCampus) return { canEdit: false }
  if (role === 'campus_lead' || role === 'outreach_lead') return { canEdit: true }
  if (role === 'exec_lead') return { canEdit: true, restrictTo: EXEC_LEAD_SCHOOL_STATUSES }
  return { canEdit: false }
}

export interface OutreachVisitRequestAccess {
  canCreate: boolean
  canReviewCampus: boolean
  canReviewFinance: boolean
}

/**
 * Access to an Outreach Visit Request — three independently-gated actions on
 * one entity (create, Campus Lead review, Finance Lead review), which the
 * generic Permission/Scope matrix can't express. Mirrors schoolStatusAccess's
 * precedent of a bespoke access shape outside the matrix.
 */
export function outreachVisitRequestAccess(
  role: UserRole,
  userCampusId: string | null,
  entityCampusId: string | null,
): OutreachVisitRequestAccess {
  const admin = isAdmin(role)
  const ownCampus = !!userCampusId && userCampusId === entityCampusId
  return {
    canCreate: admin || ((role === 'campus_lead' || role === 'outreach_lead') && ownCampus),
    canReviewCampus: admin || (role === 'campus_lead' && ownCampus),
    canReviewFinance: admin || (role === 'finance_lead' && ownCampus),
  }
}

export interface ExecutionPlanAccess {
  canSubmit: boolean
  canReviewCampus: boolean
  canReviewFinance: boolean
}

/**
 * Access to a session's Execution Plan. canSubmit is exec_lead-only (+ admin)
 * — deliberately NOT campus_lead, unlike canEditSession's precedent below:
 * Stage 6 requires the submitter (exec_lead) and the first-leg approver
 * (campus_lead) to be different actors, so letting campus_lead also submit
 * would let one role submit-and-approve its own plan.
 */
export function executionPlanAccess(
  role: UserRole,
  userCampusId: string | null,
  entityCampusId: string | null,
): ExecutionPlanAccess {
  const admin = isAdmin(role)
  const ownCampus = !!userCampusId && userCampusId === entityCampusId
  return {
    canSubmit: admin || (role === 'exec_lead' && ownCampus),
    canReviewCampus: admin || (role === 'campus_lead' && ownCampus),
    canReviewFinance: admin || (role === 'finance_lead' && ownCampus),
  }
}

export interface CampusBudgetAccess {
  canAllocate: boolean
  canRequestIncrease: boolean
  canReviewIncrease: boolean
}

/**
 * Access to a campus's budget lifecycle: allocate the initial amount
 * (Finance Lead only — the RPC also enforces "insert-only", this just gates
 * the UI), request an increase (Finance Lead), and review an increase
 * request (Campus Lead). Mirrors outreachVisitRequestAccess's precedent of a
 * bespoke access shape outside the generic Permission/Scope matrix.
 */
export function campusBudgetAccess(
  role: UserRole,
  userCampusId: string | null,
  entityCampusId: string | null,
): CampusBudgetAccess {
  const admin = isAdmin(role)
  const ownCampus = !!userCampusId && userCampusId === entityCampusId
  const finance = admin || (role === 'finance_lead' && ownCampus)
  return {
    canAllocate: finance,
    canRequestIncrease: finance,
    canReviewIncrease: admin || (role === 'campus_lead' && ownCampus),
  }
}

export interface ReimbursementReviewAccess {
  canReview: boolean
  canPay: boolean
}

/**
 * Access to review/pay a reimbursement claim — finance_lead of the claim's
 * own campus (+ admin) only. campus_lead is deliberately excluded: the spec
 * gives Campus Lead "Monitor finance requests" (view-only), which they
 * already have via reimb_select RLS, not approval power.
 */
export function reimbursementReviewAccess(
  role: UserRole,
  userCampusId: string | null,
  claimCampusId: string | null,
): ReimbursementReviewAccess {
  const allowed = isAdmin(role) || (role === 'finance_lead' && !!userCampusId && userCampusId === claimCampusId)
  return { canReview: allowed, canPay: allowed }
}

/**
 * Whether a user may edit/report a session. Mirrors the sessions_update RLS:
 * admins, the session's creator, or a campus_lead/exec_lead of its campus.
 */
export function canEditSession(
  role: UserRole,
  userId: string,
  userCampusId: string | null,
  session: { campus_id: string | null; created_by: string | null },
): boolean {
  if (isAdmin(role)) return true
  if (session.created_by && session.created_by === userId) return true
  if ((role === 'campus_lead' || role === 'exec_lead') && !!userCampusId && session.campus_id === userCampusId) {
    return true
  }
  return false
}

/** Where a role lands after login. Admins → admin panel; everyone else → dashboard. */
export function roleHomePath(role: UserRole): string {
  if (isAdmin(role)) return '/admin'
  return '/dashboard'
}

// ─── Route protection ─────────────────────────────────────────────────────────
// Most specific matching prefix wins. Roles not listed → 403.

const TEAM_ROLES: UserRole[] = [
  'super_admin', 'campus_lead', 'outreach_lead', 'exec_lead', 'volunteer_lead', 'volunteer',
  'campus_mgmt_admin', 'finance_lead',
]

const ROUTE_ACCESS: { prefix: string; roles: UserRole[] }[] = [
  // Admin panel — super_admin only.
  { prefix: '/admin', roles: ['super_admin'] },

  // Dashboard subsections (US-AUTH-02): outreach lead has NO finance, etc.
  // Volunteer Lead & Volunteer get schools read-only (matrix: Read Only / Assigned Only) — RLS + RBAC gate mutations.
  // campus_mgmt_admin/finance_lead get /dashboard/schools (finance_lead needs
  // it for the Stage-2 outreach-visit-request review UI), /dashboard/finance
  // (their Phase 5 Campus Finance Dashboard), /dashboard/reimbursements
  // (finance_lead now processes claims; campus_mgmt_admin already has
  // campus-wide read via reimb_select RLS, so blocking the route would be a
  // pure UI inconsistency — write access is gated separately by
  // reimbursementReviewAccess) and /dashboard/analytics (both roles' campus
  // monitoring — the page has no role branching, it's already RLS-scoped).
  { prefix: '/dashboard/schools', roles: ['super_admin', 'campus_lead', 'outreach_lead', 'exec_lead', 'volunteer_lead', 'volunteer', 'finance_lead', 'campus_mgmt_admin'] },
  { prefix: '/dashboard/finance', roles: ['super_admin', 'finance_lead', 'campus_mgmt_admin'] },
  { prefix: '/dashboard/reimbursements', roles: ['super_admin', 'campus_lead', 'outreach_lead', 'exec_lead', 'volunteer_lead', 'volunteer', 'finance_lead', 'campus_mgmt_admin'] },
  { prefix: '/dashboard/volunteers', roles: ['super_admin', 'campus_lead', 'exec_lead', 'volunteer_lead'] },
  { prefix: '/dashboard/analytics', roles: ['super_admin', 'campus_lead', 'finance_lead', 'campus_mgmt_admin'] },
  { prefix: '/dashboard/settings', roles: ['super_admin', 'campus_lead'] },
  { prefix: '/dashboard/reports', roles: ['super_admin', 'exec_lead'] },
  { prefix: '/dashboard/approval-letters', roles: ['super_admin', 'outreach_lead'] },
  { prefix: '/dashboard', roles: TEAM_ROLES },
]

export function canAccessPath(role: UserRole, path: string): boolean {
  const match = ROUTE_ACCESS.find((r) => path === r.prefix || path.startsWith(r.prefix + '/'))
  if (!match) return true // non-guarded path
  return match.roles.includes(role)
}
