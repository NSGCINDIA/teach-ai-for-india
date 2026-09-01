import { Check, Info } from 'lucide-react'
import type { OperationalPhase, SchoolStatus } from '@/types/database'
import { SCHOOL_PIPELINE, SCHOOL_STATUS_META } from '@/lib/constants/status'
import { getOperationalProgress } from '@/lib/constants/operational-phases'
import type { SchoolTabId } from '@/lib/schools/next-action'
import { StageOverrideDialog } from '@/components/schools/stage-override-dialog'
import { cn } from '@/lib/utils'

interface LifecycleRailProps {
  schoolId: string
  status: SchoolStatus
  operationalPhase: OperationalPhase | null
  requiredVolunteers: number
  confirmedVolunteers: number
  /** Super admin — the only role that may override the stage manually. */
  isAdmin: boolean
  /** Which tabs exist for this viewer, so a milestone never links into nothing. */
  availableTabs: readonly SchoolTabId[]
}

/**
 * The six execution milestones inside `sessions_active`, each pointing at the
 * tab where that work is actually done. Same six the standalone
 * OperationalProgress card used to list as decoration.
 */
const MILESTONES: { label: string; short: string; tab: SchoolTabId }[] = [
  { label: 'Volunteer Team', short: 'Team', tab: 'team' },
  { label: 'Execution Plan', short: 'Plan', tab: 'execution' },
  { label: 'Session 1', short: 'S1', tab: 'sessions' },
  { label: 'Session 2', short: 'S2', tab: 'sessions' },
  { label: 'Session 3', short: 'S3', tab: 'sessions' },
  { label: 'Session 4', short: 'S4', tab: 'sessions' },
]

/**
 * One lifecycle picture instead of three.
 *
 * The page used to stack a seven-box pipeline grid, a separate execution
 * progress card with its own bar and six chips, and the session hub's own strip
 * — none of which you could click. This is a single rail: the pipeline on top,
 * and, once a school is live, the execution sub-track beneath it, where every
 * milestone links to the tab that owns it. The rail therefore doubles as the
 * page's secondary navigation.
 */
export function LifecycleRail({
  schoolId,
  status,
  operationalPhase,
  requiredVolunteers,
  confirmedVolunteers,
  isAdmin,
  availableTabs,
}: LifecycleRailProps) {
  const currentIndex = SCHOOL_PIPELINE.indexOf(status)
  const isArchived = status === 'archived'
  const isLive = status === 'sessions_active' || status === 'completed'
  const isCompleted = status === 'completed'

  const { percent, label, currentStep } = getOperationalProgress(operationalPhase)
  const shownPercent = isCompleted ? 100 : percent

  return (
    <section aria-label="Lifecycle" className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Lifecycle
          <span
            title="Stages advance automatically as outreach approval, onboarding, team confirmation, execution approval and sessions succeed."
            className="text-muted-foreground/70"
          >
            <Info aria-hidden className="size-3.5" />
          </span>
        </h2>

        {isAdmin && status !== 'completed' && (
          <StageOverrideDialog schoolId={schoolId} current={status} />
        )}
      </div>

      {/* One row that scrolls sideways on a phone, rather than the grid of seven
          boxes that used to push everything else below the fold. */}
      <ol className="scroll-strip flex items-stretch gap-1.5">
        {SCHOOL_PIPELINE.map((step, idx) => {
          const done = !isArchived && currentIndex >= 0 && idx < currentIndex
          const current = step === status

          return (
            <li key={step} className="min-w-0 flex-1 basis-28">
              <div
                aria-current={current ? 'step' : undefined}
                className={cn(
                  'flex h-full flex-col justify-between gap-1.5 rounded-lg border px-2.5 py-2 transition-colors',
                  current && 'border-brand bg-brand text-white shadow-soft',
                  done && 'border-success/30 bg-success/5',
                  !current && !done && 'border-border/70 bg-muted/20',
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider tabular-nums',
                      current ? 'text-white/70' : done ? 'text-ink-green' : 'text-muted-foreground/70',
                    )}
                  >
                    {idx + 1}
                  </span>
                  {done && <Check aria-hidden className="size-3 text-success" />}
                  {current && <span aria-hidden className="size-1.5 rounded-full bg-white" />}
                </div>
                <span
                  className={cn(
                    'text-xs leading-tight',
                    current ? 'font-bold text-white' : done ? 'font-medium text-ink-green' : 'text-muted-foreground',
                  )}
                >
                  {SCHOOL_STATUS_META[step].label}
                </span>
              </div>
            </li>
          )
        })}
      </ol>

      {isArchived && (
        <p className="mt-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground">
          This school is archived and is not moving through the pipeline.
        </p>
      )}

      {isLive && (
        <div className="mt-4 space-y-2.5 border-t border-border/60 pt-3.5">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <p className="text-xs font-semibold text-foreground">
              Execution workflow
              <span className="ml-2 font-medium text-muted-foreground">
                {isCompleted ? 'Program complete' : label}
              </span>
            </p>
            <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
              {requiredVolunteers > 0 && (
                <span className="tabular-nums">Team {confirmedVolunteers}/{requiredVolunteers}</span>
              )}
              <span className="font-display text-sm font-bold text-foreground tabular-nums">{shownPercent}%</span>
            </div>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-500"
              style={{ width: `${shownPercent}%` }}
            />
          </div>

          <ol className="scroll-strip flex gap-1.5">
            {MILESTONES.map((m, idx) => {
              const stepNum = idx + 1
              const done = isCompleted || currentStep > stepNum
              const current = !isCompleted && currentStep === stepNum
              const linkable = availableTabs.includes(m.tab)

              const chipClass = cn(
                'flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                done && 'border-success/30 bg-success/10 text-ink-green',
                current && 'border-brand bg-brand/10 font-semibold text-brand',
                !done && !current && 'border-border/70 bg-muted/20 text-muted-foreground',
                linkable && 'hover:border-brand hover:text-brand',
              )

              const body = (
                <>
                  {done && <Check aria-hidden className="size-3" />}
                  <span className="sm:hidden">{m.short}</span>
                  <span className="hidden sm:inline">{m.label}</span>
                </>
              )

              return (
                <li key={m.label}>
                  {linkable ? (
                    <a href={`#${m.tab}`} className={chipClass}>{body}</a>
                  ) : (
                    <span className={chipClass}>{body}</span>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </section>
  )
}
