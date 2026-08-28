import Link from 'next/link'
import { Plus, CalendarDays } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { listSessions } from '@/lib/data/sessions'
import { listCampusOptions } from '@/lib/data/schools'
import { Button } from '@/components/ui/button'
import { SessionsView } from '@/components/sessions/sessions-view'
import { ContextualUpdates } from '@/components/shared/contextual-updates'
import { PageHeader } from '@/components/dashboard/page-header'

export const metadata = { title: 'My Sessions' }

export default async function DashboardSessionsPage() {
  const user = await requireAccess('/dashboard/sessions')
  const seesAll = can(user.role, 'view_all_campuses') === 'all'

  const [sessions, campuses] = await Promise.all([listSessions(), listCampusOptions()])
  const canCreate = can(user.role, 'create_session') !== false

  // Whole-list summary — unaffected by the filters inside SessionsView.
  const today = new Date().toISOString().slice(0, 10)
  const verified = sessions.filter((s) => s.status === 'verified').length
  const upcoming = sessions.filter((s) => s.date >= today && s.status === 'planned').length
  const awaitingReport = sessions.filter(
    (s) => s.status === 'in_progress' || s.status === 'reported',
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CalendarDays}
        title="Sessions"
        description="Plan visits, file reports, and track them through approval."
        stats={[
          { label: 'AI sessions delivered', value: verified, tone: 'success' },
          { label: 'Coming up', value: upcoming, tone: 'brand' },
          {
            label: 'Awaiting sign-off',
            value: awaitingReport,
            tone: awaitingReport > 0 ? 'attention' : 'default',
            hint: awaitingReport > 0 ? 'Reported but not yet verified' : 'Nothing pending',
          },
          { label: 'On record', value: sessions.length },
        ]}
        actions={canCreate && (
          <Button asChild><Link href="/dashboard/sessions/new"><Plus className="size-4" /> Plan session</Link></Button>
        )}
      />

      <div className="space-y-6">
        <SessionsView sessions={sessions} campuses={campuses} basePath="/dashboard/sessions" showCampusFilter={seesAll} />
        <ContextualUpdates module="sessions" />
      </div>
    </div>
  )
}
