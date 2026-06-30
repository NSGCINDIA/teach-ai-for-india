import type { UserRole } from '@/types/database'

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
    edit_cms: 'all', manage_user_roles: 'all', export_data: 'all',
  },
  mgmt_admin: {
    view_all_campuses: 'all', edit_school: 'all', create_session: 'all',
    submit_reimbursement: false, approve_reimbursement: 'all',
    view_analytics_all: 'all', view_analytics_campus: 'all', upload_evidence: 'all',
    edit_cms: 'all', manage_user_roles: false, export_data: 'all',
  },
  campus_lead: {
    view_all_campuses: false, edit_school: 'own', create_session: 'own',
    submit_reimbursement: false, approve_reimbursement: false,
    view_analytics_all: false, view_analytics_campus: 'own', upload_evidence: 'own',
    edit_cms: false, manage_user_roles: 'own', export_data: 'own',
  },
  outreach_head: {
    view_all_campuses: false, edit_school: 'own', create_session: false,
    submit_reimbursement: 'own', approve_reimbursement: false,
    view_analytics_all: false, view_analytics_campus: false, upload_evidence: 'own',
    edit_cms: false, manage_user_roles: false, export_data: false,
  },
  exec_lead: {
    view_all_campuses: false, edit_school: false, create_session: 'own',
    submit_reimbursement: 'own', approve_reimbursement: false,
    view_analytics_all: false, view_analytics_campus: false, upload_evidence: 'own',
    edit_cms: false, manage_user_roles: false, export_data: false,
  },
  volunteer: {
    view_all_campuses: false, edit_school: false, create_session: false,
    submit_reimbursement: 'own', approve_reimbursement: false,
    view_analytics_all: false, view_analytics_campus: false, upload_evidence: 'own',
    edit_cms: false, manage_user_roles: false, export_data: false,
  },
  school_poc: {
    view_all_campuses: false, edit_school: false, create_session: false,
    submit_reimbursement: false, approve_reimbursement: false,
    view_analytics_all: false, view_analytics_campus: false, upload_evidence: false,
    edit_cms: false, manage_user_roles: false, export_data: false,
  },
  viewer: {
    view_all_campuses: 'all', edit_school: false, create_session: false,
    submit_reimbursement: false, approve_reimbursement: false,
    view_analytics_all: 'all', view_analytics_campus: 'all', upload_evidence: false,
    edit_cms: false, manage_user_roles: false, export_data: false,
  },
}

export function can(role: UserRole, permission: Permission): Scope {
  return MATRIX[role]?.[permission] ?? false
}

export function isAdmin(role: UserRole): boolean {
  return role === 'super_admin' || role === 'mgmt_admin'
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
  if (role === 'viewer') return '/admin/analytics'
  return '/dashboard'
}

// ─── Route protection ─────────────────────────────────────────────────────────
// Most specific matching prefix wins. Roles not listed → 403.

const TEAM_ROLES: UserRole[] = [
  'super_admin', 'mgmt_admin', 'campus_lead', 'outreach_head', 'exec_lead', 'volunteer',
]

const ROUTE_ACCESS: { prefix: string; roles: UserRole[] }[] = [
  // Admin panel — management only (PRD §7.9). 'viewer' gets read analytics.
  { prefix: '/admin/finance', roles: ['super_admin', 'mgmt_admin'] },
  { prefix: '/admin/content', roles: ['super_admin', 'mgmt_admin'] },
  { prefix: '/admin/settings', roles: ['super_admin', 'mgmt_admin'] },
  { prefix: '/admin/analytics', roles: ['super_admin', 'mgmt_admin', 'viewer'] },
  { prefix: '/admin', roles: ['super_admin', 'mgmt_admin'] },

  // Dashboard subsections (US-AUTH-02): outreach head has NO finance, etc.
  { prefix: '/dashboard/schools', roles: ['super_admin', 'mgmt_admin', 'campus_lead', 'outreach_head', 'exec_lead'] },
  { prefix: '/dashboard/reimbursements', roles: ['super_admin', 'campus_lead', 'outreach_head', 'exec_lead', 'volunteer'] },
  { prefix: '/dashboard', roles: TEAM_ROLES },
]

export function canAccessPath(role: UserRole, path: string): boolean {
  const match = ROUTE_ACCESS.find((r) => path === r.prefix || path.startsWith(r.prefix + '/'))
  if (!match) return true // non-guarded path
  return match.roles.includes(role)
}
