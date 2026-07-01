import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { CampusPerformance } from '@/types/database'
import { formatCurrency, formatDate, formatNumber } from '@/lib/format'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/states'

function pct(actual: number, target: number): number {
  if (target <= 0) return 0
  return Math.round((actual / target) * 100)
}

/** A cell showing "actual / target" with a proportional bar (< 60% flagged warning per PRD §7.8). */
function TargetCell({ actual, target }: { actual: number; target: number }) {
  const p = pct(actual, target)
  const color = p < 60 ? 'bg-warning' : p < 100 ? 'bg-brand' : 'bg-success'
  return (
    <div className="min-w-28">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-semibold tabular-nums">{formatNumber(actual)}</span>
        <span className="text-xs text-muted-foreground tabular-nums">/ {formatNumber(target)}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${Math.min(100, p)}%` }} />
      </div>
    </div>
  )
}

/** Tier 2 — per-campus performance vs target (PRD §7.8 / US-ANLT-02). */
export function CampusPerformanceTable({ campuses }: { campuses: CampusPerformance[] }) {
  if (campuses.length === 0) {
    return <EmptyState title="No campuses yet" description="Campus rollups appear once campuses are active." />
  }
  return (
    <Card className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="p-3 font-medium">Campus</th>
            <th className="p-3 font-medium">Schools</th>
            <th className="p-3 font-medium">Sessions</th>
            <th className="p-3 font-medium">Students</th>
            <th className="p-3 font-medium">Volunteers</th>
            <th className="p-3 font-medium">Spend</th>
            <th className="p-3 font-medium">Last session</th>
          </tr>
        </thead>
        <tbody>
          {campuses.map((c) => (
            <tr key={c.campus_id} className="border-b last:border-0 hover:bg-accent/40">
              <td className="p-3">
                <Link href={`/campuses/${c.slug}`} className="font-medium hover:text-brand hover:underline">
                  {c.name}
                </Link>
                {c.quarter && <span className="ml-2 text-xs text-muted-foreground">{c.quarter}</span>}
              </td>
              <td className="p-3"><TargetCell actual={c.schools_reached} target={c.target_schools} /></td>
              <td className="p-3"><TargetCell actual={c.sessions_completed} target={c.target_sessions} /></td>
              <td className="p-3"><TargetCell actual={c.students_impacted} target={c.target_students} /></td>
              <td className="p-3 tabular-nums">{formatNumber(c.volunteers)}</td>
              <td className="p-3 tabular-nums">{formatCurrency(c.approved_spend)}</td>
              <td className="p-3 text-muted-foreground">{formatDate(c.last_session_date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
