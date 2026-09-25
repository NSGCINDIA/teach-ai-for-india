import { formatCurrency } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/states'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function monthLabel(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : `${MONTHS[d.getUTCMonth()]} '${String(d.getUTCFullYear()).slice(2)}`
}

/**
 * Approved reimbursement spend by month, scoped to whatever campus RLS allows
 * the caller to see. One series (magnitude over time), so one hue and no
 * legend box — the card title already says what's plotted (dataviz skill:
 * "a single series needs no legend"). Every bar carries its own hover/focus
 * tooltip; the most recent month is also direct-labelled, per the "label
 * selectively" rule rather than a number stamped on every bar.
 */
export function CampusSpendChart({ data }: { data: { month: string; approved_total: number }[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Approved spend by month</CardTitle></CardHeader>
        <CardContent>
          <EmptyState title="No data yet" description="Approved claims will appear here once reimbursements are paid out." />
        </CardContent>
      </Card>
    )
  }

  const max = Math.max(1, ...data.map((d) => d.approved_total))
  const lastIndex = data.length - 1

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Approved spend by month</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-end gap-2" style={{ height: 176 }}>
          {data.map((d, i) => {
            const barHeight = Math.round((d.approved_total / max) * 128)
            return (
              <div key={d.month} className="group/bar relative flex flex-1 flex-col items-center justify-end gap-1">
                {/* Hover/focus tooltip — value leads, month follows (dataviz skill: "values lead, labels follow"). */}
                <div
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full mb-1.5 whitespace-nowrap rounded-md border border-border/60 bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-soft transition-opacity duration-100 group-hover/bar:opacity-100 group-focus-within/bar:opacity-100"
                >
                  <span className="font-bold tabular-nums">{formatCurrency(d.approved_total)}</span>
                  <span className="ml-1 text-muted-foreground">{monthLabel(d.month)}</span>
                </div>

                {i === lastIndex && (
                  <span className="text-[10px] font-bold tabular-nums text-foreground">
                    {formatCurrency(d.approved_total)}
                  </span>
                )}

                <button
                  type="button"
                  aria-label={`${monthLabel(d.month)}: ${formatCurrency(d.approved_total)}`}
                  className="w-full max-w-7 rounded-t-[4px] bg-chart-3 transition-opacity duration-100 hover:opacity-80 focus-visible:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                  style={{ height: Math.max(barHeight, 2) }}
                />
                <span className="text-[10px] text-muted-foreground">{monthLabel(d.month)}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
