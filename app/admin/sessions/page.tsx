import Link from 'next/link'
import { Plus, CalendarDays } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { listSessions } from '@/lib/data/sessions'
import { listCampusOptions } from '@/lib/data/schools'
import { Button } from '@/components/ui/button'
import { SessionsView } from '@/components/sessions/sessions-view'
import { PageHeader } from '@/components/dashboard/page-header'

export const metadata = { title: 'Sessions · Admin' }

export default async function AdminSessionsPage() {
  const user = await requireAccess('/admin/sessions')
  const canCreate = can(user.role, 'create_session') !== false
  const [sessions, campuses] = await Promise.all([listSessions(), listCampusOptions()])

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CalendarDays}
        title="Sessions"
        description="Every session across all campuses — verify reports here."
        actions={canCreate && (
          <Button asChild><Link href="/admin/sessions/new"><Plus className="size-4" /> Plan session</Link></Button>
        )}
      />

      <SessionsView sessions={sessions} campuses={campuses} basePath="/admin/sessions" />
    </div>
  )
}
