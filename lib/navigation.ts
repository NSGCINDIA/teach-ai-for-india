import {
  LayoutDashboard, CalendarDays, School, ClipboardCheck, Receipt, Images, Bell,
  Building2, Users, Wallet, FileBarChart, BarChart3, FileText, Settings, type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/types/database'
import { canAccessPath } from '@/lib/auth/rbac'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** Built in a later phase — rendered disabled so the IA is visible. */
  soon?: boolean
}

/** Team dashboard nav (PRD §8 IA). Filtered per role via canAccessPath. */
const DASHBOARD_NAV: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Sessions', href: '/dashboard/sessions', icon: CalendarDays },
  { label: 'My Schools', href: '/dashboard/schools', icon: School },
  { label: 'Attendance', href: '/dashboard/attendance', icon: ClipboardCheck, soon: true },
  { label: 'Reimbursements', href: '/dashboard/reimbursements', icon: Receipt },
  { label: 'Evidence', href: '/dashboard/evidence', icon: Images },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell, soon: true },
]

/** Admin panel nav (PRD §7.9 / §8). */
const ADMIN_NAV: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Campuses', href: '/admin/campuses', icon: Building2, soon: true },
  { label: 'Schools', href: '/admin/schools', icon: School },
  { label: 'Sessions', href: '/admin/sessions', icon: CalendarDays },
  { label: 'Volunteers', href: '/admin/volunteers', icon: Users, soon: true },
  { label: 'Finance', href: '/admin/finance', icon: Wallet },
  { label: 'Evidence', href: '/admin/evidence', icon: Images },
  { label: 'Reports', href: '/admin/reports', icon: FileBarChart, soon: true },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, soon: true },
  { label: 'Content', href: '/admin/content', icon: FileText, soon: true },
  { label: 'Settings', href: '/admin/settings', icon: Settings, soon: true },
]

export function dashboardNav(role: UserRole): NavItem[] {
  return DASHBOARD_NAV.filter((i) => canAccessPath(role, i.href))
}

export function adminNav(role: UserRole): NavItem[] {
  return ADMIN_NAV.filter((i) => canAccessPath(role, i.href))
}
