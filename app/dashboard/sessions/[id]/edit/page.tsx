import { notFound, redirect } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { canEditSession } from '@/lib/auth/rbac'
import { getSession, listSchoolOptions } from '@/lib/data/sessions'
import { SessionForm } from '@/components/sessions/session-form'

export const metadata = { title: 'Edit Session' }

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireAccess('/dashboard/sessions')
  const session = await getSession(id)
  if (!session) notFound()
  if (!canEditSession(user.role, user.id, user.campus_id, session)) {
    redirect(`/dashboard/sessions/${id}`)
  }

  const schools = await listSchoolOptions()
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Edit &amp; report</h1>
        <p className="mt-1 text-muted-foreground">{session.school?.name} · Session #{session.session_number}</p>
      </header>
      <SessionForm mode="edit" session={session} schools={schools} cancelHref={`/dashboard/sessions/${id}`} />
    </div>
  )
}
