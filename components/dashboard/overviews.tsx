import Link from 'next/link'
import {
  School, Users, GraduationCap, CalendarDays, CalendarClock, FileClock, Wallet,
  Images, ClipboardList, TrendingUp, CheckCircle2, MapPin, Percent, Timer,
  type LucideIcon,
} from 'lucide-react'
import { MetricCard } from '@/components/shared/metric-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/states'
import { Card } from '@/components/ui/card'
import { formatDate, formatCurrency, formatNumber } from '@/lib/format'
import { SCHOOL_STATUS_META } from '@/lib/constants/status'
import type {
  CampusLeadData, OutreachData, VolunteerLeadData, ExecData, VolunteerData,
  SessionLite, SchoolLite,
} from '@/lib/data/dashboard'

// ─── Shared pieces ────────────────────────────────────────────────────────────
function Widget({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold">{title}</h2>
        {href && <Link href={href} className="text-xs font-medium text-brand hover:underline">View all</Link>}
      </div>
      {children}
    </Card>
  )
}

function SessionRows({ sessions, empty }: { sessions: SessionLite[]; empty: string }) {
  if (sessions.length === 0) return <p className="py-4 text-center text-sm text-muted-foreground">{empty}</p>
  return (
    <ul className="divide-y divide-border">
      {sessions.map((s) => (
        <li key={s.id}>
          <Link href={`/dashboard/sessions/${s.id}`} className="flex items-center gap-3 py-2.5 hover:opacity-80">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{s.topic}</p>
              <p className="truncate text-xs text-muted-foreground">
                {s.school_name} · {formatDate(s.date)}{s.start_time ? ` · ${s.start_time.slice(0, 5)}` : ''}
              </p>
            </div>
            <StatusBadge kind="session" status={s.status} />
          </Link>
        </li>
      ))}
    </ul>
  )
}

