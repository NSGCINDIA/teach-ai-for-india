'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu, Sparkles,
  LayoutDashboard, CalendarDays, School, ClipboardCheck, Receipt, Images, Bell,
  Building2, Users, Wallet, FileBarChart, BarChart3, FileText, Settings,
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
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { SignOutButton } from '@/components/dashboard/sign-out-button'

/** Resolves serializable nav icon keys (from the server) to Lucide components. */
const NAV_ICONS: Record<NavIconKey, LucideIcon> = {
  overview: LayoutDashboard,
  sessions: CalendarDays,
  schools: School,
  attendance: ClipboardCheck,
  reimbursements: Receipt,
  evidence: Images,
  notifications: Bell,
  campuses: Building2,
  volunteers: Users,
  finance: Wallet,
  reports: FileBarChart,
  analytics: BarChart3,
  content: FileText,
  settings: Settings,
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
    <div className="min-h-dvh bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <SidebarContent items={items} user={user} panelLabel={panelLabel} />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
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
        <Link href="/" className="inline-flex items-center gap-2 font-display font-bold">
          <Sparkles className="size-5 text-brand" /> Teach AI for India
        </Link>
        <ThemeToggle className="ml-auto" />
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
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <Link href="/" className="inline-flex items-center gap-2 font-display font-bold">
          <Sparkles className="size-5 text-brand" /> Teach AI
        </Link>
        <span className="ml-auto rounded-md bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
          {panelLabel}
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {items.map((item) => {
          const active = pathname === item.href
          const Icon = NAV_ICONS[item.icon]
          if (item.soon) {
            return (
              <span
                key={item.href}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground/60"
                title="Coming soon"
              >
                <Icon className="size-4" />
                {item.label}
                <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase">Soon</span>
              </span>
            )
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active ? 'bg-brand text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="size-8">
            <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name} />
            <AvatarFallback>{user.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">{roleLabel(user.role)}</p>
          </div>
          <ThemeToggle />
        </div>
        <div className="mt-1">
          <SignOutButton />
        </div>
      </div>
    </div>
  )
}
