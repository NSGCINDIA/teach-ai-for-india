import { notFound } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { canEditSession } from '@/lib/auth/rbac'
import { getSession, listTeamMembers } from '@/lib/data/sessions'
import { listSessionEvidence } from '@/lib/data/evidence'
import { SessionDetailView } from '@/components/sessions/session-detail'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession(id)
  return { title: session?.topic ?? 'Session' }
}

export default async function DashboardSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireAccess('/dashboard/sessions')
  const session = await getSession(id)
  if (!session) notFound()

  const canEdit = canEditSession(user.role, user.id, user.campus_id, session)
  const [members, evidence] = await Promise.all([
    listTeamMembers(session.campus_id),
    listSessionEvidence(session.id),
  ])

  return (
    <SessionDetailView
      session={session}
      members={members}
      evidence={evidence}
      basePath="/dashboard/sessions"
      schoolBasePath="/dashboard/schools"
      canEdit={canEdit}
    />
  )
}
