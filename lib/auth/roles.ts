import type { UserRole } from '@/types/database'

/** Human-facing role metadata — labels, descriptions, and which roles are invitable. */
export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  campus_lead: 'Campus Lead',
  outreach_lead: 'Outreach Lead',
  exec_lead: 'Execution Lead',
  volunteer_lead: 'Volunteer Lead',
  volunteer: 'Volunteer',
  campus_mgmt_admin: 'Campus Management Admin',
  finance_lead: 'Finance Lead',
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Full platform access and final say on all configuration.',
  campus_lead: 'Runs a campus: schools, sessions, volunteers, local approvals.',
  outreach_lead: 'Owns school outreach and the approval pipeline.',
  exec_lead: 'Plans and reports sessions; manages attendance and evidence.',
  volunteer_lead: 'Recruits, assigns, and coordinates the campus volunteer team.',
  volunteer: 'Attends sessions and submits reimbursement claims.',
  campus_mgmt_admin: 'Monitors one campus: reports, finance, and analytics — no operational tasks.',
  finance_lead: 'Reviews campus budgets and travel/execution costs, processes reimbursements.',
}

/** Roles an admin can assign via the invite flow (PRD §7.2). */
export const INVITABLE_ROLES: UserRole[] = [
  'campus_lead', 'outreach_lead', 'exec_lead', 'volunteer_lead', 'volunteer',
  'campus_mgmt_admin', 'finance_lead',
]

/**
 * Roles an applicant may request on public /signup — non-privileged team roles
 * only (an admin still approves). Mirrors the CHECK in 0019/0025. The
 * campus-management/finance roles are invite-only and can never be self-requested.
 */
export const SELF_SIGNUP_ROLES: UserRole[] = [
  'volunteer', 'volunteer_lead', 'exec_lead', 'outreach_lead', 'campus_lead',
]

export function roleLabel(role: UserRole): string {
  return ROLE_LABELS[role] ?? role
}
