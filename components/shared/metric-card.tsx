import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  /** Percentage / delta vs previous period; sign drives the arrow + color. */
  trend?: number
  trendLabel?: string
  sublabel?: string
  className?: string
  variant?: 'default' | 'highlight'
}

/**
 * MetricCard — one impact number, given room to be the thing you read first.
 *
 * The number carries the emphasis on its own: it is the largest type on the
 * card by a wide margin, tabular so a row of cards aligns digit-for-digit, and
 * set in the foreground ink rather than a brand colour. Earlier this card had a
 * gradient fill, a blurred colour orb and a shadow that grew on hover, which
 * meant four of them side by side competed with each other and with the number
 * inside them. Warmth now comes from the surface and the border, and the only
 * saturated pixels are the small icon and a trend arrow that has actually moved.
 */
export function MetricCard({
  label, value, icon: Icon, trend, trendLabel, sublabel, className, variant = 'default',
}: MetricCardProps) {
  const trendDir = trend === undefined ? null : trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat'
  const TrendIcon = trendDir === 'up' ? ArrowUpRight : trendDir === 'down' ? ArrowDownRight : Minus

  return (
    <div
      className={cn(
        'rounded-xl border p-5 transition-colors duration-200',
        variant === 'highlight'
          ? 'border-brand/20 bg-cream-light'
          : 'border-border/60 bg-card hover:border-brand/25',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-semibold text-muted-foreground">{label}</p>
        {Icon && (
          <Icon
            aria-hidden
            className={cn(
              'size-4 shrink-0',
              variant === 'highlight' ? 'text-brand' : 'text-ink-orange',
            )}
          />
        )}
      </div>

      <div className="mt-3 flex items-end gap-2.5">
        <span className="text-4xl font-bold leading-none tracking-tight tabular-nums text-foreground">
          {value}
        </span>

        {trendDir && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 pb-0.5 text-sm font-bold',
              trendDir === 'up' && 'text-success',
              trendDir === 'down' && 'text-error',
              trendDir === 'flat' && 'text-text-tertiary',
            )}
          >
            <TrendIcon aria-hidden className="size-3.5" />
            {trend !== undefined && `${Math.abs(trend)}%`}
          </span>
        )}
      </div>

      {(sublabel || trendLabel) && (
        <p className="mt-2 text-xs font-medium text-text-tertiary">{sublabel ?? trendLabel}</p>
      )}
    </div>
  )
}

/**
 * Compact metric for inline display
 */
interface CompactMetricProps {
  label: string
  value: string | number
  icon?: LucideIcon
  className?: string
}

export function CompactMetric({ label, value, icon: Icon, className }: CompactMetricProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {Icon && (
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-cream-light text-ink-orange">
          <Icon aria-hidden className="size-4" />
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-lg font-bold tabular-nums">{value}</p>
      </div>
    </div>
  )
}
