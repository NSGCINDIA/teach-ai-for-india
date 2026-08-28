import { CalendarDays } from 'lucide-react'
import { redirect } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { listSchoolOptions } from '@/lib/data/sessions'
import { SessionForm } from '@/components/sessions/session-form'
import { PageHeader } from '@/components/dashboard/page-header'

export const metadata = { title: 'Plan Session' }

export default async function NewSessionPage() {
  const user = await requireAccess('/dashboard/sessions')
  const scope = can(user.role, 'create_session')
  if (scope === false) redirect('/dashboard/sessions')

  const schools = await listSchoolOptions(scope === 'own' ? user.campus_id : null)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        icon={CalendarDays}
        title="Plan a session"
        description="Schedule the visit now; fill the report after it happens."
      />
      <SessionForm mode="create" schools={schools} cancelHref="/dashboard/sessions" />
    </div>
  )
}
