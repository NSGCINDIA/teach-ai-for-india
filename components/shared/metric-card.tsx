import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface MetricCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  /** Percentage / delta vs previous period; sign drives the arrow + color. */
  trend?: number
  trendLabel?: string
  sublabel?: string
  className?: string
}

/**
 * MetricCard (PRD §12.3) — large number, label, trend arrow, optional sublabel.
 * Used across every dashboard tier.
 */
export function MetricCard({
  label, value, icon: Icon, trend, trendLabel, sublabel, className,
}: MetricCardProps) {
  const trendDir = trend === undefined ? null : trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat'
  const TrendIcon = trendDir === 'up' ? ArrowUpRight : trendDir === 'down' ? ArrowDownRight : Minus

  return (
    <Card className={cn('p-5 shadow-soft transition-shadow hover:shadow-soft-lg', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground">
            <Icon className="size-5" aria-hidden />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="font-display text-3xl font-bold tracking-tight tabular-nums">{value}</span>
        {trendDir && (
          <span
            className={cn(
              'mb-1 inline-flex items-center gap-0.5 text-xs font-semibold',
              trendDir === 'up' && 'text-success',
              trendDir === 'down' && 'text-error',
              trendDir === 'flat' && 'text-muted-foreground',
            )}
          >
            <TrendIcon className="size-3.5" aria-hidden />
            {trend !== undefined && `${Math.abs(trend)}%`}
          </span>
        )}
      </div>
      {(sublabel || trendLabel) && (
        <p className="mt-1 text-xs text-muted-foreground">{sublabel ?? trendLabel}</p>
      )}
    </Card>
  )
}
