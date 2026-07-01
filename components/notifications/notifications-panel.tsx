'use client'

import { useState, useTransition } from 'react'
import { markNotificationRead, markAllNotificationsRead } from '@/actions/notifications'
import { NotificationFeed } from '@/components/shared/notification-feed'
import type { NotificationRow } from '@/types/database'

/** Client wrapper: optimistic mark-read backed by server actions. */
export function NotificationsPanel({ initial }: { initial: NotificationRow[] }) {
  const [items, setItems] = useState(initial)
  const [, startTransition] = useTransition()

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    startTransition(() => { void markNotificationRead(id) })
  }

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
    startTransition(() => { void markAllNotificationsRead() })
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-soft">
      <NotificationFeed notifications={items} onMarkRead={markRead} onMarkAllRead={markAllRead} className="max-h-none" />
    </div>
  )
}
