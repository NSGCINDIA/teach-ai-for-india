import { Activity, Clock } from 'lucide-react'
import type { ActivityTimelineItem } from '@/lib/data/operational-expenses'
import { formatDate } from '@/lib/format'

interface ActivityTimelineProps {
  items: ActivityTimelineItem[]
}

export function ActivityTimeline({ items }: ActivityTimelineProps) {
  if (items.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">
        No recent activity logged for this school.
      </p>
    )
  }

  const formatActionName = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Activity className="size-3.5 text-brand" /> Operational Activity Feed
      </h4>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="p-2.5 rounded-lg border border-border bg-card text-xs flex items-start gap-2.5">
            <span className="grid size-6 place-items-center rounded-full bg-brand/10 text-brand shrink-0 mt-0.5">
              <Clock className="size-3" />
            </span>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between font-semibold">
                <span>{formatActionName(item.action)}</span>
                <span className="text-[10px] text-muted-foreground font-normal">{formatDate(item.createdAt)}</span>
              </div>
              <p className="text-muted-foreground text-[11px]">By {item.actorName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
