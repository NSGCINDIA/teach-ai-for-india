'use client'

import Link from 'next/link'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { relativeTime } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/states'
import type { NotificationRow } from '@/types/database'

interface NotificationFeedProps {
  notifications: NotificationRow[]
  onMarkRead?: (id: string) => void
  onMarkAllRead?: () => void
  className?: string
}

/**
 * NotificationFeed (PRD §12.3) — right-panel alert list with mark-as-read.
 * Presentational: parent supplies data + handlers (wired to Supabase Realtime).
 */
export function NotificationFeed({ notifications, onMarkRead, onMarkAllRead, className }: NotificationFeedProps) {
  const unread = notifications.filter((n) => !n.is_read).length

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="size-4" aria-hidden />
          <span className="font-display text-sm font-semibold">Notifications</span>
          {unread > 0 && (
            <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">{unread}</span>
          )}
        </div>
        {unread > 0 && onMarkAllRead && (
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={onMarkAllRead}>
            <CheckCheck className="size-3.5" /> Mark all
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title="All caught up" description="You have no notifications right now." className="m-3 border-0 bg-transparent py-10" />
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((n) => (
              <li key={n.id} className={cn('group relative px-4 py-3 transition-colors hover:bg-accent/40', !n.is_read && 'bg-brand/5')}>
                <div className="flex items-start gap-3">
                  {!n.is_read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-hidden />}
                  <div className={cn('min-w-0 flex-1', n.is_read && 'pl-5')}>
                    {n.action_url ? (
                      <Link href={n.action_url} className="font-medium hover:underline">{n.title}</Link>
                    ) : (
                      <p className="font-medium">{n.title}</p>
                    )}
                    {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">{relativeTime(n.created_at)}</p>
                  </div>
                  {!n.is_read && onMarkRead && (
                    <button
                      onClick={() => onMarkRead(n.id)}
                      className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
                      aria-label="Mark as read"
                    >
                      <Check className="size-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
