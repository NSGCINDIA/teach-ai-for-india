import { requireAccess } from '@/lib/auth/user'
import { getProgramSummary, listCampusPerformance } from '@/lib/data/analytics'
import { formatCurrency, formatNumber, formatDate } from '@/lib/format'
import { PrintButton } from '@/components/analytics/print-button'

export const metadata = { title: 'Management Summary · Admin' }

function pct(actual: number, target: number): string {
  return target > 0 ? `${Math.round((actual / target) * 100)}%` : '—'
}

/** Print-optimized management summary — a clean one-pager for Save-as-PDF (PRD §7.8). */
export default async function ManagementSummaryPage() {
  await requireAccess('/admin/analytics')
  const [summary, campuses] = await Promise.all([getProgramSummary(), listCampusPerformance()])
  const generated = formatDate(new Date())

  const kpis = [
    { label: 'Schools reached', value: formatNumber(summary.schools_reached), sub: `${formatNumber(summary.schools_total)} in pipeline` },
    { label: 'Sessions verified', value: formatNumber(summary.sessions_completed), sub: pct(summary.sessions_completed, summary.target_sessions) + ' of target' },
    { label: 'Students impacted', value: formatNumber(summary.students_impacted), sub: pct(summary.students_impacted, summary.target_students) + ' of target' },
    { label: 'Active volunteers', value: formatNumber(summary.active_volunteers), sub: `${formatNumber(summary.active_campuses)} campuses` },
    { label: 'Approved spend', value: formatCurrency(summary.approved_spend), sub: `${formatNumber(summary.pending_claims)} claims pending` },
    { label: 'Reach', value: `${formatNumber(summary.active_campuses)} / ${formatNumber(summary.states_count)}`, sub: 'campuses / states' },
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-6 print:max-w-none">
      <header className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Management summary</h1>
          <p className="mt-1 text-sm text-muted-foreground">Teach AI for India · Generated {generated}</p>
        </div>
        <PrintButton />
      </header>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Program at a glance</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className="mt-1 font-display text-2xl font-bold tabular-nums">{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Campus performance</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Campus</th>
              <th className="py-2 pr-3 font-medium">Schools</th>
              <th className="py-2 pr-3 font-medium">Sessions</th>
              <th className="py-2 pr-3 font-medium">Students</th>
              <th className="py-2 pr-3 font-medium">Vols</th>
              <th className="py-2 font-medium">Spend</th>
            </tr>
          </thead>
          <tbody>
            {campuses.map((c) => (
              <tr key={c.campus_id} className="border-b last:border-0">
                <td className="py-2 pr-3 font-medium">{c.name}</td>
                <td className="py-2 pr-3 tabular-nums">{formatNumber(c.schools_reached)} <span className="text-muted-foreground">/ {formatNumber(c.target_schools)}</span></td>
                <td className="py-2 pr-3 tabular-nums">{formatNumber(c.sessions_completed)} <span className="text-muted-foreground">/ {formatNumber(c.target_sessions)}</span></td>
                <td className="py-2 pr-3 tabular-nums">{formatNumber(c.students_impacted)} <span className="text-muted-foreground">/ {formatNumber(c.target_students)}</span></td>
                <td className="py-2 pr-3 tabular-nums">{formatNumber(c.volunteers)}</td>
                <td className="py-2 tabular-nums">{formatCurrency(c.approved_spend)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
