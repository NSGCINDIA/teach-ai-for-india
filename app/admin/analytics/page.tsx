import { School, CalendarCheck, GraduationCap, Users, Building2, Banknote } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import {
  getProgramSummary,
  listCampusPerformance,
  getSessionFunnel,
  getSchoolPipeline,
  getMonthlyActivity,
} from '@/lib/data/analytics'
import { formatCurrency, formatNumber } from '@/lib/format'
import { SESSION_STATUS_META, SCHOOL_STATUS_META, SCHOOL_PIPELINE } from '@/lib/constants/status'
import type { SessionStatus, SchoolStatus, StatusCount } from '@/types/database'
import { MetricCard } from '@/components/shared/metric-card'
import { CampusPerformanceTable } from '@/components/analytics/campus-performance-table'
import { StatusBreakdown, type BreakdownItem } from '@/components/analytics/status-breakdown'
import { MonthlyActivityChart } from '@/components/analytics/monthly-activity-chart'
import { ExportMenu } from '@/components/analytics/export-menu'

export const metadata = { title: 'Analytics · Admin' }

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

export default async function AdminAnalyticsPage() {
  const user = await requireAccess('/admin/analytics')
  const canExport = can(user.role, 'export_data') !== false
  const [summary, campuses, funnel, pipeline, monthly] = await Promise.all([
    getProgramSummary(),
    listCampusPerformance(),
    getSessionFunnel(),
    getSchoolPipeline(),
    getMonthlyActivity(),
  ])

  const sessionPct =
    summary.target_sessions > 0
      ? Math.round((summary.sessions_completed / summary.target_sessions) * 100)
      : undefined
  const studentPct =
    summary.target_students > 0
      ? Math.round((summary.students_impacted / summary.target_students) * 100)
      : undefined

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Program-wide impact, campus performance vs target, and operational breakdowns.
          </p>
        </div>
        {canExport && <ExportMenu />}
      </header>

      {/* Tier 1 — management summary (PRD §7.8 / US-ANLT-01) */}
      <section aria-label="Program summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Schools reached" value={formatNumber(summary.schools_reached)}
          icon={School} sublabel={`${formatNumber(summary.schools_total)} in pipeline`}
        />
        <MetricCard
          label="Sessions verified" value={formatNumber(summary.sessions_completed)}
          icon={CalendarCheck}
          sublabel={sessionPct !== undefined ? `${sessionPct}% of ${formatNumber(summary.target_sessions)} target` : undefined}
        />
        <MetricCard
          label="Students impacted" value={formatNumber(summary.students_impacted)}
          icon={GraduationCap}
          sublabel={studentPct !== undefined ? `${studentPct}% of ${formatNumber(summary.target_students)} target` : undefined}
        />
        <MetricCard
          label="Active volunteers" value={formatNumber(summary.active_volunteers)}
          icon={Users} sublabel={`${formatNumber(summary.active_campuses)} campuses · ${formatNumber(summary.states_count)} states`}
        />
        <MetricCard
          label="Approved spend" value={formatCurrency(summary.approved_spend)}
          icon={Banknote} sublabel={`${formatNumber(summary.pending_claims)} claims pending review`}
        />
        <MetricCard
          label="Active campuses" value={formatNumber(summary.active_campuses)}
          icon={Building2} sublabel={`across ${formatNumber(summary.states_count)} states`}
        />
      </section>

      <MonthlyActivityChart data={monthly} />

      {/* Tier 2 — campus performance (PRD §7.8 / US-ANLT-02) */}
      <section aria-label="Campus performance" className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Campus performance vs target</h2>
        <CampusPerformanceTable campuses={campuses} />
      </section>

      {/* Tier 3 — operational breakdowns */}
      <section aria-label="Operational breakdowns" className="grid gap-4 lg:grid-cols-2">
        <StatusBreakdown title="Session funnel" items={orderedItems(funnel, SESSION_ORDER, SESSION_STATUS_META)} />
        <StatusBreakdown title="School pipeline" items={orderedItems(pipeline, SCHOOL_ORDER, SCHOOL_STATUS_META)} />
      </section>
    </div>
  )
}
