import type { UserRole } from '@/types/database'

/** Human-facing role metadata — labels, descriptions, and which roles are invitable. */
export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  mgmt_admin: 'Management Admin',
  campus_lead: 'Campus Lead',
  outreach_head: 'Outreach Head',
  exec_lead: 'Execution Lead',
  volunteer: 'Volunteer',
  school_poc: 'School POC',
  viewer: 'Viewer',
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Full platform access and final say on all configuration.',
  mgmt_admin: 'NIAT leadership — analytics, finance approval, and oversight.',
  campus_lead: 'Runs a campus: schools, sessions, volunteers, local approvals.',
  outreach_head: 'Owns school outreach and the approval pipeline.',
  exec_lead: 'Plans and reports sessions; manages attendance and evidence.',
  volunteer: 'Attends sessions and submits reimbursement claims.',
  school_poc: 'School-side contact — interacts via email links, not a portal login.',
  viewer: 'Read-only impact and analytics access (partners / donors).',
}

/** Roles an admin can assign via the invite flow (PRD §7.2). */
export const INVITABLE_ROLES: UserRole[] = [
  'mgmt_admin', 'campus_lead', 'outreach_head', 'exec_lead', 'volunteer', 'viewer',
]

export function roleLabel(role: UserRole): string {
  return ROLE_LABELS[role] ?? role
}
