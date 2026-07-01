import Link from 'next/link'
import { ArrowRight, BellRing, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TONE_CLASS } from '@/lib/constants/status'
import { formatNumber } from '@/lib/format'
import type { AdminAlert } from '@/lib/data/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/** Always-on operational alert feed (PRD §7.9 — 6 alert types). */
export function AlertFeed({ alerts }: { alerts: AdminAlert[] }) {
  const active = alerts.filter((a) => a.count > 0)

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <BellRing className="size-4 text-brand" aria-hidden />
        <CardTitle className="text-base">Needs attention</CardTitle>
        {active.length > 0 && (
          <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-primary-foreground">
            {active.length}
          </span>
        )}
      </CardHeader>
      <CardContent>
        {active.length === 0 ? (
          <p className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-success" /> All clear — nothing needs your attention right now.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {active.map((a) => (
              <li key={a.key}>
                <Link
                  href={a.href}
                  className="group flex items-center gap-3 py-2.5 transition-colors hover:text-brand"
                >
                  <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold tabular-nums', TONE_CLASS[a.tone])}>
                    {formatNumber(a.count)}
                  </span>
                  <span className="flex-1 text-sm">{a.label}</span>
                  <ArrowRight className="size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
