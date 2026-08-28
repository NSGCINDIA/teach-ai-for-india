import { CalendarDays } from 'lucide-react'
import { redirect } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { listSchoolOptions } from '@/lib/data/sessions'
import { SessionForm } from '@/components/sessions/session-form'
import { PageHeader } from '@/components/dashboard/page-header'

export const metadata = { title: 'Plan Session · Admin' }

export default async function AdminNewSessionPage() {
  const user = await requireAccess('/admin/sessions')
  if (can(user.role, 'create_session') === false) redirect('/admin/sessions')
  const schools = await listSchoolOptions()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        icon={CalendarDays}
        title="Plan a session"
        description="Schedule the visit now; fill the report after it happens."
      />
      <SessionForm mode="create" schools={schools} cancelHref="/admin/sessions" />
    </div>
  )
}
