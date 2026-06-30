import { cn } from '@/lib/utils'

interface ProgressRingProps {
  /** 0–100. Values below 60 render in the warning/danger color (PRD §7.8 < 60% flag). */
  value: number
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
  className?: string
}

/**
 * ProgressRing (PRD §12.3) — circular progress for campus target tracking.
 * Pure SVG (no chart lib), accessible via role="img" + aria-label.
 */
export function ProgressRing({
  value, size = 92, strokeWidth = 8, label, sublabel, className,
}: ProgressRingProps) {
  const pct = Math.max(0, Math.min(100, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference
  const color = pct < 60 ? 'var(--warning)' : pct < 100 ? 'var(--brand)' : 'var(--success)'

  return (
    <div className={cn('relative inline-grid place-items-center', className)}>
      <svg
        width={size}
        height={size}
        role="img"
        aria-label={`${label ? `${label}: ` : ''}${Math.round(pct)} percent`}
        className="-rotate-90"
      >
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <span className="font-display text-lg font-bold tabular-nums">{Math.round(pct)}%</span>
        {sublabel && <span className="text-[10px] text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  )
}
