import type { UserRole } from '@/types/database'
import { canAccessPath, isAdmin } from '@/lib/auth/rbac'

/**
 * Icon keys — nav is built on the server and passed to a Client Component, so
 * we send serializable string keys instead of Lucide components. The client
 * shell resolves each key to its icon via NAV_ICONS.
 */
export type NavIconKey =
  | 'overview' | 'sessions' | 'schools' | 'attendance' | 'reimbursements'
  | 'evidence' | 'campuses' | 'volunteers' | 'finance'
  | 'reports' | 'analytics' | 'content' | 'settings'
  | 'calendar' | 'assignments' | 'availability' | 'certificates' | 'outreach' | 'profile'
  | 'blogs' | 'blog'

/**
 * Sidebar sections. A flat list of eleven items reads as eleven equally-weighted
 * choices; grouping them by what the user is trying to *do* means the eye lands
 * on a section first and scans three or four items inside it. Order here is the
 * order the sections render — `main` carries no heading because the items above
 * the first divider need no explanation.
 */
export type NavGroup = 'main' | 'field' | 'people' | 'money' | 'insight' | 'account'

export const NAV_GROUP_ORDER: NavGroup[] = ['main', 'field', 'people', 'money', 'insight', 'account']

export const NAV_GROUP_LABEL: Record<NavGroup, string | null> = {
  main: null,
  field: 'Field work',
  people: 'People',
  money: 'Finance',
  insight: 'Insight',
  account: 'Account',
}

export interface NavItem {
  label: string
  href: string
  icon: NavIconKey
  group: NavGroup
}

const OVERVIEW: NavItem = { label: 'Overview', href: '/dashboard', icon: 'overview', group: 'main' }

/**
 * Per-role dashboard sidebars (Team Dashboard PRD). Each leadership role sees
 * only the modules its responsibility needs.
 */
const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  campus_lead: [
    OVERVIEW,
    { label: 'Schools', href: '/dashboard/schools', icon: 'schools', group: 'field' },
    { label: 'Evidence', href: '/dashboard/evidence', icon: 'evidence', group: 'field' },
    { label: 'Calendar', href: '/dashboard/calendar', icon: 'calendar', group: 'field' },
    { label: 'Volunteers', href: '/dashboard/volunteers', icon: 'volunteers', group: 'people' },
    { label: 'Finance Analysis', href: '/dashboard/reimbursements', icon: 'finance', group: 'money' },
    { label: 'Analytics', href: '/dashboard/analytics', icon: 'analytics', group: 'insight' },
    { label: 'Blogs', href: '/dashboard/blogs', icon: 'blogs', group: 'insight' },
    { label: 'Settings', href: '/dashboard/settings', icon: 'settings', group: 'account' },
  ],
  outreach_lead: [
    OVERVIEW,
    { label: 'Schools', href: '/dashboard/schools', icon: 'schools', group: 'field' },
    { label: 'Outreach Forms', href: '/dashboard/schools/new', icon: 'outreach', group: 'field' },
    { label: 'Approval Letters', href: '/dashboard/approval-letters', icon: 'reports', group: 'field' },
    { label: 'Calendar', href: '/dashboard/calendar', icon: 'calendar', group: 'field' },
    { label: 'Blogs', href: '/dashboard/blogs', icon: 'blogs', group: 'insight' },
  ],
  volunteer_lead: [
    OVERVIEW,
    { label: 'Schools', href: '/dashboard/schools', icon: 'schools', group: 'field' },
    { label: 'Calendar', href: '/dashboard/calendar', icon: 'calendar', group: 'field' },
    { label: 'Volunteers', href: '/dashboard/volunteers', icon: 'volunteers', group: 'people' },
    { label: 'Assignments', href: '/dashboard/assignments', icon: 'assignments', group: 'people' },
    { label: 'Availability', href: '/dashboard/availability', icon: 'availability', group: 'people' },
    { label: 'Attendance', href: '/dashboard/attendance', icon: 'attendance', group: 'people' },
    { label: 'Certificates', href: '/dashboard/certificates', icon: 'certificates', group: 'people' },
    { label: 'Blogs', href: '/dashboard/blogs', icon: 'blogs', group: 'insight' },
  ],
  exec_lead: [
    OVERVIEW,
    { label: 'Schools', href: '/dashboard/schools', icon: 'schools', group: 'field' },
    { label: 'Evidence', href: '/dashboard/evidence', icon: 'evidence', group: 'field' },
    { label: 'Calendar', href: '/dashboard/calendar', icon: 'calendar', group: 'field' },
    { label: 'Reports', href: '/dashboard/reports', icon: 'reports', group: 'insight' },
    { label: 'Blogs', href: '/dashboard/blogs', icon: 'blogs', group: 'insight' },
  ],
  volunteer: [
    OVERVIEW,
    { label: 'My Assignments', href: '/dashboard/assignments', icon: 'assignments', group: 'field' },
    { label: 'Availability', href: '/dashboard/availability', icon: 'availability', group: 'field' },
    { label: 'Attendance', href: '/dashboard/attendance', icon: 'attendance', group: 'field' },
    { label: 'Evidence', href: '/dashboard/evidence', icon: 'evidence', group: 'field' },
    { label: 'Certificates', href: '/dashboard/certificates', icon: 'certificates', group: 'insight' },
    { label: 'Blogs', href: '/dashboard/blogs', icon: 'blogs', group: 'insight' },
    { label: 'Profile', href: '/dashboard/profile', icon: 'profile', group: 'account' },
  ],
  super_admin: [
    OVERVIEW,
    { label: 'Admin Panel', href: '/admin', icon: 'settings', group: 'main' },
    { label: 'Schools', href: '/dashboard/schools', icon: 'schools', group: 'field' },
    { label: 'Evidence', href: '/dashboard/evidence', icon: 'evidence', group: 'field' },
    { label: 'Calendar', href: '/dashboard/calendar', icon: 'calendar', group: 'field' },
    { label: 'Volunteers', href: '/dashboard/volunteers', icon: 'volunteers', group: 'people' },
    { label: 'Assignments', href: '/dashboard/assignments', icon: 'assignments', group: 'people' },
    { label: 'Attendance', href: '/dashboard/attendance', icon: 'attendance', group: 'people' },
    { label: 'Finance', href: '/dashboard/reimbursements', icon: 'finance', group: 'money' },
    { label: 'Analytics', href: '/dashboard/analytics', icon: 'analytics', group: 'insight' },
    { label: 'Blogs', href: '/dashboard/blogs', icon: 'blogs', group: 'insight' },
    { label: 'Settings', href: '/dashboard/settings', icon: 'settings', group: 'account' },
  ],
  // Campus-scoped monitoring roles (Operational Workflow Spec v2.0). Finance
  // Lead and Campus Management Admin's real screens landed in Phase 5.
  campus_mgmt_admin: [
    OVERVIEW,
    { label: 'Schools', href: '/dashboard/schools', icon: 'schools', group: 'field' },
    { label: 'Finance', href: '/dashboard/finance', icon: 'finance', group: 'money' },
    { label: 'Analytics', href: '/dashboard/analytics', icon: 'analytics', group: 'insight' },
  ],
  finance_lead: [
    OVERVIEW,
    { label: 'Schools', href: '/dashboard/schools', icon: 'schools', group: 'field' },
    { label: 'Reimbursements', href: '/dashboard/reimbursements', icon: 'reimbursements', group: 'money' },
    { label: 'Campus Finance', href: '/dashboard/finance', icon: 'finance', group: 'money' },
  ],
}

