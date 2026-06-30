import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { listSessions } from '@/lib/data/sessions'
import { listCampusOptions } from '@/lib/data/schools'
import { Button } from '@/components/ui/button'
import { SessionsView } from '@/components/sessions/sessions-view'

export const metadata = { title: 'My Sessions' }

export default async function DashboardSessionsPage() {
  const user = await requireAccess('/dashboard/sessions')
  const seesAll = can(user.role, 'view_all_campuses') === 'all'

  const [sessions, campuses] = await Promise.all([listSessions(), listCampusOptions()])
  const canCreate = can(user.role, 'create_session') !== false

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Sessions</h1>
          <p className="mt-1 text-muted-foreground">Plan visits, file reports, and track them through approval.</p>
        </div>
        {canCreate && (
          <Button asChild><Link href="/dashboard/sessions/new"><Plus className="size-4" /> Plan session</Link></Button>
        )}
      </header>

      <SessionsView sessions={sessions} campuses={campuses} basePath="/dashboard/sessions" showCampusFilter={seesAll} />
    </div>
  )
}
