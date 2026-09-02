import { cn } from '@/lib/utils'
import { curriculumStageLabel } from '@/lib/constants/sessions'

/** The core curriculum is four sessions (CURRICULUM_META); anything past it is a bonus. */
const CORE_SESSIONS = 4

interface CurriculumProgressProps {
  /** Highest session number reached, or null/0 for a school that hasn't started. */
  sessionNumber: number | null | undefined
  /** `full` adds the stage name beneath — for detail pages and cards, not table cells. */
  variant?: 'compact' | 'full'
  className?: string
}

/**
 * CurriculumProgress — where a school sits in its four-session AI journey.
 *
 * Four segments rather than a percentage bar, because the curriculum is four
 * discrete sessions and "3 of 4" is the number a lead actually reasons about;
 * a 75% bar hides which session comes next. Schools that run past session four
 * get a "+n" chip instead of an overflowing bar.
 *
 * The segments are decorative — `role="img"` with a full-sentence label carries
 * the same information to a screen reader in one read, and the visible "n/4"
 * text keeps it legible without relying on the segment colours at all.
 */
export function CurriculumProgress({
  sessionNumber,
  variant = 'compact',
  className,
}: CurriculumProgressProps) {
  const reached = Math.max(0, sessionNumber ?? 0)
  const filled = Math.min(reached, CORE_SESSIONS)
  const bonus = Math.max(0, reached - CORE_SESSIONS)

  if (reached === 0) {
    return (
      <span className={cn('text-xs font-medium text-text-tertiary', className)}>Not started</span>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        role="img"
        aria-label={`Session ${reached} of ${CORE_SESSIONS} — ${curriculumStageLabel(reached)}`}
        className="flex items-center gap-1"
      >
        {Array.from({ length: CORE_SESSIONS }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 w-5 rounded-full transition-colors',
              i < filled
                ? 'bg-gradient-to-r from-brand to-brand-orange'
                : 'bg-cream-warm ring-1 ring-inset ring-border/60',
            )}
          />
        ))}
      </div>

      <span className="text-xs font-bold tabular-nums text-foreground">
        {filled}/{CORE_SESSIONS}
        {bonus > 0 && <span className="ml-1 font-semibold text-ink-orange">+{bonus}</span>}
      </span>

      {variant === 'full' && (
        <span className="truncate text-xs font-medium text-muted-foreground">
          {curriculumStageLabel(reached)}
        </span>
      )}
    </div>
  )
}