/** Admin panel nav (PRD §7.9 / §8). */
const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'overview', group: 'main' },
  { label: 'Overview', href: '/admin', icon: 'overview', group: 'main' },
  { label: 'Campuses', href: '/admin/campuses', icon: 'campuses', group: 'field' },
  { label: 'Schools', href: '/admin/schools', icon: 'schools', group: 'field' },
  { label: 'Evidence', href: '/admin/evidence', icon: 'evidence', group: 'field' },
  { label: 'Volunteers', href: '/admin/volunteers', icon: 'volunteers', group: 'people' },
  { label: 'Finance', href: '/admin/finance', icon: 'finance', group: 'money' },
  { label: 'Reports', href: '/admin/reports', icon: 'reports', group: 'insight' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'analytics', group: 'insight' },
  { label: 'Content', href: '/admin/content', icon: 'content', group: 'insight' },
  { label: 'Settings', href: '/admin/settings', icon: 'settings', group: 'account' },
]

/**
 * Bucket a role's items by section, preserving the order both of NAV_GROUP_ORDER
 * and of the items within each group. Empty groups are dropped so a role with no
 * finance screens never renders an orphaned "Finance" heading.
 */
export function groupNav(items: NavItem[]): { group: NavGroup; label: string | null; items: NavItem[] }[] {
  return NAV_GROUP_ORDER.map((group) => ({
    group,
    label: NAV_GROUP_LABEL[group],
    items: items.filter((item) => item.group === group),
  })).filter((section) => section.items.length > 0)
}

export function dashboardNav(role: UserRole): NavItem[] {
  const items = NAV_BY_ROLE[role]?.length ? NAV_BY_ROLE[role] : NAV_BY_ROLE.campus_lead
  // Defence-in-depth: never surface a route the role can't actually open.
  return items.filter((i) => isAdmin(role) || canAccessPath(role, i.href))
}

export function adminNav(role: UserRole): NavItem[] {
  return ADMIN_NAV.filter((i) => canAccessPath(role, i.href))
}