function SchoolRows({ schools, empty }: { schools: SchoolLite[]; empty: string }) {
  if (schools.length === 0) return <p className="py-4 text-center text-sm text-muted-foreground">{empty}</p>
  return (
    <ul className="divide-y divide-border">
      {schools.map((s) => (
        <li key={s.id}>
          <Link href={`/dashboard/schools/${s.id}`} className="flex items-center gap-3 py-2.5 hover:opacity-80">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{s.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {s.district}{s.next_action_date ? ` · next: ${formatDate(s.next_action_date)}` : ''}
              </p>
            </div>
            <StatusBadge kind="school" status={s.status} />
          </Link>
        </li>
      ))}
    </ul>
  )
}

function OverviewHeader({ name, role }: { name: string; role: string }) {
  return (
    <header>
      <p className="text-sm text-muted-foreground">{role}</p>
      <h1 className="font-display text-2xl font-bold tracking-tight">Welcome back, {name} 👋</h1>
    </header>
  )
}

function Kpi({ label, value, icon }: { label: string; value: string | number; icon: LucideIcon }) {
  return <MetricCard label={label} value={value} icon={icon} />
}

// ─── Campus Lead ────────────────────────────────────────────────────────────
export function CampusLeadOverview({ name, data }: { name: string; data: CampusLeadData }) {
  const k = data.kpis
  return (
    <div className="space-y-6">
      <OverviewHeader name={name} role="Campus Lead" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Schools Active" value={formatNumber(k.schoolsActive)} icon={School} />
        <Kpi label="Students Impacted" value={formatNumber(k.studentsImpacted)} icon={GraduationCap} />
        <Kpi label="Sessions Completed" value={formatNumber(k.sessionsCompleted)} icon={CheckCircle2} />
        <Kpi label="Upcoming Sessions" value={formatNumber(k.upcomingSessions)} icon={CalendarClock} />
        <Kpi label="Volunteers Active" value={formatNumber(k.volunteersActive)} icon={Users} />
        <Kpi label="Pending Reports" value={formatNumber(k.pendingReports)} icon={FileClock} />
        <Kpi label="Pending Payments" value={formatNumber(k.pendingPayments)} icon={Wallet} />
        <Kpi label="Evidence Uploaded" value={formatNumber(k.evidenceUploaded)} icon={Images} />
      </div>

      <QuickActions />

      <div className="grid gap-4 lg:grid-cols-2">
        <Widget title="Today's Sessions" href="/dashboard/sessions">
          <SessionRows sessions={data.todaySessions} empty="No sessions scheduled today." />
        </Widget>
        <Widget title="Upcoming Sessions" href="/dashboard/sessions">
          <SessionRows sessions={data.upcomingSessions} empty="Nothing upcoming yet." />
        </Widget>
        <Widget title="Pending School Approvals" href="/dashboard/schools">
          <SchoolRows schools={data.pendingApprovals} empty="No schools awaiting approval." />
        </Widget>
        <Widget title="Pending Reports" href="/dashboard/sessions">
          <SessionRows sessions={data.pendingReports} empty="All reports are in. 🎉" />
        </Widget>
        <Widget title="Pending Reimbursements" href="/dashboard/reimbursements">
          {data.pendingReimbursements.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No claims awaiting review.</p>
          ) : (
            <ul className="divide-y divide-border">
              {data.pendingReimbursements.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.claimant_name}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.reference_number}</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{formatCurrency(r.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Widget>
      </div>
    </div>
  )
}

function QuickActions() {
  const actions = [
    { label: 'View Schools', href: '/dashboard/schools', icon: School },
    { label: 'View Planned Sessions', href: '/dashboard/sessions', icon: CalendarDays },
    { label: 'View Evidence', href: '/dashboard/evidence', icon: Images },
    { label: 'View Attendance', href: '/dashboard/attendance', icon: ClipboardList },
  ]
  return (
    <Card className="p-5">
      <h2 className="mb-3 font-display text-sm font-semibold">Quick Actions</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((a) => (
          <Link key={a.href} href={a.href}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium transition-colors hover:border-brand hover:bg-accent">
            <span className="grid size-8 place-items-center rounded-md bg-brand/10 text-brand"><a.icon className="size-4" /></span>
            {a.label}
          </Link>
        ))}
      </div>
    </Card>
  )
}

// ─── Outreach Lead ──────────────────────────────────────────────────────────
export function OutreachOverview({ name, data }: { name: string; data: OutreachData }) {
  const k = data.kpis
  const maxCount = Math.max(1, ...data.pipeline.map((p) => p.count))
  return (
    <div className="space-y-6">
      <OverviewHeader name={name} role="Outreach Lead" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total Schools" value={formatNumber(k.totalSchools)} icon={School} />
        <Kpi label="Active Leads" value={formatNumber(k.leads)} icon={TrendingUp} />
        <Kpi label="Approved" value={formatNumber(k.approved)} icon={CheckCircle2} />
        <Kpi label="Sessions Scheduled" value={formatNumber(k.sessionsScheduled)} icon={CalendarClock} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Widget title="School Pipeline" href="/dashboard/schools">
          <ul className="space-y-2">
            {data.pipeline.map((p) => (
              <li key={p.status} className="flex items-center gap-3">
                <span className="w-36 shrink-0 text-xs text-muted-foreground">{SCHOOL_STATUS_META[p.status].label}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${(p.count / maxCount) * 100}%` }} />
                </span>
                <span className="w-8 text-right text-sm font-semibold tabular-nums">{p.count}</span>
              </li>
            ))}
          </ul>
        </Widget>
        <Widget title="Schools Awaiting Follow-up" href="/dashboard/schools">
          <SchoolRows schools={data.awaitingFollowup} empty="Nothing waiting on you. 🎉" />
        </Widget>
        <Widget title="Upcoming Visits" href="/dashboard/schools">
          <SchoolRows schools={data.upcomingVisits} empty="No visits scheduled." />
        </Widget>
        <Widget title="Recently Added Schools" href="/dashboard/schools">
          <SchoolRows schools={data.recentlyAdded} empty="No schools yet — add your first." />
        </Widget>
      </div>
    </div>
  )
}

// ─── Volunteer Lead ─────────────────────────────────────────────────────────
export function VolunteerLeadOverview({ name, data }: { name: string; data: VolunteerLeadData }) {
  const k = data.kpis
  return (
    <div className="space-y-6">
      <OverviewHeader name={name} role="Volunteer Lead" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Volunteers Available" value={formatNumber(k.volunteersAvailable)} icon={Users} />
        <Kpi label="Upcoming Sessions" value={formatNumber(k.upcomingSessions)} icon={CalendarClock} />
        <Kpi label="Attendance Rate" value={`${k.attendanceRate}%`} icon={Percent} />
        <Kpi label="Sessions This Month" value={formatNumber(k.sessionsThisMonth)} icon={CheckCircle2} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Widget title="Upcoming Sessions — need volunteers" href="/dashboard/sessions">
          <SessionRows sessions={data.upcomingSessions} empty="No upcoming sessions to staff." />
        </Widget>
        <Widget title="Attendance Summary">
          <div className="flex items-center gap-6 py-2">
            <div>
              <p className="font-display text-3xl font-bold tabular-nums">{data.attendance.present}</p>
              <p className="text-xs text-muted-foreground">Present marks</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold tabular-nums">{data.attendance.total}</p>
              <p className="text-xs text-muted-foreground">Total marks</p>
            </div>
            <div className="ml-auto text-right">
              <p className="font-display text-3xl font-bold tabular-nums text-brand">{k.attendanceRate}%</p>
              <p className="text-xs text-muted-foreground">Rate</p>
            </div>
          </div>
        </Widget>
      </div>

      <Card className="flex items-start gap-4 border-brand/20 bg-brand/5 p-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand text-primary-foreground"><Users className="size-5" /></span>
        <div>
          <h2 className="font-display font-semibold">Volunteer assignment is coming next</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Volunteer requests, per-session assignment, and accept/decline confirmations land in the next phase.
            Your available-volunteer count and attendance are already live above.
          </p>
        </div>
      </Card>
    </div>
  )
}

// ─── Execution Lead ─────────────────────────────────────────────────────────
export function ExecOverview({ name, data }: { name: string; data: ExecData }) {
  const k = data.kpis
  return (
    <div className="space-y-6">
      <OverviewHeader name={name} role="Execution Lead" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Today's Sessions" value={formatNumber(k.todayCount)} icon={CalendarDays} />
        <Kpi label="Upcoming Sessions" value={formatNumber(k.upcomingCount)} icon={CalendarClock} />
        <Kpi label="Pending Reports" value={formatNumber(k.pendingReports)} icon={FileClock} />
        <Kpi label="My Transport Claims" value={formatNumber(k.myClaims)} icon={Wallet} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Widget title="Today's Sessions" href="/dashboard/sessions">
          <SessionRows sessions={data.todaySessions} empty="No sessions today." />
        </Widget>
        <Widget title="Pending Reports" href="/dashboard/sessions">
          <SessionRows sessions={data.pendingReports} empty="No reports pending. 🎉" />
        </Widget>
        <Widget title="Upcoming Sessions" href="/dashboard/sessions">
          <SessionRows sessions={data.upcomingSessions} empty="Nothing upcoming." />
        </Widget>
        <Widget title="Quick Links">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Attendance', href: '/dashboard/attendance', icon: ClipboardList },
              { label: 'Evidence', href: '/dashboard/evidence', icon: Images },
              { label: 'Reimbursements', href: '/dashboard/reimbursements', icon: Wallet },
              { label: 'All Sessions', href: '/dashboard/sessions', icon: CalendarDays },
            ].map((a) => (
              <Link key={a.href} href={a.href}
                className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm font-medium hover:border-brand hover:bg-accent">
                <span className="grid size-8 place-items-center rounded-md bg-brand/10 text-brand"><a.icon className="size-4" /></span>
                {a.label}
              </Link>
            ))}
          </div>
        </Widget>
      </div>
    </div>
  )
}

// ─── Volunteer ──────────────────────────────────────────────────────────────
export function VolunteerOverview({ name, data }: { name: string; data: VolunteerData }) {
  const k = data.kpis
  return (
    <div className="space-y-6">
      <OverviewHeader name={name} role="Volunteer" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Upcoming Sessions" value={formatNumber(k.upcomingCount)} icon={CalendarClock} />
        <Kpi label="Sessions Attended" value={formatNumber(k.pastSessions)} icon={CheckCircle2} />
        <Kpi label="Hours Contributed" value={formatNumber(k.hoursContributed)} icon={Timer} />
        <Kpi label="My Claims" value={formatNumber(k.myClaims)} icon={Wallet} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Widget title="Upcoming Sessions" href="/dashboard/sessions">
          <SessionRows sessions={data.upcomingSessions} empty="No assigned sessions yet — your Volunteer Lead will assign you soon." />
        </Widget>
        <Widget title="Your shortcuts">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'My Sessions', href: '/dashboard/sessions', icon: CalendarDays },
              { label: 'My Attendance', href: '/dashboard/attendance', icon: ClipboardList },
              { label: 'My Evidence', href: '/dashboard/evidence', icon: Images },
              { label: 'My Claims', href: '/dashboard/reimbursements', icon: Wallet },
            ].map((a) => (
              <Link key={a.href} href={a.href}
                className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm font-medium hover:border-brand hover:bg-accent">
                <span className="grid size-8 place-items-center rounded-md bg-brand/10 text-brand"><a.icon className="size-4" /></span>
                {a.label}
              </Link>
            ))}
          </div>
        </Widget>
      </div>
    </div>
  )
}

// ─── Fallback (admins / no campus) ──────────────────────────────────────────
export function NoCampusOverview({ name, role }: { name: string; role: string }) {
  return (
    <div className="space-y-6">
      <OverviewHeader name={name} role={role} />
      <EmptyState
        icon={MapPin}
        title="No campus assigned"
        description="Your account isn't linked to a campus yet, so there's nothing to show here. Ask an admin to assign your campus."
      />
    </div>
  )
}
