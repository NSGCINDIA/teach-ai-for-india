import { requireAccess } from '@/lib/auth/user'
import { listNotifications } from '@/lib/data/notifications'
import { NotificationsPanel } from '@/components/notifications/notifications-panel'

export const metadata = { title: 'Notifications' }

export default async function NotificationsPage() {
  await requireAccess('/dashboard/notifications')
  const notifications = await listNotifications()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="mt-1 text-muted-foreground">Session reminders, approvals, and claim updates (PRD §11).</p>
      </header>
      <NotificationsPanel initial={notifications} />
    </div>
  )
}
