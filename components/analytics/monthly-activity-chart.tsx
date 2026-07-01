import type { MonthlyActivity } from '@/types/database'
import { formatNumber } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function monthLabel(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : `${MONTHS[d.getUTCMonth()]} '${String(d.getUTCFullYear()).slice(2)}`
}

/** Verified-sessions trend (PRD §7.8). Pure-CSS bars — no chart lib. */
export function MonthlyActivityChart({ data }: { data: MonthlyActivity[] }) {
  if (data.length === 0) return null
  const max = Math.max(1, ...data.map((d) => d.sessions_completed))

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Verified sessions by month</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-end gap-2" style={{ height: 160 }}>
          {data.map((d) => (
            <div key={d.month} className="flex flex-1 flex-col items-center justify-end gap-1">
              <div
                className="w-full rounded-t bg-brand/80"
                style={{ height: `${(d.sessions_completed / max) * 128}px` }}
                title={`${monthLabel(d.month)}: ${formatNumber(d.sessions_completed)} sessions, ${formatNumber(d.students_impacted)} students`}
              />
              <span className="text-[10px] text-muted-foreground">{monthLabel(d.month)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
