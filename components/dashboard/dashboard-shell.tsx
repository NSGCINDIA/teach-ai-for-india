'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu, PanelLeftClose, PanelLeftOpen, LogOut, UserCircle as UserCircleIcon,
  LayoutDashboard, CalendarDays, School, ClipboardCheck, Receipt, Images,
  Building2, Users, Wallet, FileBarChart, BarChart3, FileText, Settings,
  CalendarRange, UserRoundCheck, CalendarClock, Award, ClipboardList, UserCircle,
  BookOpen, ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { roleLabel } from '@/lib/auth/roles'
import { groupNav, type NavItem, type NavIconKey } from '@/lib/navigation'
import type { UserRole } from '@/types/database'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { signOut } from '@/actions/auth'
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

const COLLAPSE_KEY = 'tai:sidebar-collapsed'

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

/**
 * DashboardShell — the frame every dashboard and admin screen renders inside.
 *
 * The chrome is deliberately quiet. A command centre is somewhere people sit for
 * an hour at a time, so the parts that never change (nav, app bar) stay low
 * contrast on the warm ground and let the record they came to read hold the
 * only strong colour on screen. Everything with a brand fill in here is either
 * the active route or a primary action — nothing else earns it.
 */
export function DashboardShell({ items, user, panelLabel, children }: DashboardShellProps) {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  // Read the stored preference after mount rather than during render: the server
  // has no localStorage, so seeding state from it directly would make the first
  // client render disagree with the HTML and React would throw out the tree.
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === '1')
    } catch {
      // Private mode / blocked storage — the default expanded rail is fine.
    }
    setHydrated(true)
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      } catch {
        // Preference just won't persist; the toggle still works this session.
      }
      return next
    })
  }

  // Until the stored preference is known, render expanded — matching the server.
  const isCollapsed = hydrated && collapsed

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-dvh bg-background">
        {/* Desktop rail */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border/60 bg-card lg:flex',
            'transition-[width] duration-200 ease-out motion-reduce:transition-none',
            isCollapsed ? 'w-[4.75rem]' : 'w-64',
          )}
        >
          <SidebarContent items={items} collapsed={isCollapsed} />
        </aside>

        <div
          className={cn(
            'transition-[padding] duration-200 ease-out motion-reduce:transition-none',
            isCollapsed ? 'lg:pl-[4.75rem]' : 'lg:pl-64',
          )}
        >
          <AppBar
            user={user}
            panelLabel={panelLabel}
            collapsed={isCollapsed}
            onToggleCollapsed={toggleCollapsed}
            mobileNav={
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open navigation">
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <SidebarContent items={items} collapsed={false} onNavigate={() => setOpen(false)} />
                </SheetContent>
              </Sheet>
            }
          />

          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}

/**
 * AppBar — a slim, persistent home for identity and account actions.
 *
 * `glass-warm` rather than a solid fill: content scrolling underneath stays
 * faintly visible, which keeps the bar reading as a layer over the page instead
 * of a lid on top of it. It carries no page title — PageHeader owns that, and
 * duplicating it would give every screen two competing h1s.
 */
function AppBar({
  user, panelLabel, collapsed, onToggleCollapsed, mobileNav,
}: {
  user: ShellUser
  panelLabel: string
  collapsed: boolean
  onToggleCollapsed: () => void
  mobileNav: ReactNode
}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border/60 glass-warm px-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <div className="lg:hidden">{mobileNav}</div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapsed}
              aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
              aria-pressed={collapsed}
              className="hidden lg:inline-flex"
            >
              {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {collapsed ? 'Expand navigation' : 'Collapse navigation'}
          </TooltipContent>
        </Tooltip>

        <Link href="/" className="inline-flex items-center lg:hidden">
          <BrandLogo size="sm" />
        </Link>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden rounded-full border border-brand/15 bg-brand/8 px-2.5 py-1 text-[11px] font-bold text-brand sm:inline">
          {panelLabel}
        </span>
        <UserMenu user={user} />
      </div>
    </header>
  )
}

