import { School, CalendarCheck, GraduationCap, Users, Banknote } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import {
  getCampusRollup,
  getCampusSessionFunnel,
  getCampusSchoolPipeline,
} from '@/lib/data/campus-analytics'
import { getFinanceSummary, getMonthlyTrend } from '@/lib/data/finance'
import { formatCurrency, formatNumber } from '@/lib/format'
import { SESSION_STATUS_META, SCHOOL_STATUS_META, SCHOOL_PIPELINE } from '@/lib/constants/status'
import type { SessionStatus, SchoolStatus, StatusCount } from '@/types/database'
import { MetricCard } from '@/components/shared/metric-card'
import { StatusBreakdown, type BreakdownItem } from '@/components/analytics/status-breakdown'
import { CampusSpendChart } from '@/components/analytics/campus-spend-chart'
import { EmptyState } from '@/components/shared/states'

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

export default async function DashboardAnalyticsPage() {
  const user = await requireAccess('/dashboard/analytics')

  if (!user.campus_id) {
    return <EmptyState title="No campus assigned" description="Analytics need a campus to scope to." />
  }

  const [rollup, funnel, pipeline, finance, monthly] = await Promise.all([
    getCampusRollup(user.campus_id),
    getCampusSessionFunnel(user.campus_id),
    getCampusSchoolPipeline(user.campus_id),
    getFinanceSummary(),
    getMonthlyTrend(),
  ])

  const sessionPct = rollup && rollup.target_sessions > 0
    ? Math.round((rollup.sessions_completed / rollup.target_sessions) * 100)
    : undefined
  const studentPct = rollup && rollup.target_students > 0
    ? Math.round((rollup.students_impacted / rollup.target_students) * 100)
    : undefined

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          {rollup?.name ?? 'Your campus'}&rsquo;s impact vs. target and operational breakdowns.
        </p>
      </header>

      <section aria-label="Campus summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Schools reached" value={formatNumber(rollup?.schools_reached ?? 0)}
          icon={School} sublabel={`${formatNumber(rollup?.schools_total ?? 0)} in pipeline`}
        />
        <MetricCard
          label="Sessions verified" value={formatNumber(rollup?.sessions_completed ?? 0)}
          icon={CalendarCheck}
          sublabel={sessionPct !== undefined ? `${sessionPct}% of ${formatNumber(rollup!.target_sessions)} target` : undefined}
        />
        <MetricCard
          label="Students impacted" value={formatNumber(rollup?.students_impacted ?? 0)}
          icon={GraduationCap}
          sublabel={studentPct !== undefined ? `${studentPct}% of ${formatNumber(rollup!.target_students)} target` : undefined}
        />
        <MetricCard label="Active volunteers" value={formatNumber(rollup?.volunteers ?? 0)} icon={Users} />
        <MetricCard
          label="Approved spend" value={formatCurrency(finance.approved_total)}
          icon={Banknote} sublabel={`${formatNumber(finance.pending_count)} claims pending review`}
        />
      </section>

      <CampusSpendChart data={monthly} />

      <section aria-label="Operational breakdowns" className="grid gap-4 lg:grid-cols-2">
        <StatusBreakdown title="Session funnel" items={orderedItems(funnel, SESSION_ORDER, SESSION_STATUS_META)} />
        <StatusBreakdown title="School pipeline" items={orderedItems(pipeline, SCHOOL_ORDER, SCHOOL_STATUS_META)} />
      </section>
    </div>
  )
}
