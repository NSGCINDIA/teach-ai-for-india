'use client'

import { useId, useState } from 'react'
import { formatCurrency } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/states'
import type { TravelMode } from '@/types/database'

const TRAVEL_MODE_LABEL: Record<TravelMode, string> = {
  auto: 'Auto', bus: 'Bus', cab: 'Cab', train: 'Train',
  own_vehicle: 'Own vehicle', other: 'Other',
}

// Fixed-order categorical theme (chart-1..6, validated: OKLCH lightness band
// 0.43-0.77, chroma >= 0.10, adjacent-pair CVD + normal-vision Delta E clear
// of the floor — see the token comment in globals.css). Frozen order, never
// cycled or reassigned per render.
const SLOTS = [
  { bg: 'bg-chart-1', stroke: 'stroke-chart-1' },
  { bg: 'bg-chart-2', stroke: 'stroke-chart-2' },
  { bg: 'bg-chart-3', stroke: 'stroke-chart-3' },
  { bg: 'bg-chart-4', stroke: 'stroke-chart-4' },
  { bg: 'bg-chart-5', stroke: 'stroke-chart-5' },
  { bg: 'bg-chart-6', stroke: 'stroke-chart-6' },
] as const

const SIZE = 176
const STROKE = 30
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP_PX = 3 // surface-color gap between adjacent wedges

/**
 * Approved spend by travel mode — a donut, not a bar: this is a genuinely
 * nominal category (reordering auto/bus/cab doesn't change its meaning), and
 * with <= 6 segments it's the one figure on this page suited to "part-to-whole
 * at a glance" (dataviz skill, anti-patterns). Values stay directly readable
 * in the legend rather than resting on angle judgment alone.
 */
export function SpendByModeChart({ data }: { data: { travel_mode: TravelMode; total: number }[] }) {
  const gradientId = useId()
  const [hovered, setHovered] = useState<number | null>(null)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Approved spend by travel mode</CardTitle></CardHeader>
        <CardContent>
          <EmptyState title="No data yet" description="Approved claims will appear here once reimbursements are paid out." />
        </CardContent>
      </Card>
    )
  }

  const total = data.reduce((sum, d) => sum + d.total, 0)
  let offset = 0
  const segments = data.map((d, i) => {
    const fraction = total > 0 ? d.total / total : 0
    const length = Math.max(0, fraction * CIRCUMFERENCE - GAP_PX)
    const dashoffset = -offset
    offset += fraction * CIRCUMFERENCE
    return { ...d, fraction, length, dashoffset, slot: SLOTS[i % SLOTS.length] }
  })

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Approved spend by travel mode</CardTitle></CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <svg
            width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
            role="img" aria-labelledby={`${gradientId}-title`}
            className="shrink-0 -rotate-90"
          >
            <title id={`${gradientId}-title`}>Approved spend by travel mode, {formatCurrency(total)} total</title>
            <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" className="stroke-muted" strokeWidth={STROKE} />
            {segments.map((s, i) => (
              <circle
                key={s.travel_mode}
                cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none"
                strokeWidth={STROKE}
                strokeDasharray={`${s.length} ${CIRCUMFERENCE - s.length}`}
                strokeDashoffset={s.dashoffset}
                className={`${s.slot.stroke} transition-opacity duration-150`}
                style={{ opacity: hovered === null || hovered === i ? 1 : 0.35 }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <title>{`${TRAVEL_MODE_LABEL[s.travel_mode]}: ${formatCurrency(s.total)} (${Math.round(s.fraction * 100)}%)`}</title>
              </circle>
            ))}
          </svg>

          <ul className="w-full space-y-2">
            {segments.map((s, i) => (
              <li
                key={s.travel_mode}
                className="grid grid-cols-[0.9rem_1fr_auto_2.5rem] items-center gap-2.5 rounded-md px-1 py-0.5 transition-colors"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ backgroundColor: hovered === i ? 'var(--muted)' : undefined }}
              >
                <span aria-hidden className={`size-2.5 rounded-full ${s.slot.bg}`} />
                <span className="truncate text-sm font-medium">{TRAVEL_MODE_LABEL[s.travel_mode]}</span>
                <span className="text-sm font-semibold tabular-nums">{formatCurrency(s.total)}</span>
                <span className="text-right text-xs font-medium text-muted-foreground tabular-nums">
                  {Math.round(s.fraction * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{formatCurrency(total)} total across {data.length} mode{data.length === 1 ? '' : 's'}.</p>
      </CardContent>
    </Card>
  )
}
