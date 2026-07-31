import Link from 'next/link'
import {
  School, Users, GraduationCap, CalendarDays, CalendarClock, FileClock, Wallet,
  Images, ClipboardList, TrendingUp, CheckCircle2, MapPin, Percent, Timer, Wrench, Clock, Receipt, DollarSign,
  type LucideIcon,
} from 'lucide-react'
import { MetricCard } from '@/components/shared/metric-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/states'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BudgetRequestReviewList } from '@/components/dashboard/budget-request-review-list'
import { formatDate, formatCurrency, formatNumber } from '@/lib/format'
import { SCHOOL_STATUS_META } from '@/lib/constants/status'
import { curriculumStageLabel } from '@/lib/constants/sessions'
import type {
  CampusLeadData, OutreachData, VolunteerLeadData, ExecData, VolunteerData,
  FinanceLeadData, SessionLite, SchoolLite,
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
            {s.latest_session_number ? (
              <span className="shrink-0 text-xs text-muted-foreground">
                Session {s.latest_session_number} — {curriculumStageLabel(s.latest_session_number)}
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
    <div className="space-y-6">
      <OverviewHeader name={name} role="Campus Governance Lead" />

      {/* Governance KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Kpi label="Active Schools" value={formatNumber(k.schoolsActive)} icon={School} />
        <Kpi label="Active Volunteers" value={formatNumber(k.volunteersActive)} icon={Users} />
        <Kpi label="Pending Evidence Reviews" value={formatNumber(k.pendingEvidenceReviews)} icon={Images} />
        <Kpi label="Schools Awaiting Approval" value={formatNumber(k.schoolsAwaitingApproval)} icon={ClipboardList} />
        <Kpi label="Budget Requests Pending" value={formatNumber(k.budgetRequestsPendingReview)} icon={Wallet} />
        <Kpi label="Sessions Scheduled This Week" value={formatNumber(k.sessionsScheduledThisWeek)} icon={CalendarClock} />
      </div>

      {/* Governance Review Queues */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Widget title="Outreach Approvals Awaiting Review" href="/dashboard/schools">
          <SchoolRows schools={data.pendingApprovals} empty="No schools awaiting outreach approval." />
        </Widget>
        <Widget title="Session Delivery Reports Awaiting Verification" href="/dashboard/sessions">
          <SessionRows sessions={data.pendingReports} empty="All session reports verified! 🎉" />
        </Widget>
        <Widget title="Extra Budget Increase Requests" href="/dashboard/finance">
          <BudgetRequestReviewList requests={data.pendingBudgetRequests} canReview={canReviewBudgetRequests} />
        </Widget>
        <Widget title="Quick Governance Links">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Campus Schools Pipeline', href: '/dashboard/schools', icon: School },
              { label: 'Session Governance', href: '/dashboard/sessions', icon: CalendarDays },
              { label: 'Evidence Gallery', href: '/dashboard/evidence', icon: Images },
              { label: 'Campus Analytics', href: '/dashboard/analytics', icon: TrendingUp },
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

function QuickActions() {
  const actions = [
    { label: 'View Schools', href: '/dashboard/schools', icon: School },
    { label: 'View Sessions', href: '/dashboard/sessions', icon: CalendarDays },
    { label: 'Review Evidence', href: '/dashboard/evidence', icon: Images },
    { label: 'Finance Overview', href: '/dashboard/finance', icon: Wallet },
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
        <Kpi label="Registered" value={formatNumber(k.approved)} icon={CheckCircle2} />
        <Kpi label="Active Schools" value={formatNumber(k.sessionsScheduled)} icon={CalendarClock} />
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
        <Widget title="Awaiting Outreach Approval" href="/dashboard/schools">
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
export function VolunteerLeadOverview({
  name,
  data,
  queueData,
}: {
  name: string
  data: VolunteerLeadData
  queueData?: any
}) {
  const k = data.kpis
  const workItems = queueData?.workItems ?? []

  return (
    <div className="space-y-6">
      <OverviewHeader name={name} role="Volunteer Lead" />

      {/* Top Operational Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Schools Needing Teams" value={formatNumber(queueData?.schoolsNeedingTeamsCount ?? 0)} icon={School} />
        <Kpi label="Incomplete Teams" value={formatNumber(queueData?.incompleteTeamsCount ?? 0)} icon={Users} />
        <Kpi label="Pending Responses" value={formatNumber(queueData?.pendingResponsesCount ?? 0)} icon={CalendarClock} />
        <Kpi label="Teams Ready" value={formatNumber(queueData?.teamsReadyCount ?? 0)} icon={CheckCircle2} />
      </div>

      {/* Volunteer Lead Work Queue */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-base flex items-center gap-2">
              <Users className="size-4 text-brand" /> Work Queue — Schools Needing Teams
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Active schools requiring volunteer team assignment.
            </p>
          </div>
          <Link href="/dashboard/assignments" className="text-xs font-semibold text-brand hover:underline">
            View All →
          </Link>
        </div>

        {workItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
            No active schools needing teams right now. All teams are staffed! 🎉
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {workItems.map((item: any) => {
              const isReady = item.confirmed_count >= item.required_volunteers
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border space-y-2 text-xs ${
                    isReady ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm">
                        <Link href={`/dashboard/schools/${item.id}`} className="hover:underline text-brand">
                          {item.name}
                        </Link>
                      </h4>
                      <p className="text-[11px] text-muted-foreground">{item.district} · {item.student_strength} students</p>
                    </div>
                    <Badge variant="outline" className={isReady ? 'border-success/30 bg-success/10 text-success' : 'border-warning/30 bg-warning/10 text-warning'}>
                      {isReady ? 'Ready' : 'Building'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[11px]">
                    <span>Confirmed: <strong>{item.confirmed_count} / {item.required_volunteers}</strong></span>
                    <span>Awaiting: <strong>{item.requested_count}</strong></span>
                    <span>Unavailable: <strong>{item.unavailable_count}</strong></span>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Link
                      href={`/dashboard/schools/${item.id}`}
                      className="text-xs font-semibold text-brand hover:underline"
                    >
                      {isReady ? 'View Team →' : 'Build Team →'}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

// ─── Execution Lead ─────────────────────────────────────────────────────────
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
    <div className="space-y-6">
      <OverviewHeader name={name} role="Execution Lead" />

      {/* Top Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Needing Execution Plan" value={formatNumber(execQueueData?.needingPlanCount ?? 0)} icon={Wrench} />
        <Kpi label="Awaiting Dual Approval" value={formatNumber(execQueueData?.awaitingApprovalCount ?? 0)} icon={Clock} />
        <Kpi label="Execution Ready Schools" value={formatNumber(execQueueData?.executionReadyCount ?? 0)} icon={CheckCircle2} />
        <Kpi label="Pending Session Reports" value={formatNumber(k.pendingReports)} icon={FileClock} />
      </div>

      {/* Execution Lead Work Queue (Task 24) */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-base flex items-center gap-2">
              <Wrench className="size-4 text-brand" /> Work Queue — Execution & Logistics Preparation
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Active school teams ready for execution planning and session scheduling.
            </p>
          </div>
          <Link href="/dashboard/schools" className="text-xs font-semibold text-brand hover:underline">
            View All Schools →
          </Link>
        </div>

        {workItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
            No active schools needing execution plans right now! 🎉
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {workItems.map((item: any) => {
              const isApproved = item.execPlanStatus === 'approved'
              const isPending = item.execPlanStatus === 'submitted' || item.execPlanStatus === 'campus_approved'
              let badgeStyle = 'border-warning/30 bg-warning/10 text-warning'
              let badgeLabel = 'Needs Plan'
              if (isApproved) {
                badgeStyle = 'border-success/30 bg-success/10 text-success'
                badgeLabel = 'Plan Approved'
              } else if (isPending) {
                badgeStyle = 'border-brand/30 bg-brand/10 text-brand'
                badgeLabel = 'In Review'
              }

              return (
                <div key={item.id} className="p-3 rounded-xl border border-border bg-card space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm">
                        <Link href={`/dashboard/schools/${item.id}`} className="hover:underline text-brand">
                          {item.name}
                        </Link>
                      </h4>
                      <p className="text-[11px] text-muted-foreground">{item.district} · {item.student_strength} students</p>
                    </div>
                    <Badge variant="outline" className={badgeStyle}>
                      {badgeLabel}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[11px]">
                    <span>Classrooms: <strong>{item.digital_classrooms} digital</strong></span>
                    <span>Projector: <strong>{item.has_projector ? 'Yes' : 'Needs 1'}</strong></span>
                    <span>Required Team: <strong>{item.required_volunteers}</strong></span>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Link href={`/dashboard/schools/${item.id}`} className="text-xs font-semibold text-brand hover:underline">
                      {isApproved ? 'Schedule Sessions →' : 'Manage Execution Plan →'}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Widget title="Today's Sessions" href="/dashboard/sessions">
          <SessionRows sessions={data.todaySessions} empty="No sessions today." />
        </Widget>
        <Widget title="Pending Reports" href="/dashboard/sessions">
          <SessionRows sessions={data.pendingReports} empty="No reports pending. 🎉" />
        </Widget>
      </div>
    </div>
  )
}

// ─── Volunteer (My Teach AI Journey) ─────────────────────────────────────────
export function VolunteerOverview({
  name,
  data,
  journeyData,
}: {
  name: string
  data: VolunteerData
  journeyData?: any
}) {
  const k = data.kpis
  const school = journeyData?.school
  const nextSess = journeyData?.nextSession
  const prog = journeyData?.progress
  const history = journeyData?.history ?? []

  return (
    <div className="space-y-6">
      <OverviewHeader name={name} role="Volunteer" />

      {/* MY TEACH AI JOURNEY CARD (Tasks 16, 23) */}
      {school ? (
        <Card className="border-brand/30 bg-brand/5 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-brand block">MY TEACH AI JOURNEY</span>
              <h2 className="font-display text-xl font-bold text-foreground leading-tight">
                {school.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">{school.district} · Team Member</p>
            </div>
            <Badge variant="outline" className="border-success/30 bg-success/10 text-success font-bold text-xs">
              Status: {school.team_status?.toUpperCase() ?? 'CONFIRMED'}
            </Badge>
          </div>

          <div className="space-y-1 border-t border-brand/10 pt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span>School Program Progress</span>
              <span>{prog?.completedSessions ?? 0} / 4 Sessions Verified ({prog?.schoolCompletionPercentage ?? 0}%)</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${prog?.schoolCompletionPercentage ?? 0}%` }} />
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-border p-5 text-center text-muted-foreground">
          <p className="text-sm">You are not currently assigned to an active school team.</p>
          <p className="text-xs mt-1">Your Volunteer Lead will request your availability when new school teams form.</p>
        </Card>
      )}

      {/* NEXT SESSION CARD */}
      {nextSess && (
        <Card className="p-5 border-brand/20 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center gap-2">
              <CalendarClock className="size-4 text-brand" /> NEXT SCHEDULED SESSION
            </h3>
            <Badge variant="outline" className="border-brand/30 bg-brand/10 text-brand font-semibold">
              Session {nextSess.session_number}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-muted/20 p-3 rounded-lg border">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Topic</span>
              <strong className="font-semibold text-sm">{nextSess.topic}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Scheduled Date & Time</span>
              <strong className="font-semibold">{formatDate(nextSess.scheduled_at)}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Meeting Point & Departure</span>
              <strong className="font-semibold">{nextSess.meeting_point} ({nextSess.departure_time})</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Team Size</span>
              <strong className="font-semibold">{nextSess.team_size} Volunteers</strong>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href={`/dashboard/sessions/${nextSess.id}`} className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1">
              View Session Details →
            </Link>
          </div>
        </Card>
      )}

      {/* MY PROGRESS & CERTIFICATE CARD */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="size-4 text-success" /> Participation Metrics
          </h3>
          <div className="grid grid-cols-2 gap-3 text-center text-xs">
            <div className="rounded border p-2 bg-muted/20">
              <span className="text-[10px] text-muted-foreground block">Sessions Attended</span>
              <strong className="text-base font-bold text-foreground">{prog?.completedSessions ?? 0} / 4</strong>
            </div>
            <div className="rounded border p-2 bg-muted/20">
              <span className="text-[10px] text-muted-foreground block">Attendance Rate</span>
              <strong className="text-base font-bold text-brand">{prog?.attendanceRate ?? 100}%</strong>
            </div>
            <div className="rounded border p-2 bg-muted/20">
              <span className="text-[10px] text-muted-foreground block">Evidence Uploads</span>
              <strong className="text-base font-bold text-foreground">{prog?.evidenceContributions ?? 0}</strong>
            </div>
            <div className="rounded border p-2 bg-muted/20">
              <span className="text-[10px] text-muted-foreground block">Completion</span>
              <strong className="text-base font-bold text-foreground">{prog?.schoolCompletionPercentage ?? 0}%</strong>
            </div>
          </div>
        </Card>

        {/* CERTIFICATE ELIGIBILITY CARD (Tasks 21, 22) */}
        <Card className={`p-4 space-y-3 border ${prog?.certificate?.status === 'unlocked' ? 'border-success/30 bg-success/5' : 'border-border'}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              🎓 Fellowship Certificate
            </h3>
            <Badge variant="outline" className={prog?.certificate?.status === 'unlocked' ? 'border-success/30 bg-success/10 text-success font-bold' : 'border-muted text-muted-foreground'}>
              {prog?.certificate?.status === 'unlocked' ? 'UNLOCKED' : 'LOCKED'}
            </Badge>
          </div>

          {prog?.certificate?.status === 'unlocked' ? (
            <div className="space-y-2 text-xs">
              <p className="text-success font-semibold">Congratulations! Your fellowship certificate is ready.</p>
              <p className="text-muted-foreground font-mono text-[11px]">{prog.certificate.certificateNumber}</p>
              <Link href="/dashboard/certificates" className="inline-block mt-1 text-xs font-bold text-brand hover:underline">
                View Certificate →
              </Link>
            </div>
          ) : (
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>Complete the 4-session school fellowship to unlock your official certificate.</p>
              <p className="text-[11px] font-medium text-warning">
                {prog?.certificate?.missingSessions ?? 4} session(s) remaining to reach completion.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* MY TEACHING HISTORY TIMELINE (Task 19) */}
      {history.length > 0 && (
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Timer className="size-4 text-brand" /> My Teaching History
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
            {history.map((h: any) => {
              let badgeStyle = 'border-border bg-muted/20 text-muted-foreground'
              if (h.status === 'present') badgeStyle = 'border-success/30 bg-success/10 text-success'
              if (h.status === 'absent') badgeStyle = 'border-destructive/30 bg-destructive/10 text-destructive'
              if (h.status === 'excused') badgeStyle = 'border-warning/30 bg-warning/10 text-warning'
              if (h.status === 'upcoming') badgeStyle = 'border-brand/30 bg-brand/10 text-brand'

              return (
                <div key={h.session_number} className={`p-2.5 rounded-lg border space-y-1 ${badgeStyle}`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>Session {h.session_number}</span>
                    <span className="uppercase text-[10px]">{h.status}</span>
                  </div>
                  <p className="text-[11px] truncate font-medium">{h.topic}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDate(h.scheduled_at)}</p>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── Finance Lead ───────────────────────────────────────────────────────────
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
    <div className="space-y-6">
      <OverviewHeader name={name} role="Finance Lead" />

      {/* Top Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Allocated Budget" value={formatCurrency(finWorkspaceData?.allocatedBudget ?? k.allocatedAmount)} icon={Wallet} />
        <Kpi label="Reserved Budget" value={formatCurrency(finWorkspaceData?.reservedBudget ?? k.reservedAmount)} icon={TrendingUp} />
        <Kpi label="Actual Spend" value={formatCurrency(finWorkspaceData?.spentBudget ?? 0)} icon={Receipt} />
        <Kpi label="Available Budget" value={`${formatCurrency(finWorkspaceData?.availableBudget ?? 0)} (${finWorkspaceData?.utilizationRate ?? 0}% Utilized)`} icon={CheckCircle2} />
      </div>

      {/* Action Required Queue (Task 15) */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-base flex items-center gap-2">
              <DollarSign className="size-4 text-brand" /> Action Required Queue — Operational Finance
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Financial tasks requiring review, bill verification, or budget approval.
            </p>
          </div>
          <Link href="/dashboard/finance" className="text-xs font-semibold text-brand hover:underline">
            View All Finance →
          </Link>
        </div>

        {actionItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
            No pending financial approvals or missing bills! All accounts reconciled. 🎉
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {actionItems.map((item: any) => (
              <div key={item.id} className="p-3 rounded-xl border border-border bg-card space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                  <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning font-semibold">
                    {item.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">{item.subtitle}</p>
                <div className="flex items-center justify-between border-t border-border/50 pt-2">
                  <span className="font-bold text-sm text-brand">₹{item.amount}</span>
                  {item.schoolId && (
                    <Link href={`/dashboard/schools/${item.schoolId}`} className="text-xs font-semibold text-brand hover:underline">
                      Review School →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Widget title="Extra Budget Requests" href="/dashboard/finance">
          <BudgetRequestReviewList requests={data.pendingBudgetRequests} canReview={false} />
        </Widget>
        <Widget title="Quick Links">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Campus Finance Summary', href: '/dashboard/finance', icon: TrendingUp },
              { label: 'School Execution Plans', href: '/dashboard/schools', icon: Wrench },
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

function FinanceQuickActions() {
  const actions = [
    { label: 'View Reimbursements', href: '/dashboard/reimbursements', icon: Wallet },
    { label: 'Campus Finance', href: '/dashboard/finance', icon: TrendingUp },
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

// ─── Management Admin ───────────────────────────────────────────────────────
export function CampusMgmtOverview({ name, data }: { name: string; data: CampusLeadData }) {
  const k = data.kpis
  return (
    <div className="space-y-6">
      <OverviewHeader name={name} role="Management Admin" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Active Schools" value={formatNumber(k.schoolsActive)} icon={School} />
        <Kpi label="Active Volunteers" value={formatNumber(k.volunteersActive)} icon={Users} />
        <Kpi label="Pending Evidence Reviews" value={formatNumber(k.pendingEvidenceReviews)} icon={Images} />
        <Kpi label="Sessions Scheduled This Week" value={formatNumber(k.sessionsScheduledThisWeek)} icon={CalendarClock} />
      </div>

      <CampusMgmtQuickActions />

      <div className="grid gap-4 lg:grid-cols-2">
        <Widget title="Pending Budget Requests">
          <BudgetRequestReviewList requests={data.pendingBudgetRequests} canReview={false} />
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

function CampusMgmtQuickActions() {
  const actions = [
    { label: 'View Analytics', href: '/dashboard/analytics', icon: TrendingUp },
    { label: 'View Finance', href: '/dashboard/finance', icon: Wallet },
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

// ─── Super Admin ────────────────────────────────────────────────────────────
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
    <div className="space-y-6">
      <OverviewHeader name={name} role="Super Admin" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Kpi label="Active Schools" value={formatNumber(k.schoolsActive)} icon={School} />
        <Kpi label="Active Volunteers" value={formatNumber(k.volunteersActive)} icon={Users} />
        <Kpi label="Pending Evidence Reviews" value={formatNumber(k.pendingEvidenceReviews)} icon={Images} />
        <Kpi label="Schools Awaiting Approval" value={formatNumber(k.schoolsAwaitingApproval)} icon={ClipboardList} />
        <Kpi label="Budget Requests Pending" value={formatNumber(k.budgetRequestsPendingReview)} icon={Wallet} />
        <Kpi label="Sessions Scheduled This Week" value={formatNumber(k.sessionsScheduledThisWeek)} icon={CalendarClock} />
      </div>

      <SuperAdminQuickActions />

      <div className="grid gap-4 lg:grid-cols-2">
        <Widget title="Today's Sessions (All Campuses)" href="/dashboard/sessions">
          <SessionRows sessions={data.todaySessions} empty="No sessions scheduled today." />
        </Widget>
        <Widget title="Upcoming Sessions (All Campuses)" href="/dashboard/sessions">
          <SessionRows sessions={data.upcomingSessions} empty="Nothing upcoming yet." />
        </Widget>
        <Widget title="Pending School Approvals (All Campuses)" href="/dashboard/schools">
          <SchoolRows schools={data.pendingApprovals} empty="No schools awaiting approval." />
        </Widget>
        <Widget title="Pending Reports (All Campuses)" href="/dashboard/sessions">
          <SessionRows sessions={data.pendingReports} empty="All reports are in. 🎉" />
        </Widget>
        <Widget title="Pending Reimbursements (All Campuses)" href="/dashboard/reimbursements">
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
        <Widget title="Pending Budget Requests (All Campuses)">
          <BudgetRequestReviewList requests={data.pendingBudgetRequests} canReview={canReviewBudgetRequests} />
        </Widget>
      </div>
    </div>
  )
}

function SuperAdminQuickActions() {
  const actions = [
    { label: 'Admin Panel Overview', href: '/admin', icon: ClipboardList },
    { label: 'Manage Campuses', href: '/admin/campuses', icon: MapPin },
    { label: 'Manage Schools', href: '/admin/schools', icon: School },
    { label: 'Manage Volunteers', href: '/admin/volunteers', icon: Users },
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

