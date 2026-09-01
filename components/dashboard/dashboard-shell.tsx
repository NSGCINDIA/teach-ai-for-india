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
 * The chrome carries exactly one strong colour: the nav rail, solid at
 * --sidebar-surface (#B93F12) rather than tinted. Because it never changes and
 * is never the thing being read, a fixed saturated surface there works as an
 * anchor a command centre can sit inside for an hour at a time — the app bar
 * and every page underneath stay on the light, low-contrast ground so the
 * record someone came to read still holds the only colour that changes.
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
        {/* No border-r any more: a colour boundary against the white content
            area (luminance 0.15 vs 1.0) is already a stronger edge than any
            hairline could draw, and --border was tuned for a white-on-white
            seam that no longer exists here. A soft directional shadow instead,
            for a touch of depth rather than a flat cutout. */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-30 hidden flex-col bg-sidebar-surface shadow-[3px_0_16px_-4px_rgba(0,0,0,0.18)] lg:flex',
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
                {/* border-r-0: the Sheet's default border is a light-mode
                    hairline, and it would sit right on top of the colour
                    boundary the dark rail already draws against the overlay. */}
                <SheetContent side="left" className="w-72 border-r-0 p-0">
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
          <p className="mt-1 text-xs font-semibold text-ink-orange">{roleLabel(user.role)}</p>
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
            You&apos;ll need to log in again to get back into your dashboard.
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
    // --sidebar-surface, solid — see the token comment in globals.css. This is
    // a colour flip, not a tint: every foreground element below is a light
    // colour chosen and measured against this exact background, none of it
    // inherited from the rest of the (light-on-white) palette. Same background
    // whether this renders in the desktop rail or the mobile Sheet, since both
    // mount this component.
    <div className="flex h-full flex-col bg-sidebar-surface">
      {/* Brand. h-14, matching the app bar exactly, so the seam where the rail
          meets it reads as one line rather than a step. No hairline under this
          row any more — the gradient that used to sit here was measured for a
          white background and is invisible on this one (its darkest stop is
          barely 1.4:1 from this fill); a solid colour separates the header
          from the nav by being a colour, not by drawing a line under itself. */}
      <div
        className={cn(
          'flex h-14 shrink-0 items-center',
          collapsed ? 'justify-center px-2' : 'gap-2 px-5',
        )}
      >
        <Link href="/" className="inline-flex min-w-0 items-center" aria-label="Teach AI For India home">
          {collapsed ? (
            // Inverted to a white chip rather than the maroon-on-maroon plate
            // this used to be: a brand-coloured badge on a brand-coloured rail
            // would have measured 1.4-2.1:1 against its own background and all
            // but vanished. White reads as a crisp mark instead.
            <span className="grid size-9 place-items-center rounded-xl bg-white text-sm font-black text-brand-deep shadow-soft">
              AI
            </span>
          ) : (
            <BrandLogo size="md" lightOnly />
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
                // "new group starts here". White at low opacity, since it only
                // needs to be a visible mark on this background, not readable
                // text — WCAG's object-contrast floor (3:1), not text's (4.5:1).
                <div
                  aria-hidden
                  className="mx-auto mb-2 h-px w-6 bg-white/25"
                  role="presentation"
                />
              ) : (
                // Deliberately quieter than a nav label (white/65, 3.22:1)
                // rather than the muted-foreground token used for running text
                // (4.80:1): a section head is wayfinding, read once per glance,
                // not something scanned line by line — it should recede behind
                // the items it introduces, not compete with them.
                <h2 className="mb-1.5 px-3 text-[10px] font-semibold tracking-widest text-white/65">
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

      {/* Mission footer — the reason the rest of this screen exists. No top
          hairline for the same reason the header dropped its bottom one. */}
      {!collapsed && (
        <div className="shrink-0 px-5 py-4">
          <p className="text-[11px] font-semibold leading-relaxed text-sidebar-foreground-muted">
            <span className="text-white">By NIAT Students,</span>
            <br />
            for every classroom in India.
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * A nav row, not a button. Three distinct states, none of them borrowed from
 * another: DEFAULT is transparent with muted-white text and icon; HOVER is a
 * flat 10% white wash (`rgba(255,255,255,0.10)`, exactly) with both turning
 * full white; ACTIVE is its own solid fill — `--sidebar-surface-active`, a
 * genuinely darker surface, not a lighter wash of the rail's own colour — so
 * hovering a row can never be mistaken for the row that is actually current.
 *
 * Colour is chosen against the sidebar's own solid background rather than
 * inherited from the app's light-surface palette: `--sidebar-foreground(-muted)`
 * for the two text tiers (5.55:1 / 4.80:1, verified), plain white washes for
 * the hover fill and the icon plate, where the requirement is only to be
 * visibly lighter than the base, not to pass text contrast.
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
        // Flush with the row's own inner edge (not the rail's outer edge, as
        // before) and clipped by the row's overflow-hidden, so this reads
        // against --sidebar-surface-active rather than the plain rail colour
        // — see the indicator token's comment in globals.css for why that
        // distinction is what keeps a 3px mark actually visible.
        <span
          aria-hidden
          className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-sidebar-active-indicator"
        />
      )}
      {/* A fixed-size plate around every icon, not just active ones, so the row
          never shifts width when a route becomes current. Only the active
          plate gets a fill — a frosted white wash, the dark-surface analogue
          of the low-opacity brand-gradient chip this used on a white rail. The
          icon itself carries the hover micro-interaction: a 1px nudge, not a
          scale or a bounce — see the brief this implements. */}
      <span
        className={cn(
          'grid shrink-0 place-items-center rounded-md',
          collapsed ? 'size-8' : 'size-7',
          active && 'bg-white/15 ring-1 ring-white/25',
        )}
      >
        <Icon
          aria-hidden
          className={cn(
            'size-[18px] transition duration-200 ease-out group-hover:translate-x-px',
            active ? 'text-white' : 'text-white/65 group-hover:text-white',
          )}
        />
      </span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </>
  )

  const shape = cn(
    'group relative flex items-center overflow-hidden rounded-md text-sm transition-colors duration-150 ease-out',
    collapsed ? 'h-10 justify-center px-0' : 'gap-2.5 px-2 py-1.5',
    active
      ? 'bg-sidebar-surface-active font-bold text-white'
      : 'font-medium text-sidebar-foreground-muted hover:bg-white/10 hover:text-white',
  )

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(shape, 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar-surface')}
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
