import Link from 'next/link'
import {
  School, Users, CalendarDays, CalendarClock, FileClock, Wallet,
  Images, ClipboardList, TrendingUp, CheckCircle2, MapPin, Timer,
  Wrench, Clock, Receipt, DollarSign, ArrowRight, Sparkles, Award,
  type LucideIcon,
} from 'lucide-react'
import { MetricCard } from '@/components/shared/metric-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState, CompactEmpty } from '@/components/shared/states'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BudgetRequestReviewList } from '@/components/dashboard/budget-request-review-list'
import { DashboardHero, SimpleHero, SectionHeader } from '@/components/dashboard/dashboard-hero'
import { QuickActions } from '@/components/shared/quick-actions'
import { NeuralNetworkBackground } from '@/components/shared/neural-network-background'
import { formatDate, formatCurrency, formatNumber } from '@/lib/format'
import { SCHOOL_STATUS_META } from '@/lib/constants/status'
import { curriculumStageLabel } from '@/lib/constants/sessions'
import type {
  CampusLeadData, OutreachData, VolunteerLeadData, ExecData, VolunteerData,
  FinanceLeadData, SessionLite, SchoolLite,
} from '@/lib/data/dashboard'

// ─── Shared internal components ───────────────────────────────────────────────

/** Panel widget with consistent header, warm border, clean internal padding */
function Widget({
  title,
  subtitle,
  href,
  hrefLabel = 'View all',
  children,
  className = '',
}: {
  title: string
  subtitle?: string
  href?: string
  hrefLabel?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-xl border border-border/50 bg-card shadow-soft ${className}`}>
      <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
        <div>
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground font-medium mt-0.5">{subtitle}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-deep transition-colors"
          >
            {hrefLabel}
            <ArrowRight className="size-3" />
          </Link>
        )}
      </div>
      <div className="px-5 pb-5">{children}</div>
    </div>
  )
}

/** Divider list of sessions with strong visual hierarchy */
function SessionRows({
  sessions,
  empty,
  emptySubtext,
}: {
  sessions: SessionLite[]
  empty: string
  emptySubtext?: string
}) {
  if (sessions.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm font-semibold text-foreground">{empty}</p>
        {emptySubtext && (
          <p className="text-xs text-muted-foreground mt-1">{emptySubtext}</p>
        )}
      </div>
    )
  }
  return (
    <ul className="divide-y divide-border/50">
      {sessions.map((s) => (
        <li key={s.id}>
          <Link
            href={`/dashboard/sessions/${s.id}`}
            className="group flex items-center gap-3 py-3 transition-opacity hover:opacity-80"
          >
            {/* Colour stripe */}
            <span className="w-1 h-8 rounded-full bg-brand-orange/40 shrink-0 group-hover:bg-brand-orange transition-colors" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{s.topic}</p>
              <p className="truncate text-xs text-muted-foreground font-medium">
                {s.school_name} · {formatDate(s.date)}
                {s.start_time ? ` · ${s.start_time.slice(0, 5)}` : ''}
              </p>
            </div>
            <StatusBadge kind="session" status={s.status} />
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** Divider list of schools */
function SchoolRows({
  schools,
  empty,
  emptySubtext,
}: {
  schools: SchoolLite[]
  empty: string
  emptySubtext?: string
}) {
  if (schools.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm font-semibold text-foreground">{empty}</p>
        {emptySubtext && (
          <p className="text-xs text-muted-foreground mt-1">{emptySubtext}</p>
        )}
      </div>
    )
  }
  return (
    <ul className="divide-y divide-border/50">
      {schools.map((s) => (
        <li key={s.id}>
          <Link
            href={`/dashboard/schools/${s.id}`}
            className="group flex items-center gap-3 py-3 transition-opacity hover:opacity-80"
          >
            <span className="w-1 h-8 rounded-full bg-brand/30 shrink-0 group-hover:bg-brand transition-colors" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{s.name}</p>
              <p className="truncate text-xs text-muted-foreground font-medium">
                {s.district}
                {s.next_action_date ? ` · Follow up ${formatDate(s.next_action_date)}` : ''}
              </p>
            </div>
            {s.latest_session_number ? (
              <span className="shrink-0 text-xs font-semibold text-brand-orange bg-brand-orange/10 rounded-full px-2.5 py-1 border border-brand-orange/20">
                Session {s.latest_session_number}
              </span>
            ) : (
              <StatusBadge kind="school" status={s.status} />
            )}
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** Reimbursement row */
function ReimbursementRows({
  items,
}: {
  items: { id: string; claimant_name: string; reference_number: string; amount: number }[]
}) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm font-semibold text-foreground">All clear! 🎉</p>
        <p className="text-xs text-muted-foreground mt-1">No claims awaiting review.</p>
      </div>
    )
  }
  return (
    <ul className="divide-y divide-border/50">
      {items.map((r) => (
        <li key={r.id} className="flex items-center gap-3 py-3">
          <span className="w-1 h-8 rounded-full bg-brand-gold/40 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{r.claimant_name}</p>
            <p className="truncate text-xs text-muted-foreground font-medium">{r.reference_number}</p>
          </div>
          <span className="text-sm font-bold tabular-nums text-brand-deep">{formatCurrency(r.amount)}</span>
        </li>
      ))}
    </ul>
  )
}

/** Reusable KPI shorthand */
function Kpi({ label, value, icon, variant }: {
  label: string
  value: string | number
  icon: LucideIcon
  variant?: 'default' | 'highlight'
}) {
  return <MetricCard label={label} value={value} icon={icon} variant={variant} />
}

/** Inline action link styled consistently */
function ViewAllLink({ href, label = 'View all' }: { href: string; label?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-deep transition-colors">
      {label} <ArrowRight className="size-3" />
    </Link>
  )
}

/** Work-queue card used by Volunteer Lead, Exec Lead, Finance Lead */
function WorkQueueCard({
  title,
  subtitle,
  icon: Icon,
  href,
  hrefLabel,
  children,
  emptyMessage,
  empty,
}: {
  title: string
  subtitle?: string
  icon: LucideIcon
  href: string
  hrefLabel: string
  children?: React.ReactNode
  emptyMessage?: string
  empty: boolean
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-soft overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b border-border/50 bg-cream-light/40">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-brand/10 text-brand shrink-0">
            <Icon className="size-5" />
          </span>
          <div>
            <h3 className="font-bold text-base text-foreground">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground font-medium mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <Link href={href} className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-deep transition-colors mt-1">
          {hrefLabel} <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Body */}
      <div className="p-5">
        {empty ? (
          <div className="py-8 text-center">
            <div className="grid size-12 place-items-center rounded-xl bg-success/10 text-success mx-auto mb-3">
              <CheckCircle2 className="size-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

/** School-team card for Volunteer Lead + Exec Lead work queues */
function SchoolTeamCard({
  item,
  statusBadge,
  statsRow,
  actionHref,
  actionLabel,
  accentClass,
}: {
  item: any
  statusBadge: React.ReactNode
  statsRow: React.ReactNode
  actionHref: string
  actionLabel: string
  accentClass: string
}) {
  return (
    <div className={`p-4 rounded-xl border space-y-3 text-sm ${accentClass}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-bold text-base leading-tight">
            <Link href={actionHref} className="hover:underline text-brand">
              {item.name}
            </Link>
          </h4>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            {item.district} · {item.student_strength} students
          </p>
        </div>
        {statusBadge}
      </div>
      <div className="flex items-center justify-between border-t border-border/50 pt-2.5 text-xs text-muted-foreground font-medium">
        {statsRow}
      </div>
      <div className="flex justify-end">
        <Link href={actionHref} className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-1">
          {actionLabel} <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  )
}

