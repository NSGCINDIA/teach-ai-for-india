import { cn } from '@/lib/utils'

interface TimelineEntryProps {
  title: string
  timestamp: string
  actor?: string | null
  note?: string | null
  /** Tailwind color var for the node dot (e.g. 'var(--brand)'). */
  dotColor?: string
  isLast?: boolean
}

/**
 * TimelineEntry (PRD §12.3) — a single event in a school or session history.
 * Compose several inside a relative container for the connecting line.
 */
export function TimelineEntry({ title, timestamp, actor, note, dotColor = 'var(--brand)', isLast }: TimelineEntryProps) {
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!isLast && <span className="absolute left-[7px] top-4 h-full w-px bg-border" aria-hidden />}
      <span className="mt-1.5 size-3.5 shrink-0 rounded-full ring-4 ring-card" style={{ backgroundColor: dotColor }} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <p className="font-medium">{title}</p>
          <time className="font-mono text-xs text-muted-foreground">{timestamp}</time>
        </div>
        {actor && <p className="text-xs text-muted-foreground">by {actor}</p>}
        {note && <p className={cn('mt-1 rounded-lg bg-muted px-3 py-2 text-sm text-foreground/80')}>{note}</p>}
      </div>
    </li>
  )
}
