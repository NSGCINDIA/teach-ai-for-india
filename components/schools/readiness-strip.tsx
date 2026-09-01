'use client'

import { AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react'
import type { GateResult } from '@/lib/validations/readiness-gate'
import { cn } from '@/lib/utils'

interface ReadinessStripProps {
  title: string
  gate: GateResult
  /** Extra content shown inside the expanded detail — e.g. an over-size warning. */
  children?: React.ReactNode
  className?: string
}

/**
 * One readiness gate, one line.
 *
 * The onboarding, team and execution panels each used to open with a ~45-line
 * card: a heading, a big READY/BLOCKED badge and an always-expanded checklist of
 * four to eight items. Three of them on one page meant the two items actually
 * blocking a school were spread across two screens of green ticks.
 *
 * This states the verdict and the count, and puts the checklist behind a
 * disclosure. It is a native <details>, not the Radix accordion: there is exactly
 * one section, it needs no shared state, and <details> costs no JavaScript and
 * stays open/closed without a hydration round trip.
 */
export function ReadinessStrip({ title, gate, children, className }: ReadinessStripProps) {
  const { ready, completed, total, items, missing } = gate

  return (
    <details
      // Closed once satisfied: a passed gate is a one-line reassurance. Still
      // blocked, and the checklist is the reason you opened the tab.
      open={!ready}
      className={cn(
        'group rounded-xl border bg-paper',
        ready ? 'border-success/40' : 'border-warning/50',
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 p-3 [&::-webkit-details-marker]:hidden">
        {ready ? (
          <CheckCircle2 className="size-4 shrink-0 text-success" />
        ) : (
          <AlertCircle className="size-4 shrink-0 text-warning" />
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">
            {title}
            <span className="ml-2 font-normal tabular-nums text-muted-foreground">
              {completed} of {total} complete
            </span>
          </p>
          {!ready && missing.length > 0 && (
            <p className="mt-0.5 truncate text-xs font-medium text-ink-orange">
              Blocked by {missing.join(', ')}
            </p>
          )}
        </div>

        <span
          className={cn(
            'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
            ready
              ? 'border-success/35 bg-success/15 text-ink-green'
              : 'border-warning/40 bg-warning/15 text-ink-orange',
          )}
        >
          {ready ? 'Ready' : 'Blocked'}
        </span>

        <ChevronDown
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        />
      </summary>

      <div className="space-y-2 border-t border-border/60 px-3 py-3">
        <ul className="grid gap-1.5 text-xs sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.key} className="flex items-start gap-1.5">
              {item.satisfied ? (
                <CheckCircle2 className="mt-px size-3.5 shrink-0 text-success" />
              ) : (
                <AlertCircle className="mt-px size-3.5 shrink-0 text-ink-orange" />
              )}
              <span className={item.satisfied ? 'text-muted-foreground' : 'font-semibold text-foreground'}>
                {item.label}
                {item.description && !item.satisfied && (
                  <span className="block font-normal text-muted-foreground">{item.description}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
        {children}
      </div>
    </details>
  )
}
