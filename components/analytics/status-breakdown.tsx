import { cn } from '@/lib/utils'
import { TONE_CLASS, type StatusTone } from '@/lib/constants/status'
import { formatNumber } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/states'

export interface BreakdownItem {
  label: string
  count: number
  tone: StatusTone
}

/** Horizontal proportional bars for a status breakdown (session funnel / school pipeline). */
export function StatusBreakdown({ title, items }: { title: string; items: BreakdownItem[] }) {
  const total = items.reduce((sum, i) => sum + i.count, 0)
  const max = Math.max(1, ...items.map((i) => i.count))

  return (
    <Card>
      <CardHeader className="flex-row items-baseline justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <span className="text-sm text-muted-foreground tabular-nums">{formatNumber(total)} total</span>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState title="No data yet" description="Records will appear here as the team logs activity." />
        ) : (
          <ul className="space-y-2.5">
            {items.map((i) => (
              <li key={i.label} className="grid grid-cols-[10rem_1fr_auto] items-center gap-3">
                <span className="truncate text-sm font-medium">{i.label}</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full', TONE_CLASS[i.tone].split(' ')[0])}
                    style={{ width: `${(i.count / max) * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-semibold tabular-nums">{formatNumber(i.count)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