// ─── Campus Lead ─────────────────────────────────────────────────────────────
export function CampusLeadOverview({
  name,
  data,
  canReviewBudgetRequests,
}: {
  name: string
  data: CampusLeadData
  canReviewBudgetRequests: boolean
}) {
  const k = data.kpis
  return (
    <div className="space-y-8 animate-fade-up">
      {/* Hero */}
      <DashboardHero
        greeting="Good to see you"
        userName={name}
        role="Campus Governance Lead"
        impact={[
          { label: 'Schools Reached', value: formatNumber(k.schoolsActive), icon: School },
          { label: 'Active Volunteers', value: formatNumber(k.volunteersActive), icon: Users },
          { label: 'Sessions This Week', value: formatNumber(k.sessionsScheduledThisWeek), icon: CalendarClock },
          { label: 'Needs Your Attention', value: formatNumber(k.pendingEvidenceReviews + k.schoolsAwaitingApproval + k.budgetRequestsPendingReview), icon: ClipboardList },
        ]}
      />

      {/* What Needs Your Attention */}
      <div className="space-y-4">
        <SectionHeader
          title="What Needs Your Attention"
          description="Review these items to keep the campus moving forward"
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Kpi label="Schools Awaiting Approval" value={formatNumber(k.schoolsAwaitingApproval)} icon={ClipboardList} />
          <Kpi label="Pending Evidence Reviews" value={formatNumber(k.pendingEvidenceReviews)} icon={Images} />
          <Kpi label="Budget Requests Pending" value={formatNumber(k.budgetRequestsPendingReview)} icon={Wallet} />
        </div>
      </div>

      {/* Queues — bento 2-col */}
      <div className="space-y-4">
        <SectionHeader title="What's Happening" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Widget
            title="Outreach Approvals"
            subtitle="Schools waiting on your review to proceed"
            href="/dashboard/schools"
          >
            <SchoolRows
              schools={data.pendingApprovals}
              empty="Nothing waiting on you right now."
              emptySubtext="All outreach approvals are up to date."
            />
          </Widget>

          <Widget
            title="Session Reports to Verify"
            subtitle="Reports submitted by your Execution Lead"
            href="/dashboard/sessions"
          >
            <SessionRows
              sessions={data.pendingReports}
              empty="All session reports are verified! 🎉"
            />
          </Widget>

          <Widget
            title="Extra Budget Requests"
            subtitle="Requests from your schools needing additional funding"
            href="/dashboard/finance"
          >
            <BudgetRequestReviewList
              requests={data.pendingBudgetRequests}
              canReview={canReviewBudgetRequests}
            />
          </Widget>

          {/* Quick navigate */}
          <Widget title="Navigate Your Campus">
            <QuickActions
              title=""
              actions={[
                { label: 'School Pipeline', description: "Track every school's journey", href: '/dashboard/schools', icon: School },
                { label: 'Session Oversight', description: 'Governance and session records', href: '/dashboard/sessions', icon: CalendarDays },
                { label: 'Evidence Gallery', description: 'Review photos and documentation', href: '/dashboard/evidence', icon: Images },
                { label: 'Campus Analytics', description: 'Measure your campus impact', href: '/dashboard/analytics', icon: TrendingUp },
              ]}
              columns={2}
            />
          </Widget>
        </div>
      </div>
    </div>
  )
}

