import type { UserRole } from '@/types/database'
import { canAccessPath, isAdmin } from '@/lib/auth/rbac'

/**
 * Icon keys — nav is built on the server and passed to a Client Component, so
 * we send serializable string keys instead of Lucide components. The client
 * shell resolves each key to its icon via NAV_ICONS.
 */
export type NavIconKey =
  | 'overview' | 'sessions' | 'schools' | 'attendance' | 'reimbursements'
  | 'evidence' | 'notifications' | 'campuses' | 'volunteers' | 'finance'
  | 'reports' | 'analytics' | 'content' | 'settings'
  | 'calendar' | 'assignments' | 'availability' | 'certificates' | 'outreach' | 'profile'

export interface NavItem {
  label: string
  href: string
  icon: NavIconKey
  /** Built in a later phase — rendered disabled so the IA is visible. */
  soon?: boolean
}

const OVERVIEW: NavItem = { label: 'Overview', href: '/dashboard', icon: 'overview' }
const NOTIFICATIONS: NavItem = { label: 'Notifications', href: '/dashboard/notifications', icon: 'notifications' }

/**
 * Per-role dashboard sidebars (Team Dashboard PRD). Each leadership role sees
 * only the modules its responsibility needs. Routes not yet built are marked
 * `soon` so the information architecture is visible today.
 */
const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  campus_lead: [
    OVERVIEW,
    { label: 'Schools', href: '/dashboard/schools', icon: 'schools' },
    { label: 'Sessions', href: '/dashboard/sessions', icon: 'sessions' },
    { label: 'Volunteers', href: '/dashboard/volunteers', icon: 'volunteers', soon: true },
    { label: 'Attendance', href: '/dashboard/attendance', icon: 'attendance' },
    { label: 'Evidence', href: '/dashboard/evidence', icon: 'evidence' },
    { label: 'Finance', href: '/dashboard/reimbursements', icon: 'finance' },
    { label: 'Analytics', href: '/dashboard/analytics', icon: 'analytics', soon: true },
    { label: 'Calendar', href: '/dashboard/calendar', icon: 'calendar', soon: true },
    NOTIFICATIONS,
    { label: 'Settings', href: '/dashboard/settings', icon: 'settings', soon: true },
  ],
  outreach_head: [
    OVERVIEW,
    { label: 'Schools', href: '/dashboard/schools', icon: 'schools' },
    { label: 'Outreach Forms', href: '/dashboard/schools/new', icon: 'outreach' },
    { label: 'Approval Letters', href: '/dashboard/approval-letters', icon: 'reports', soon: true },
    { label: 'Visit Schedule', href: '/dashboard/visit-schedule', icon: 'calendar', soon: true },
    NOTIFICATIONS,
  ],
  volunteer_lead: [
    OVERVIEW,
    { label: 'Volunteers', href: '/dashboard/volunteers', icon: 'volunteers', soon: true },
    { label: 'Assignments', href: '/dashboard/assignments', icon: 'assignments', soon: true },
    { label: 'Availability', href: '/dashboard/availability', icon: 'availability', soon: true },
    { label: 'Attendance', href: '/dashboard/attendance', icon: 'attendance' },
    NOTIFICATIONS,
  ],
  exec_lead: [
    OVERVIEW,
    { label: "Today's Sessions", href: '/dashboard/sessions', icon: 'sessions' },
    { label: 'Reports', href: '/dashboard/reports', icon: 'reports', soon: true },
    { label: 'Attendance', href: '/dashboard/attendance', icon: 'attendance' },
    { label: 'Evidence', href: '/dashboard/evidence', icon: 'evidence' },
    { label: 'Reimbursements', href: '/dashboard/reimbursements', icon: 'reimbursements' },
    NOTIFICATIONS,
  ],
  volunteer: [
    OVERVIEW,
    { label: 'My Sessions', href: '/dashboard/sessions', icon: 'sessions' },
    { label: 'Attendance', href: '/dashboard/attendance', icon: 'attendance' },
    { label: 'Evidence', href: '/dashboard/evidence', icon: 'evidence' },
    { label: 'Reimbursements', href: '/dashboard/reimbursements', icon: 'reimbursements' },
    { label: 'Certificates', href: '/dashboard/certificates', icon: 'certificates', soon: true },
    { label: 'Profile', href: '/dashboard/profile', icon: 'profile', soon: true },
  ],
  // Roles that don't primarily live in the team dashboard fall back to the
  // campus-lead layout when they visit it.
  super_admin: [],
  mgmt_admin: [],
  school_poc: [OVERVIEW, NOTIFICATIONS],
  viewer: [OVERVIEW],
}

/** Admin panel nav (PRD §7.9 / §8). */
const ADMIN_NAV: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: 'overview' },
  { label: 'Campuses', href: '/admin/campuses', icon: 'campuses' },
  { label: 'Schools', href: '/admin/schools', icon: 'schools' },
  { label: 'Sessions', href: '/admin/sessions', icon: 'sessions' },
  { label: 'Volunteers', href: '/admin/volunteers', icon: 'volunteers' },
  { label: 'Finance', href: '/admin/finance', icon: 'finance' },
  { label: 'Evidence', href: '/admin/evidence', icon: 'evidence' },
  { label: 'Reports', href: '/admin/reports', icon: 'reports' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'analytics' },
  { label: 'Content', href: '/admin/content', icon: 'content' },
  { label: 'Settings', href: '/admin/settings', icon: 'settings' },
]

export function dashboardNav(role: UserRole): NavItem[] {
  const items = NAV_BY_ROLE[role]?.length ? NAV_BY_ROLE[role] : NAV_BY_ROLE.campus_lead
  // Defence-in-depth: never surface a real (non-soon) route the role can't open.
  return items.filter((i) => i.soon || isAdmin(role) || canAccessPath(role, i.href))
}

export function adminNav(role: UserRole): NavItem[] {
  return ADMIN_NAV.filter((i) => canAccessPath(role, i.href))
}
