import { formatCurrency } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function monthLabel(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : `${MONTHS[d.getUTCMonth()]} '${String(d.getUTCFullYear()).slice(2)}`
}

/** Approved reimbursement spend by month, scoped to whatever campus RLS allows the caller to see. */
export function CampusSpendChart({ data }: { data: { month: string; approved_total: number }[] }) {
  if (data.length === 0) return null
  const max = Math.max(1, ...data.map((d) => d.approved_total))

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Approved spend by month</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-end gap-2" style={{ height: 160 }}>
          {data.map((d) => (
            <div key={d.month} className="flex flex-1 flex-col items-center justify-end gap-1">
              <div
                className="w-full rounded-t bg-brand-teal/80"
                style={{ height: `${(d.approved_total / max) * 128}px` }}
                title={`${monthLabel(d.month)}: ${formatCurrency(d.approved_total)}`}
              />
              <span className="text-[10px] text-muted-foreground">{monthLabel(d.month)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
