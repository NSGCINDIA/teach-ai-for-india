import { ArrowRight, CircleAlert, CircleCheck, Clock3 } from 'lucide-react'
import type { SchoolNextAction, SchoolTabId } from '@/lib/schools/next-action'
import { SCHOOL_STATUS_META } from '@/lib/constants/status'
import { OPERATIONAL_PHASE_META } from '@/lib/constants/operational-phases'
import type { OperationalPhase, SchoolStatus } from '@/types/database'
import { formatElapsed } from '@/lib/format'
import { cn } from '@/lib/utils'

interface SchoolCommandBarProps {
  readonly status: SchoolStatus
  readonly operationalPhase: OperationalPhase | null
  readonly next: SchoolNextAction
  /**
   * Label for the button that jumps to the tab owning the next action, or null
   * when there is nowhere to send this viewer — the tab is not rendered for
   * their role, or the school has no outstanding work.
   */
  readonly actionTabLabel: string | null
  /** When the school last changed stage — the newest school_status_history row. */
  readonly stageSince?: string | null
}

/** The most a chip row can carry before it stops being scannable. */
const MAX_BLOCKER_CHIPS = 3

/**
 * "What is happening right now, and what has to happen next."
 *
 * This replaces the thin mission strip that used to sit *below* a seven-box
 * stepper — the smallest element on the page carrying its most useful sentence.
 * It is now the first thing under the header and the page's single focal point.
 *
 * It routes; it never mutates. The primary control is a link to the tab that
 * owns the action, and the panel there keeps its own `access.*` checks. That is
 * what makes this safe to show to every role: surfacing the next action can
 * never surface the ability to perform it.
 */
export function SchoolCommandBar({
  status,
  operationalPhase,
  next,
  actionTabLabel,
  stageSince,
}: Readonly<SchoolCommandBarProps>) {
  const stage = SCHOOL_STATUS_META[status]?.label ?? status
  const phase = operationalPhase ? OPERATIONAL_PHASE_META[operationalPhase]?.label : null
  const blockers = next.gate && !next.gate.ready ? next.gate.items.filter((i) => !i.satisfied) : []
  const shown = blockers.slice(0, MAX_BLOCKER_CHIPS)
  const settled = status === 'completed'
  // "How long has it been like this" is the question a stalled school raises,
  // and the page could not answer it at all before — the stage history was a
  // list of timestamps in a side rail. No threshold is applied: the product has
  // no definition of "too long", so the duration is stated and the person
  // reading it decides.
  const inStage = formatElapsed(stageSince)

  return (
    <section
      aria-label="Current status and next action"
      className={cn(
        'rounded-2xl border p-4 shadow-soft sm:p-5',
        settled ? 'border-success/30 bg-success/5' : 'border-brand/20 bg-brand/5',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0 flex-1">
          <p className={cn('section-label', settled ? 'text-ink-green' : 'text-brand')}>
            {settled ? 'Outcome' : 'Right now'}
          </p>
          <h2 className="mt-1 font-display text-xl font-bold leading-tight text-foreground">
            {stage}
            {phase && <span className="font-semibold text-muted-foreground"> · {phase}</span>}
          </h2>

          {inStage && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock3 aria-hidden className="size-3.5 shrink-0" />
              {settled ? <>Completed {inStage === 'today' ? 'today' : `${inStage} ago`}</>
                       : <>In this stage {inStage === 'today' ? 'since today' : `for ${inStage}`}</>}
            </p>
          )}

          <p className="mt-2 flex items-start gap-2 text-sm">
            {settled ? (
              <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
            ) : (
              <ArrowRight aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" />
            )}
            <span>
              {!settled && <span className="text-muted-foreground">Next: </span>}
              <strong className="font-bold text-foreground">{next.action}</strong>
              {!settled && (
                <span className="block text-xs text-muted-foreground sm:inline sm:before:content-['_·_']">
                  with <strong className="font-semibold text-foreground">{next.owner}</strong>
                </span>
              )}
            </span>
          </p>
        </div>

        {actionTabLabel && (
          <a
            href={`#${next.tab}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
          >
            Go to {actionTabLabel} <ArrowRight aria-hidden className="size-4" />
          </a>
        )}
      </div>

      {shown.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-brand/15 pt-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-orange">
            <CircleAlert aria-hidden className="size-3.5" /> Blocking:
          </span>
          {shown.map((item) => (
            <span
              key={item.key}
              className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-xs font-medium text-ink-orange"
            >
              {item.label}
            </span>
          ))}
          {blockers.length > shown.length && (
            <span className="text-xs font-medium text-muted-foreground">
              +{blockers.length - shown.length} more
            </span>
          )}
        </div>
      )}
    </section>
  )
}

/** Human label for each tab — shared by the command bar and the tab strip. */
export const TAB_LABELS: Record<SchoolTabId, string> = {
  overview: 'Overview',
  outreach: 'Outreach',
  onboarding: 'Onboarding',
  team: 'Team',
  execution: 'Execution',
  sessions: 'Sessions',
  activity: 'Activity',
}
