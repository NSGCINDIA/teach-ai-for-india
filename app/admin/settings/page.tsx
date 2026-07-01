import { requireAccess } from '@/lib/auth/user'
import { getFinanceConfig, listContactMessages } from '@/lib/data/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FinanceConfigForm } from '@/components/admin/finance-config-form'
import { MessagesInbox } from '@/components/admin/messages-inbox'

export const metadata = { title: 'Settings · Admin' }

export default async function AdminSettingsPage() {
  await requireAccess('/admin/settings')
  const [finance, messages] = await Promise.all([getFinanceConfig(), listContactMessages()])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">Finance thresholds, contact inbox, and platform configuration.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Finance thresholds</CardTitle></CardHeader>
          <CardContent><FinanceConfigForm claimWindowDays={finance.claim_window_days} /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Anomaly rules</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Claims are auto-routed to review when they trip any of these rules (enforced in the database):
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>Auto fare over ₹500</li>
              <li>More than 3 claims in one week</li>
              <li>No approved session report linked</li>
              <li>Claimant not present in the session’s attendance</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Contact messages</CardTitle></CardHeader>
        <CardContent><MessagesInbox messages={messages} /></CardContent>
      </Card>
    </div>
  )
}