function UserMenu({ user }: { user: ShellUser }) {
  // The confirm dialog is a sibling of the menu, not a child of it. Selecting a
  // menu item closes the menu and unmounts its contents, so a Dialog trigger
  // nested inside would be torn down in the same tick it was activated and the
  // dialog would never appear. Lifting the open state here keeps both working.
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-cream-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
        >
          <Avatar className="size-8">
            <AvatarImage src={user.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="bg-gradient-to-br from-brand to-brand-orange text-xs font-bold text-white">
              {user.full_name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-32 truncate text-sm font-semibold text-foreground sm:block">
            {user.full_name.split(' ')[0]}
          </span>
          <ChevronDown aria-hidden className="size-3.5 text-text-tertiary" />
          <span className="sr-only">Account menu for {user.full_name}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-bold text-foreground">{user.full_name}</p>
          <p className="truncate text-xs font-medium text-muted-foreground">{user.email}</p>
          <p className="mt-1 text-xs font-semibold text-brand-orange">{roleLabel(user.role)}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile" className="cursor-pointer">
            <UserCircleIcon className="size-4" />
            Your profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="cursor-pointer">
            <Settings className="size-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => setConfirmSignOut(true)}
          className="cursor-pointer text-error focus:bg-error/10 focus:text-error"
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <Dialog open={confirmSignOut} onOpenChange={setConfirmSignOut}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Sign out?</DialogTitle>
          <DialogDescription>
            You'll need to log in again to get back into your dashboard.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Stay signed in</Button>
          </DialogClose>
          <form action={signOut}>
            <Button type="submit">Sign out</Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}

function SidebarContent({
  items, collapsed, onNavigate,
}: {
  items: NavItem[]
  collapsed: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const sections = groupNav(items)

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Brand */}
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b border-border/60',
          collapsed ? 'justify-center px-2' : 'gap-2 px-5',
        )}
      >
        <Link href="/" className="inline-flex min-w-0 items-center" aria-label="Teach AI For India home">
          {collapsed ? (
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-deep to-brand text-sm font-black text-white">
              AI
            </span>
          ) : (
            <BrandLogo size="sm" />
          )}
        </Link>
        {/* The panel badge lives in the app bar, not here — it was rendering in
            both, and the app bar keeps it visible when this rail is collapsed. */}
      </div>

      {/* Navigation */}
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section, index) => (
          <div key={section.group} className={cn(index > 0 && 'mt-5')}>
            {section.label &&
              (collapsed ? (
                // A heading would not fit the rail; a hairline still says
                // "new group starts here", which is the part that matters.
                <div className="mx-auto mb-2 h-px w-6 bg-border" role="presentation" />
              ) : (
                <h2 className="mb-1.5 px-3 text-[11px] font-bold tracking-wider text-text-tertiary">
                  {section.label}
                </h2>
              ))}

            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <NavLink
                    item={item}
                    active={pathname === item.href}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Mission footer — the reason the rest of this screen exists. */}
      {!collapsed && (
        <div className="shrink-0 border-t border-border/60 px-5 py-4">
          <p className="text-[11px] font-semibold leading-relaxed text-text-tertiary">
            <span className="text-brand-orange">Students teaching students.</span>
            <br />
            AI education for every child.
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * A nav row, not a button. The inactive state carries no fill and no border at
 * all, so a sidebar of eleven routes reads as a list of eleven words rather than
 * eleven competing controls; only the current route gets a surface.
 *
 * The active treatment is a warm plate plus a maroon-to-orange rail flush with
 * the sidebar's own edge — the brand gradient used structurally, as a position
 * marker, rather than as decoration applied on top of a filled pill.
 */
function NavLink({
  item, active, collapsed, onNavigate,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
  onNavigate?: () => void
}) {
  const Icon = NAV_ICONS[item.icon]

  const body = (
    <>
      {active && (
        <span
          aria-hidden
          className="absolute inset-y-1.5 -left-3 w-[3px] rounded-r-full bg-gradient-to-b from-brand to-brand-orange"
        />
      )}
      <Icon
        aria-hidden
        className={cn(
          'size-[18px] shrink-0 transition-colors',
          active ? 'text-brand' : 'text-text-tertiary group-hover:text-brand',
        )}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </>
  )

  const shape = cn(
    'group relative flex items-center rounded-lg text-sm transition-colors',
    collapsed ? 'h-10 justify-center px-0' : 'gap-3 px-3 py-2',
    active
      ? 'bg-brand/8 font-bold text-brand'
      : 'font-medium text-text-secondary hover:bg-cream-light hover:text-brand',
  )

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(shape, 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50')}
    >
      {body}
      {collapsed && <span className="sr-only">{item.label}</span>}
    </Link>
  )

  return collapsed ? withTooltip(link, item.label) : link
}

/** In the collapsed rail the label is the only thing identifying an icon. */
function withTooltip(trigger: ReactNode, label: string) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}