// ─── Outreach Lead ────────────────────────────────────────────────────────────
export function OutreachOverview({ name, data }: { name: string; data: OutreachData }) {
  const k = data.kpis
  const maxCount = Math.max(1, ...data.pipeline.map((p) => p.count))
  return (
    <div className="space-y-8 animate-fade-up">
      <DashboardHero
        greeting="Good to see you"
        userName={name}
        role="Outreach Lead"
        impact={[
          { label: 'Schools Reached', value: formatNumber(k.totalSchools), icon: School, variant: 'highlight' } as any,
          { label: 'Active Leads', value: formatNumber(k.leads), icon: TrendingUp },
          { label: 'Registered', value: formatNumber(k.approved), icon: CheckCircle2 },
          { label: 'Sessions Active', value: formatNumber(k.sessionsScheduled), icon: CalendarClock },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* School Pipeline — visual progress bars */}
        <Widget
          title="School Pipeline"
          subtitle="Your school journey from lead to active"
          href="/dashboard/schools"
        >
          <ul className="space-y-3 mt-1">
            {data.pipeline.map((p) => (
              <li key={p.status} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm font-semibold text-foreground truncate">
                  {SCHOOL_STATUS_META[p.status].label}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream-light border border-border/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-brand-orange animate-progress"
                    style={{ width: `${(p.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-bold tabular-nums text-foreground">{p.count}</span>
              </li>
            ))}
          </ul>
        </Widget>

        <Widget
          title="Awaiting Your Action"
          subtitle="Schools pending outreach approval from you"
          href="/dashboard/schools"
        >
          <SchoolRows
            schools={data.awaitingFollowup}
            empty="Nothing waiting on you!"
            emptySubtext="All outreach follow-ups are done."
          />
        </Widget>

        <Widget
          title="Upcoming School Visits"
          subtitle="Scheduled visits coming up"
          href="/dashboard/schools"
        >
          <SchoolRows
            schools={data.upcomingVisits}
            empty="No visits scheduled yet."
            emptySubtext="Add your first school visit to get started."
          />
        </Widget>

        <Widget
          title="Recently Added Schools"
          subtitle="New schools added to the network"
          href="/dashboard/schools"
        >
          <SchoolRows
            schools={data.recentlyAdded}
            empty="No schools added recently."
            emptySubtext="Start building your schools pipeline."
          />
        </Widget>
      </div>
    </div>
  )
}

// ─── Volunteer Lead ───────────────────────────────────────────────────────────
export function VolunteerLeadOverview({
  name,
  data,
  queueData,
}: {
  name: string
  data: VolunteerLeadData
  queueData?: any
}) {
  const workItems = queueData?.workItems ?? []

  return (
    <div className="space-y-8 animate-fade-up">
      <DashboardHero
        greeting="Good to see you"
        userName={name}
        role="Volunteer Lead"
        impact={[
          { label: 'Schools Needing Teams', value: formatNumber(queueData?.schoolsNeedingTeamsCount ?? 0), icon: School },
          { label: 'Incomplete Teams', value: formatNumber(queueData?.incompleteTeamsCount ?? 0), icon: Users },
          { label: 'Pending Responses', value: formatNumber(queueData?.pendingResponsesCount ?? 0), icon: CalendarClock },
          { label: 'Teams Ready', value: formatNumber(queueData?.teamsReadyCount ?? 0), icon: CheckCircle2 },
        ]}
      />

      <WorkQueueCard
        title="Schools Needing Volunteer Teams"
        subtitle="Active schools waiting for their team to be assigned"
        icon={Users}
        href="/dashboard/assignments"
        hrefLabel="View all assignments"
        empty={workItems.length === 0}
        emptyMessage="All school teams are fully staffed!"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {workItems.map((item: any) => {
            const isReady = item.confirmed_count >= item.required_volunteers
            return (
              <SchoolTeamCard
                key={item.id}
                item={item}
                accentClass={
                  isReady
                    ? 'border-success/30 bg-success/5'
                    : 'border-brand-orange/30 bg-brand-orange/5'
                }
                statusBadge={
                  <Badge
                    variant="outline"
                    className={
                      isReady
                        ? 'border-success/40 bg-success/15 text-success font-bold shrink-0'
                        : 'border-brand-orange/40 bg-brand-orange/15 text-brand-orange font-bold shrink-0'
                    }
                  >
                    {isReady ? 'Team Ready' : 'Building'}
                  </Badge>
                }
                statsRow={
                  <>
                    <span>Confirmed: <strong className="text-foreground">{item.confirmed_count}/{item.required_volunteers}</strong></span>
                    <span>Awaiting: <strong className="text-foreground">{item.requested_count}</strong></span>
                    <span>Unavailable: <strong className="text-foreground">{item.unavailable_count}</strong></span>
                  </>
                }
                actionHref={`/dashboard/schools/${item.id}`}
                actionLabel={isReady ? 'View Team' : 'Build Team'}
              />
            )
          })}
        </div>
      </WorkQueueCard>
    </div>
  )
}

// ─── Execution Lead ───────────────────────────────────────────────────────────
export function ExecOverview({
  name,
  data,
  execQueueData,
}: {
  name: string
  data: ExecData
  execQueueData?: any
}) {
  const k = data.kpis
  const workItems = execQueueData?.workItems ?? []

  return (
    <div className="space-y-8 animate-fade-up">
      <DashboardHero
        greeting="Good to see you"
        userName={name}
        role="Execution Lead"
        impact={[
          { label: 'Needing Execution Plan', value: formatNumber(execQueueData?.needingPlanCount ?? 0), icon: Wrench },
          { label: 'Awaiting Approval', value: formatNumber(execQueueData?.awaitingApprovalCount ?? 0), icon: Clock },
          { label: 'Ready to Teach', value: formatNumber(execQueueData?.executionReadyCount ?? 0), icon: CheckCircle2 },
          { label: 'Pending Session Reports', value: formatNumber(k.pendingReports), icon: FileClock },
        ]}
      />

      <WorkQueueCard
        title="Execution & Logistics Queue"
        subtitle="Schools ready for execution planning and session scheduling"
        icon={Wrench}
        href="/dashboard/schools"
        hrefLabel="View all schools"
        empty={workItems.length === 0}
        emptyMessage="No execution plans outstanding right now!"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {workItems.map((item: any) => {
            const isApproved = item.execPlanStatus === 'approved'
            const isPending = item.execPlanStatus === 'submitted' || item.execPlanStatus === 'campus_approved'
            const accentClass = isApproved
              ? 'border-success/30 bg-success/5'
              : isPending
              ? 'border-brand/20 bg-brand/5'
              : 'border-brand-orange/30 bg-brand-orange/5'
            const badgeClass = isApproved
              ? 'border-success/40 bg-success/15 text-success font-bold shrink-0'
              : isPending
              ? 'border-brand/40 bg-brand/15 text-brand font-bold shrink-0'
              : 'border-brand-orange/40 bg-brand-orange/15 text-brand-orange font-bold shrink-0'
            const badgeLabel = isApproved ? 'Plan Approved' : isPending ? 'In Review' : 'Needs Plan'

            return (
              <SchoolTeamCard
                key={item.id}
                item={item}
                accentClass={accentClass}
                statusBadge={
                  <Badge variant="outline" className={badgeClass}>{badgeLabel}</Badge>
                }
                statsRow={
                  <>
                    <span>{item.digital_classrooms} digital classroom{item.digital_classrooms !== 1 ? 's' : ''}</span>
                    <span>Projector: <strong className="text-foreground">{item.has_projector ? '✓' : 'Needed'}</strong></span>
                    <span>Team of <strong className="text-foreground">{item.required_volunteers}</strong></span>
                  </>
                }
                actionHref={`/dashboard/schools/${item.id}`}
                actionLabel={isApproved ? 'Schedule Sessions' : 'Manage Plan'}
              />
            )
          })}
        </div>
      </WorkQueueCard>

      <div className="space-y-4">
        <SectionHeader title="Your Recent Sessions" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Widget title="Today's AI Sessions" href="/dashboard/sessions">
            <SessionRows sessions={data.todaySessions} empty="No sessions today." emptySubtext="Your upcoming sessions will appear here." />
          </Widget>
          <Widget title="Reports Awaiting Submission" href="/dashboard/sessions">
            <SessionRows sessions={data.pendingReports} empty="All reports submitted!" emptySubtext="Great work keeping records up to date." />
          </Widget>
        </div>
      </div>
    </div>
  )
}

// ─── Volunteer — My Teach AI Journey ─────────────────────────────────────────
export function VolunteerOverview({
  name,
  data,
  journeyData,
}: {
  name: string
  data: VolunteerData
  journeyData?: any
}) {
  const school = journeyData?.school
  const nextSess = journeyData?.nextSession
  const prog = journeyData?.progress
  const history = journeyData?.history ?? []

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Journey Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-deep/90 via-brand/80 to-brand-orange/70 text-white border border-brand/30">
        <NeuralNetworkBackground variant="prominent" />
        <div className="relative px-6 py-10 md:px-10 md:py-12">
          <p className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-3">
            My Teach AI Journey
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Hello, {name} 👋
          </h1>
          <p className="text-base text-white/80 font-medium max-w-xl">
            Every session you teach brings AI education one step closer to another child across India.
          </p>

          {school && (
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Sessions Completed', value: `${prog?.completedSessions ?? 0} / 4` },
                { label: 'Attendance Rate', value: `${prog?.attendanceRate ?? 100}%` },
                { label: 'Evidence Uploaded', value: prog?.evidenceContributions ?? 0 },
                { label: 'Program Progress', value: `${prog?.schoolCompletionPercentage ?? 0}%` },
              ].map((m) => (
                <div key={m.label} className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm border border-white/20">
                  <p className="text-xs text-white/70 font-semibold uppercase tracking-wide mb-1">{m.label}</p>
                  <p className="text-2xl font-bold tabular-nums">{m.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assigned School + Progress */}
      {school ? (
        <div className="rounded-xl border border-brand/20 bg-gradient-to-br from-cream-light to-secondary/20 shadow-soft overflow-hidden">
          <div className="px-6 py-5 border-b border-brand/10 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-brand-orange uppercase tracking-wide mb-1">Your Assigned School</p>
              <h2 className="text-xl font-bold text-foreground">{school.name}</h2>
              <p className="text-sm text-muted-foreground font-medium mt-0.5">{school.district} · Team Member</p>
            </div>
            <Badge variant="outline" className="border-success/40 bg-success/15 text-success font-bold shrink-0 mt-1">
              {school.team_status?.toUpperCase() ?? 'CONFIRMED'}
            </Badge>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center justify-between text-sm font-semibold mb-2">
              <span className="text-foreground">School Program Progress</span>
              <span className="text-brand-orange">{prog?.completedSessions ?? 0} of 4 sessions verified</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-cream-warm border border-border/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-brand-orange animate-progress transition-all"
                style={{ width: `${prog?.schoolCompletionPercentage ?? 0}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={School}
          title="No school assigned yet"
          description="You're not currently on an active school team. Your Volunteer Lead will request your availability when new school teams form."
        />
      )}

      {/* Next Session */}
      {nextSess && (
        <div className="rounded-xl border-2 border-brand/20 bg-card shadow-soft overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-6 py-4 bg-brand/5 border-b border-brand/10">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-brand/10 text-brand">
                <CalendarClock className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold text-brand-orange uppercase tracking-wide">Coming Up</p>
                <h3 className="font-bold text-base text-foreground">Next Scheduled Session</h3>
              </div>
            </div>
            <Badge variant="outline" className="border-brand/30 bg-brand/10 text-brand font-bold shrink-0">
              Session {nextSess.session_number}
            </Badge>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Topic', value: nextSess.topic },
                { label: 'Date', value: formatDate(nextSess.scheduled_at) },
                { label: 'Meet at', value: `${nextSess.meeting_point} (${nextSess.departure_time})` },
                { label: 'Team Size', value: `${nextSess.team_size} volunteers` },
              ].map((d) => (
                <div key={d.label} className="bg-cream-light rounded-lg p-3 border border-border/50">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">{d.label}</p>
                  <p className="text-sm font-bold text-foreground">{d.value}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Link href={`/dashboard/sessions/${nextSess.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline">
                View full session details <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Card */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className={`rounded-xl border-2 p-5 space-y-4 ${prog?.certificate?.status === 'unlocked' ? 'border-success/40 bg-success/5' : 'border-border/50 bg-card shadow-soft'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Award className="size-5 text-brand-gold" /> Fellowship Certificate
            </h3>
            <Badge
              variant="outline"
              className={
                prog?.certificate?.status === 'unlocked'
                  ? 'border-success/40 bg-success/15 text-success font-bold'
                  : 'border-border text-muted-foreground'
              }
            >
              {prog?.certificate?.status === 'unlocked' ? 'Unlocked' : 'Locked'}
            </Badge>
          </div>

          {prog?.certificate?.status === 'unlocked' ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-success">
                🎉 Congratulations! Your fellowship certificate is ready to download.
              </p>
              <p className="text-xs text-muted-foreground font-mono">{prog.certificate.certificateNumber}</p>
              <Link href="/dashboard/certificates" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline mt-2">
                View Certificate <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">
                Complete all 4 sessions in your school fellowship to unlock your official certificate.
              </p>
              <p className="text-sm font-bold text-brand-orange">
                {prog?.certificate?.missingSessions ?? 4} session{(prog?.certificate?.missingSessions ?? 4) !== 1 ? 's' : ''} remaining
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-cream-light border border-border/50 mt-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-gold"
                  style={{ width: `${((4 - (prog?.certificate?.missingSessions ?? 4)) / 4) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Teaching history timeline */}
        {history.length > 0 && (
          <div className="rounded-xl border border-border/50 bg-card shadow-soft p-5 space-y-4">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Timer className="size-5 text-brand-orange" /> My Teaching History
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {history.map((h: any) => {
                const styles: Record<string, string> = {
                  present: 'border-success/30 bg-success/10 text-success',
                  absent: 'border-error/30 bg-error/10 text-error',
                  excused: 'border-brand-gold/30 bg-brand-gold/10 text-brand-gold',
                  upcoming: 'border-brand/30 bg-brand/10 text-brand',
                }
                const style = styles[h.status] ?? 'border-border/50 bg-cream-light text-muted-foreground'
                return (
                  <div key={h.session_number} className={`p-3 rounded-lg border space-y-1 ${style}`}>
                    <div className="flex items-center justify-between font-bold text-sm">
                      <span>Session {h.session_number}</span>
                      <span className="capitalize text-xs font-semibold">{h.status}</span>
                    </div>
                    <p className="text-xs truncate font-medium opacity-80">{h.topic}</p>
                    <p className="text-xs opacity-60">{formatDate(h.scheduled_at)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Finance Lead ─────────────────────────────────────────────────────────────
export function FinanceLeadOverview({
  name,
  data,
  finWorkspaceData,
}: {
  name: string
  data: FinanceLeadData
  finWorkspaceData?: any
}) {
  const k = data.kpis
  const actionItems = finWorkspaceData?.actionItems ?? []

  return (
    <div className="space-y-8 animate-fade-up">
      <DashboardHero
        greeting="Good to see you"
        userName={name}
        role="Finance Lead"
        impact={[
          { label: 'Allocated Budget', value: formatCurrency(finWorkspaceData?.allocatedBudget ?? k.allocatedAmount), icon: Wallet },
          { label: 'Actual Spend', value: formatCurrency(finWorkspaceData?.spentBudget ?? 0), icon: Receipt },
          { label: 'Available Budget', value: formatCurrency(finWorkspaceData?.availableBudget ?? 0), icon: CheckCircle2 },
          { label: 'Utilization', value: `${finWorkspaceData?.utilizationRate ?? 0}%`, icon: TrendingUp },
        ]}
      />

      <WorkQueueCard
        title="Action Required — Operational Finance"
        subtitle="Tasks needing your review, verification, or approval"
        icon={DollarSign}
        href="/dashboard/finance"
        hrefLabel="View all finance"
        empty={actionItems.length === 0}
        emptyMessage="All accounts are reconciled! No pending approvals."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {actionItems.map((item: any) => (
            <div key={item.id} className="p-4 rounded-xl border border-brand-orange/20 bg-brand-orange/5 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-base text-foreground">{item.title}</h4>
                <Badge variant="outline" className="border-brand-gold/40 bg-brand-gold/15 text-brand-gold font-bold shrink-0">
                  {item.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-medium">{item.subtitle}</p>
              <div className="flex items-center justify-between border-t border-border/50 pt-3">
                <span className="font-bold text-base text-brand-deep">₹{item.amount}</span>
                {item.schoolId && (
                  <Link href={`/dashboard/schools/${item.schoolId}`} className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline">
                    Review School <ArrowRight className="size-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </WorkQueueCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <Widget title="Extra Budget Requests" href="/dashboard/finance">
          <BudgetRequestReviewList requests={data.pendingBudgetRequests} canReview={false} />
        </Widget>
        <Widget title="Quick Navigate">
          <QuickActions
            title=""
            actions={[
              { label: 'Campus Finance Summary', description: 'View budget utilization and spend', href: '/dashboard/finance', icon: TrendingUp },
              { label: 'School Execution Plans', description: 'Review plan budgets across schools', href: '/dashboard/schools', icon: Wrench },
            ]}
            columns={2}
          />
        </Widget>
      </div>
    </div>
  )
}

// ─── Management Admin ─────────────────────────────────────────────────────────
export function CampusMgmtOverview({ name, data }: { name: string; data: CampusLeadData }) {
  const k = data.kpis
  return (
    <div className="space-y-8 animate-fade-up">
      <DashboardHero
        greeting="Good to see you"
        userName={name}
        role="Management Admin"
        impact={[
          { label: 'Schools Reached', value: formatNumber(k.schoolsActive), icon: School },
          { label: 'Active Volunteers', value: formatNumber(k.volunteersActive), icon: Users },
          { label: 'Evidence Reviews Pending', value: formatNumber(k.pendingEvidenceReviews), icon: Images },
          { label: 'Sessions This Week', value: formatNumber(k.sessionsScheduledThisWeek), icon: CalendarClock },
        ]}
      />

      <QuickActions
        title="What Do You Want To Do?"
        actions={[
          { label: 'View Analytics', description: 'Measure campus-wide impact', href: '/dashboard/analytics', icon: TrendingUp },
          { label: 'Campus Finance', description: 'Budget and spend overview', href: '/dashboard/finance', icon: Wallet },
        ]}
        columns={2}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Widget title="Pending Budget Requests">
          <BudgetRequestReviewList requests={data.pendingBudgetRequests} canReview={false} />
        </Widget>
        <Widget title="Pending Reimbursements" href="/dashboard/reimbursements">
          <ReimbursementRows items={data.pendingReimbursements} />
        </Widget>
      </div>
    </div>
  )
}

// ─── Super Admin ──────────────────────────────────────────────────────────────
export function SuperAdminOverview({
  name,
  data,
  canReviewBudgetRequests,
}: {
  name: string
  data: CampusLeadData
  canReviewBudgetRequests: boolean
}) {
  const k = data.kpis
  return (
    <div className="space-y-8 animate-fade-up">
      <DashboardHero
        greeting="Good to see you"
        userName={name}
        role="Super Admin"
        impact={[
          { label: 'Schools Reached', value: formatNumber(k.schoolsActive), icon: School, variant: 'highlight' } as any,
          { label: 'Active Volunteers', value: formatNumber(k.volunteersActive), icon: Users },
          { label: 'Awaiting Approval', value: formatNumber(k.schoolsAwaitingApproval), icon: ClipboardList },
          { label: 'Sessions This Week', value: formatNumber(k.sessionsScheduledThisWeek), icon: CalendarClock },
        ]}
      />

      {/* Extra attention tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi label="Pending Evidence Reviews" value={formatNumber(k.pendingEvidenceReviews)} icon={Images} />
        <Kpi label="Budget Requests Pending" value={formatNumber(k.budgetRequestsPendingReview)} icon={Wallet} />
      </div>

      <QuickActions
        title="What Do You Want To Do?"
        actions={[
          { label: 'Admin Panel', description: 'Platform-wide management', href: '/admin', icon: ClipboardList, variant: 'highlight' },
          { label: 'Manage Campuses', description: 'Add or update campuses', href: '/admin/campuses', icon: MapPin },
          { label: 'Manage Schools', description: 'Full school records', href: '/admin/schools', icon: School },
          { label: 'Manage Volunteers', description: 'All volunteer accounts', href: '/admin/volunteers', icon: Users },
        ]}
        columns={4}
      />

      <div className="space-y-4">
        <SectionHeader title="What's Happening Across All Campuses" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Widget title="Today's AI Sessions" href="/dashboard/sessions">
            <SessionRows sessions={data.todaySessions} empty="No sessions today." emptySubtext="Upcoming sessions will appear here." />
          </Widget>
          <Widget title="Upcoming Sessions" href="/dashboard/sessions">
            <SessionRows sessions={data.upcomingSessions} empty="Nothing scheduled yet." />
          </Widget>
          <Widget title="School Approvals Needed" href="/dashboard/schools">
            <SchoolRows schools={data.pendingApprovals} empty="All schools approved." emptySubtext="The pipeline is clear." />
          </Widget>
          <Widget title="Pending Session Reports" href="/dashboard/sessions">
            <SessionRows sessions={data.pendingReports} empty="All reports submitted!" emptySubtext="Great work across all campuses." />
          </Widget>
          <Widget title="Pending Reimbursements" href="/dashboard/reimbursements">
            <ReimbursementRows items={data.pendingReimbursements} />
          </Widget>
          <Widget title="Budget Requests">
            <BudgetRequestReviewList requests={data.pendingBudgetRequests} canReview={canReviewBudgetRequests} />
          </Widget>
        </div>
      </div>
    </div>
  )
}

// ─── Fallback ─────────────────────────────────────────────────────────────────
export function NoCampusOverview({ name, role }: { name: string; role: string }) {
  return (
    <div className="space-y-6 animate-fade-up">
      <SimpleHero
        greeting="Welcome"
        userName={name}
        role={role}
        description="You're in — we just need to get you linked to a campus before you can see your dashboard."
      />
      <EmptyState
        icon={MapPin}
        title="No campus assigned yet"
        description="Your account isn't linked to a campus. An admin will assign you shortly — reach out to your coordinator if this takes more than a day."
      />
    </div>
  )
}
