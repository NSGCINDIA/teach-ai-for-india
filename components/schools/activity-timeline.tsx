import { ChevronDown, Clock } from 'lucide-react'
import type { ActivityTimelineItem } from '@/lib/data/operational-expenses'
import { formatDate } from '@/lib/format'

interface ActivityTimelineProps {
  items: ActivityTimelineItem[]
}

/** How much history is worth showing before it stops being a feed and becomes a log. */
const PREVIEW_COUNT = 8

/**
 * The school's audit trail.
 *
 * Every row used to be its own bordered card, so a busy school rendered twenty
 * boxes stacked down the page — the single densest block in the old layout, and
 * the one nobody scrolls to on purpose. It is a list, so it renders as a list:
 * one border around the whole thing, dividers between rows, and everything past
 * the most recent handful behind a disclosure.
 */
export function ActivityTimeline({ items }: ActivityTimelineProps) {
  if (!items || items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-paper/60 py-6 text-center text-sm text-muted-foreground">
        No recent activity logged for this school.
      </p>
    )
  }

  const preview = items.slice(0, PREVIEW_COUNT)
  const rest = items.slice(PREVIEW_COUNT)

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-paper">
      <ul className="divide-y divide-border/60">
        {preview.map((item) => <ActivityRow key={item.id} item={item} />)}
      </ul>

      {rest.length > 0 && (
        <details className="group border-t border-border/60">
          <summary className="flex cursor-pointer list-none items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-brand [&::-webkit-details-marker]:hidden">
            Show all {items.length} entries
            <ChevronDown aria-hidden className="size-3.5 transition-transform group-open:rotate-180" />
          </summary>
          <ul className="divide-y divide-border/60 border-t border-border/60">
            {rest.map((item) => <ActivityRow key={item.id} item={item} />)}
          </ul>
        </details>
      )}
    </div>
  )
}

function ActivityRow({ item }: { item: ActivityTimelineItem }) {
  return (
    <li className="flex items-start gap-2.5 px-3 py-2.5 text-xs">
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
        <Clock aria-hidden className="size-3" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-semibold">{formatActionName(item.action)}</span>
          <span className="shrink-0 text-[10px] text-muted-foreground">{formatDate(item.createdAt)}</span>
        </div>
        <p className="text-[11px] text-muted-foreground">By {item.actorName ?? 'System'}</p>
      </div>
    </li>
  )
}

function formatActionName(action?: string | null): string {
  if (!action) return 'Activity Logged'
  return String(action)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
}
