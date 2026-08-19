'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  LayoutDashboard, CalendarDays, School, ClipboardCheck, Receipt, Images,
  Building2, Users, Wallet, FileBarChart, BarChart3, FileText, Settings,
  CalendarRange, UserRoundCheck, CalendarClock, Award, ClipboardList, UserCircle,
  Megaphone, BookOpen, ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { roleLabel } from '@/lib/auth/roles'
import type { NavItem, NavIconKey } from '@/lib/navigation'
import type { UserRole } from '@/types/database'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { SignOutButton } from '@/components/dashboard/sign-out-button'
import { BrandLogo } from '@/components/ui/brand-logo'

/** Resolves serializable nav icon keys (from the server) to Lucide components. */
const NAV_ICONS: Record<NavIconKey, LucideIcon> = {
  overview: LayoutDashboard,
  sessions: CalendarDays,
  schools: School,
  attendance: ClipboardCheck,
  reimbursements: Receipt,
  evidence: Images,
  campuses: Building2,
  volunteers: Users,
  finance: Wallet,
  reports: FileBarChart,
  analytics: BarChart3,
  content: FileText,
  settings: Settings,
  calendar: CalendarRange,
  assignments: UserRoundCheck,
  availability: CalendarClock,
  certificates: Award,
  outreach: ClipboardList,
  profile: UserCircle,
  blogs: FileText,
  blog: BookOpen,
}

interface ShellUser {
  full_name: string
  email: string
  role: UserRole
  avatar_url: string | null
}

interface DashboardShellProps {
  items: NavItem[]
  user: ShellUser
  panelLabel: string
  children: ReactNode
}

export function DashboardShell({ items, user, panelLabel, children }: DashboardShellProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/50 bg-card lg:flex">
        <SidebarContent items={items} user={user} panelLabel={panelLabel} />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/50 bg-card px-4 py-3 lg:hidden shadow-sm">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarContent items={items} user={user} panelLabel={panelLabel} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link href="/" className="inline-flex items-center">
            <BrandLogo size="md" />
          </Link>
        </div>
        <span className="shrink-0 rounded-full bg-brand-orange/10 text-brand-orange px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-brand-orange/20">
          {panelLabel}
        </span>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  )
}

function SidebarContent({
  items, user, panelLabel, onNavigate,
}: {
  items: NavItem[]
  user: ShellUser
  panelLabel: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-cream-light/30 to-background">
      {/* Brand Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border/50 px-5 py-4 bg-card/50">
        <Link href="/" className="inline-flex items-center shrink-0">
          <BrandLogo size="sm" />
        </Link>
        <span className="shrink-0 rounded-full bg-brand-orange/10 text-brand-orange px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider border border-brand-orange/20">
          {panelLabel}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const active = pathname === item.href
          const Icon = NAV_ICONS[item.icon]
          
          if (item.soon) {
            return (
              <span
                key={item.href}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground/50"
                title="Coming soon"
              >
                <Icon className="size-4" />
                <span className="flex-1">{item.label}</span>
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">Soon</span>
              </span>
            )
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 relative',
                active 
                  ? 'bg-brand text-primary-foreground shadow-sm' 
                  : 'text-foreground hover:bg-cream-light hover:text-brand',
              )}
              aria-current={active ? 'page' : undefined}
            >
              {/* Active indicator bar */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-orange rounded-r-full" />
              )}
              
              <Icon className={cn(
                "size-4 transition-colors",
                active ? "text-brand-orange" : "text-muted-foreground group-hover:text-brand"
              )} />
              <span className="flex-1">{item.label}</span>
              
              {active && (
                <ChevronRight className="size-4 text-brand-orange" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-border/50 p-3 bg-card/50">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 mb-2">
          <Avatar className="size-9 ring-2 ring-brand-orange/20">
            <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name} />
            <AvatarFallback className="bg-gradient-to-br from-brand-orange to-brand-gold text-white text-sm font-bold">
              {user.full_name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{user.full_name}</p>
            <p className="truncate text-xs text-muted-foreground font-medium">{roleLabel(user.role)}</p>
          </div>
        </div>
        <SignOutButton />
      </div>
    </div>
  )
}
