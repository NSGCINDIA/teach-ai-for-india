import { notFound } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { canEditSession, canForEntity } from '@/lib/auth/rbac'
import { getSession, listTeamMembers } from '@/lib/data/sessions'
import { getSessionAssignments } from '@/lib/data/assignments'
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
  const canAssign = canForEntity(user.role, 'assign_volunteers', user.campus_id, session.campus_id)
  const [members, assignments, evidence] = await Promise.all([
    listTeamMembers(session.campus_id),
    getSessionAssignments(session.id),
    listSessionEvidence(session.id),
  ])
  const assignedIds = new Set(assignments.map((a) => a.volunteer_id))
  const assignCandidates = members.filter((m) => m.role === 'volunteer' && !assignedIds.has(m.id))

  return (
    <SessionDetailView
      session={session}
      members={members}
      assignments={assignments}
      assignCandidates={assignCandidates}
      canAssign={canAssign}
      evidence={evidence}
      basePath="/dashboard/sessions"
      schoolBasePath="/dashboard/schools"
      canEdit={canEdit}
    />
  )
}
