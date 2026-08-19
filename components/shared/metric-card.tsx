import { ArrowDownRight, ArrowUpRight, Minus, TrendingUp, type LucideIcon } from 'lucide-react'
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
 * MetricCard — Impact-first large visual treatment for TAI dashboard.
 * Emphasizes the number and makes impact metrics feel significant.
 */
export function MetricCard({
  label, value, icon: Icon, trend, trendLabel, sublabel, className, variant = 'default',
}: MetricCardProps) {
  const trendDir = trend === undefined ? null : trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat'
  const TrendIcon = trendDir === 'up' ? ArrowUpRight : trendDir === 'down' ? ArrowDownRight : Minus

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border transition-all duration-300',
        variant === 'highlight' 
          ? 'bg-gradient-to-br from-cream-light to-secondary/30 border-brand/20 shadow-warm hover:shadow-soft-lg hover:border-brand/30'
          : 'bg-card border-border/50 shadow-soft hover:shadow-soft-lg hover:border-brand/20',
        className
      )}
    >
      {/* Background decoration for highlight variant */}
      {variant === 'highlight' && (
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-brand/5 blur-2xl" />
      )}

      <div className="relative p-6">
        {/* Header: Label + Icon */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
            {label}
          </p>
          {Icon && (
            <span className={cn(
              "grid size-10 place-items-center rounded-lg transition-colors",
              variant === 'highlight' 
                ? 'bg-brand/10 text-brand'
                : 'bg-cream-light text-brand-orange'
            )}>
              <Icon className="size-5" aria-hidden />
            </span>
          )}
        </div>

        {/* Large Value */}
        <div className="flex items-end gap-3 mb-2">
          <span className={cn(
            "font-bold tracking-tight tabular-nums leading-none",
            variant === 'highlight' ? 'text-4xl lg:text-5xl' : 'text-3xl lg:text-4xl'
          )}>
            {value}
          </span>
          
          {/* Trend Indicator */}
          {trendDir && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-sm font-bold pb-1',
                trendDir === 'up' && 'text-success',
                trendDir === 'down' && 'text-error',
                trendDir === 'flat' && 'text-muted-foreground',
              )}
            >
              <TrendIcon className="size-4" aria-hidden />
              {trend !== undefined && `${Math.abs(trend)}%`}
            </span>
          )}
        </div>

        {/* Supporting Text */}
        {(sublabel || trendLabel) && (
          <p className="text-xs text-muted-foreground font-medium">
            {sublabel ?? trendLabel}
          </p>
        )}
      </div>
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
        <span className="grid size-8 place-items-center rounded-lg bg-cream-light text-brand-orange">
          <Icon className="size-4" aria-hidden />
        </span>
      )}
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-lg font-bold tabular-nums">{value}</p>
      </div>
    </div>
  )
}
