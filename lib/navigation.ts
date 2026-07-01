import type { UserRole } from '@/types/database'
import { canAccessPath } from '@/lib/auth/rbac'

/**
 * Icon keys — nav is built on the server and passed to a Client Component, so
 * we send serializable string keys instead of Lucide components. The client
 * shell resolves each key to its icon via NAV_ICONS.
 */
export type NavIconKey =
  | 'overview' | 'sessions' | 'schools' | 'attendance' | 'reimbursements'
  | 'evidence' | 'notifications' | 'campuses' | 'volunteers' | 'finance'
  | 'reports' | 'analytics' | 'content' | 'settings'

export interface NavItem {
  label: string
  href: string
  icon: NavIconKey
  /** Built in a later phase — rendered disabled so the IA is visible. */
  soon?: boolean
}

/** Team dashboard nav (PRD §8 IA). Filtered per role via canAccessPath. */
const DASHBOARD_NAV: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: 'overview' },
  { label: 'My Sessions', href: '/dashboard/sessions', icon: 'sessions' },
  { label: 'My Schools', href: '/dashboard/schools', icon: 'schools' },
  { label: 'Attendance', href: '/dashboard/attendance', icon: 'attendance' },
  { label: 'Reimbursements', href: '/dashboard/reimbursements', icon: 'reimbursements' },
  { label: 'Evidence', href: '/dashboard/evidence', icon: 'evidence' },
  { label: 'Notifications', href: '/dashboard/notifications', icon: 'notifications' },
]

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
  return DASHBOARD_NAV.filter((i) => canAccessPath(role, i.href))
}

export function adminNav(role: UserRole): NavItem[] {
  return ADMIN_NAV.filter((i) => canAccessPath(role, i.href))
}
