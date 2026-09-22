import { School, CalendarCheck, GraduationCap, Users, Banknote } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import {
  getCampusRollup,
  getCampusSessionFunnel,
  getCampusSchoolPipeline,
} from '@/lib/data/campus-analytics'
import { getSessionFunnel, getSchoolPipeline, getProgramSummary } from '@/lib/data/analytics'
import { getFinanceSummary, getMonthlyTrend } from '@/lib/data/finance'
import { formatCurrency, formatNumber } from '@/lib/format'
import { SESSION_STATUS_META, SCHOOL_STATUS_META, SCHOOL_PIPELINE } from '@/lib/constants/status'
import type { SessionStatus, SchoolStatus, StatusCount } from '@/types/database'
import { MetricCard } from '@/components/shared/metric-card'
import { StatusBreakdown, type BreakdownItem } from '@/components/analytics/status-breakdown'
import { CampusSpendChart } from '@/components/analytics/campus-spend-chart'
import { EmptyState } from '@/components/shared/states'
import { PageHeader } from '@/components/dashboard/page-header'

export const metadata = { title: 'Analytics' }

const SESSION_ORDER: SessionStatus[] = [
  'planned', 'in_progress', 'reported', 'campus_approved', 'verified', 'cancelled',
]
const SCHOOL_ORDER: SchoolStatus[] = [...SCHOOL_PIPELINE, 'archived']

function orderedItems<S extends string>(
  rows: StatusCount[],
  order: S[],
  meta: Record<S, { label: string; tone: BreakdownItem['tone'] }>,
): BreakdownItem[] {
  const byStatus = new Map(rows.map((r) => [r.status, r.count]))
  return order
    .map((s) => ({ label: meta[s].label, count: byStatus.get(s) ?? 0, tone: meta[s].tone }))
    .filter((i) => i.count > 0)
}

/**
 * The numbers this page renders, whichever scope produced them — one campus, or
 * the whole programme. Both sources carry the same figures under different
 * field names, so normalising here lets the layout below be written once.
 */
interface AnalyticsScope {
  /** Names the scope in the page description. */
  label: string
  schoolsReached: number
  schoolsTotal: number
  sessionsCompleted: number
  studentsImpacted: number
  volunteers: number
  targetSessions: number
  targetStudents: number
  funnel: StatusCount[]
  pipeline: StatusCount[]
}

export default async function DashboardAnalyticsPage() {
  const user = await requireAccess('/dashboard/analytics')

  // Branch on the permission, not on whether a campus happens to be set. A
  // super admin deliberately has no campus_id — they are platform-wide, not
  // unassigned — so the old `if (!user.campus_id) return <EmptyState/>` meant
  // this page rendered "No campus assigned" to the one role that can see every
  // campus. Only super_admin holds view_analytics_all (see the RBAC matrix),
  // so no other role reaches the programme-wide branch.
  const seesEveryCampus = can(user.role, 'view_analytics_all') !== false

  // A campus-scoped role with no campus really is misconfigured — that is the
  // case the empty state was written for, and it keeps it.
  if (!seesEveryCampus && !user.campus_id) {
    return <EmptyState title="No campus assigned" description="Analytics need a campus to scope to." />
  }

  const [scope, finance, monthly] = await Promise.all([
    seesEveryCampus ? programScope() : campusScope(user.campus_id!),
    getFinanceSummary(),
    getMonthlyTrend(),
  ])

  const sessionPct = scope.targetSessions > 0
    ? Math.round((scope.sessionsCompleted / scope.targetSessions) * 100)
    : undefined
  const studentPct = scope.targetStudents > 0
    ? Math.round((scope.studentsImpacted / scope.targetStudents) * 100)
    : undefined

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description={<>{scope.label}&rsquo;s impact vs. target and operational breakdowns.</>}
      />

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Schools reached" value={formatNumber(scope.schoolsReached)}
          icon={School} sublabel={`${formatNumber(scope.schoolsTotal)} in pipeline`}
        />
        <MetricCard
          label="Sessions verified" value={formatNumber(scope.sessionsCompleted)}
          icon={CalendarCheck}
          sublabel={sessionPct !== undefined ? `${sessionPct}% of ${formatNumber(scope.targetSessions)} target` : undefined}
        />
        <MetricCard
          label="Students impacted" value={formatNumber(scope.studentsImpacted)}
          icon={GraduationCap}
          sublabel={studentPct !== undefined ? `${studentPct}% of ${formatNumber(scope.targetStudents)} target` : undefined}
        />
        <MetricCard label="Active volunteers" value={formatNumber(scope.volunteers)} icon={Users} />
        <MetricCard
          label="Approved spend" value={formatCurrency(finance.approved_total)}
          icon={Banknote} sublabel={`${formatNumber(finance.pending_count)} claims pending review`}
        />
      </section>

      <CampusSpendChart data={monthly} />

      <section aria-label="Operational breakdowns" className="grid gap-4 lg:grid-cols-2">
        <StatusBreakdown title="Session funnel" items={orderedItems(scope.funnel, SESSION_ORDER, SESSION_STATUS_META)} />
        <StatusBreakdown title="School pipeline" items={orderedItems(scope.pipeline, SCHOOL_ORDER, SCHOOL_STATUS_META)} />
      </section>
    </div>
  )
}

/** One campus — the campus_rollups view plus that campus's own breakdowns. */
async function campusScope(campusId: string): Promise<AnalyticsScope> {
  const [rollup, funnel, pipeline] = await Promise.all([
    getCampusRollup(campusId),
    getCampusSessionFunnel(campusId),
    getCampusSchoolPipeline(campusId),
  ])

  return {
    label: rollup?.name ?? 'Your campus',
    schoolsReached: rollup?.schools_reached ?? 0,
    schoolsTotal: rollup?.schools_total ?? 0,
    sessionsCompleted: rollup?.sessions_completed ?? 0,
    studentsImpacted: rollup?.students_impacted ?? 0,
    volunteers: rollup?.volunteers ?? 0,
    targetSessions: rollup?.target_sessions ?? 0,
    targetStudents: rollup?.target_students ?? 0,
    funnel,
    pipeline,
  }
}

/**
 * Every campus — the same aggregates the admin analytics page already runs on,
 * reused rather than re-derived. These read the programme-wide views, which are
 * RLS-scoped like everything else; only a role holding view_analytics_all gets
 * here in the first place.
 */
async function programScope(): Promise<AnalyticsScope> {
  const [summary, funnel, pipeline] = await Promise.all([
    getProgramSummary(),
    getSessionFunnel(),
    getSchoolPipeline(),
  ])

  return {
    label: 'Every campus',
    schoolsReached: summary.schools_reached,
    schoolsTotal: summary.schools_total,
    sessionsCompleted: summary.sessions_completed,
    studentsImpacted: summary.students_impacted,
    volunteers: summary.active_volunteers,
    targetSessions: summary.target_sessions,
    targetStudents: summary.target_students,
    funnel,
    pipeline,
  }
}
