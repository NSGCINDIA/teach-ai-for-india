import { cn } from '@/lib/utils'

/**
 * The TAI mark — a small four-node neural graph — for empty states and image
 * fallbacks. Sized by its container.
 *
 * There used to be a second export here, NeuralNetworkBackground, which painted
 * the same motif as a full-panel texture behind the dashboard heroes. It was
 * removed: at hero scale the graph competed with the greeting and the impact
 * numbers instead of sitting behind them, and the panel reads better with the
 * heading carrying it alone. The motif still earns its place at this size, where
 * it is the subject rather than the wallpaper.
 */
export function NeuralDecoration({ className = '' }: { className?: string }) {
  // cn (tailwind-merge) so a caller passing its own `opacity-*` replaces the
  // default instead of emitting two conflicting utilities.
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn('opacity-30', className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="tai-neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--brand-deep-maroon)" />
          <stop offset="100%" stopColor="var(--brand-orange)" />
        </linearGradient>
      </defs>
      <g stroke="url(#tai-neural-gradient)" strokeWidth="1.5" fill="none">
        <line x1="20" y1="30" x2="50" y2="60" />
        <line x1="50" y1="60" x2="80" y2="45" />
        <line x1="50" y1="60" x2="70" y2="90" />
      </g>
      <circle cx="20" cy="30" r="4" fill="url(#tai-neural-gradient)" opacity="0.6" />
      <circle cx="50" cy="60" r="5" fill="url(#tai-neural-gradient)" opacity="0.85" />
      <circle cx="80" cy="45" r="4" fill="url(#tai-neural-gradient)" opacity="0.6" />
      <circle cx="70" cy="90" r="4" fill="url(#tai-neural-gradient)" opacity="0.6" />
    </svg>
  )
}
