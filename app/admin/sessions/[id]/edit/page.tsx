import { CalendarDays } from 'lucide-react'
import { notFound } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { getSession, listSchoolOptions } from '@/lib/data/sessions'
import { SessionForm } from '@/components/sessions/session-form'
import { PageHeader } from '@/components/dashboard/page-header'

export const metadata = { title: 'Edit Session · Admin' }

export default async function AdminEditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireAccess('/admin/sessions')
  const session = await getSession(id)
  if (!session) notFound()

  const schools = await listSchoolOptions()
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        icon={CalendarDays}
        title="Edit &amp; report"
        description={<>{session.school?.name} · Session #{session.session_number}</>}
      />
      <SessionForm mode="edit" session={session} schools={schools} cancelHref={`/admin/sessions/${id}`} />
    </div>
  )
}
