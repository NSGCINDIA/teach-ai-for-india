import { notFound } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { canEditSession, canForEntity, can, executionPlanAccess } from '@/lib/auth/rbac'
import { getSession, listTeamMembers } from '@/lib/data/sessions'
import { getSessionAssignments } from '@/lib/data/assignments'
import { listSessionEvidence } from '@/lib/data/evidence'
import { listExecutionPlansForSession } from '@/lib/data/execution-plans'
import { getCampusBudget } from '@/lib/data/budgets'
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
  const canUploadEvidence = canEdit && can(user.role, 'upload_evidence') !== false
  const canAssign = canForEntity(user.role, 'assign_volunteers', user.campus_id, session.campus_id)
  const execPlanAccess = executionPlanAccess(user.role, user.campus_id, session.campus_id)
  const [teamMembers, assignments, evidence, executionPlans] = await Promise.all([
    listTeamMembers(session.campus_id),
    getSessionAssignments(session.id),
    listSessionEvidence(session.id),
    listExecutionPlansForSession(session.id),
  ])
  const budget = session.campus_id && session.campus?.quarter
    ? await getCampusBudget(session.campus_id, session.campus.quarter)
    : null
  // Attendance/assignment rosters are volunteer-only — leads track their own
  // attendance elsewhere and shouldn't clutter this list.
  const members = teamMembers.filter((m) => m.role === 'volunteer')
  const assignedIds = new Set(assignments.map((a) => a.volunteer_id))
  const assignCandidates = members.filter((m) => !assignedIds.has(m.id))

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
      canUploadEvidence={canUploadEvidence}
      executionPlans={executionPlans}
      executionPlanAccess={execPlanAccess}
      budget={budget}
    />
  )
}
