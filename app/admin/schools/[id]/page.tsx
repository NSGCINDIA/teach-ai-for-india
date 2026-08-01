import { notFound } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import {
  canForEntity, schoolStatusAccess, outreachVisitRequestAccess, executionPlanAccess, schoolTeamAccess, isAdmin,
} from '@/lib/auth/rbac'
import { getSchool } from '@/lib/data/schools'
import { listOutreachVisitRequestsForSchool } from '@/lib/data/outreach-visit-requests'
import { listTeamMembers } from '@/lib/data/sessions'
import { getCampusBudget } from '@/lib/data/budgets'
import { getSchoolTeam } from '@/lib/data/school-team'
import { getSchoolExecutionPlan } from '@/lib/data/school-execution-plans'
import { getSchoolSessions } from '@/lib/data/session-delivery'
import { SchoolDetailView } from '@/components/schools/school-detail'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const school = await getSchool(id)
  return { title: school ? `${school.name} · Admin` : 'School · Admin' }
}

export default async function AdminSchoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [user, school] = await Promise.all([requireAccess('/admin/schools'), getSchool(id)])
  if (!school) notFound()

  const canEdit = canForEntity(user.role, 'edit_school', user.campus_id, school.campus_id)
  const statusAccess = schoolStatusAccess(user.role, user.campus_id, school.campus_id)
  const visitAccess = outreachVisitRequestAccess(user.role, user.campus_id, school.campus_id)
  const execPlanAccess = executionPlanAccess(user.role, user.campus_id, school.campus_id)
  const teamAccess = schoolTeamAccess(user.role, user.campus_id, school.campus_id)

  const [visitRequests, roster, budget, team, execPlan, sessions] = await Promise.all([
    listOutreachVisitRequestsForSchool(school.id),
    listTeamMembers(school.campus_id),
    school.campus_id && school.campus?.quarter
      ? getCampusBudget(school.campus_id, school.campus.quarter)
      : Promise.resolve(null),
    getSchoolTeam(school.id),
    getSchoolExecutionPlan(school.id),
    getSchoolSessions(school.id),
  ])

  const canApproveOnboarding = canForEntity(user.role, 'approve_school_onboarding', user.campus_id, school.campus_id)
  const canVerifySession = isAdmin(user.role) || (user.role === 'campus_lead' && user.campus_id === school.campus_id)

  return (
    <SchoolDetailView
      school={school}
      basePath="/admin/schools"
      canEdit={canEdit}
      statusAccess={statusAccess}
      visitRequests={visitRequests}
      roster={roster}
      budget={budget}
      visitAccess={visitAccess}
      canApproveOnboarding={canApproveOnboarding}
      isAdmin={isAdmin(user.role)}
      team={team}
      execPlan={execPlan}
      sessions={sessions}
      execPlanAccess={execPlanAccess}
      teamAccess={teamAccess}
      canVerifySession={canVerifySession}
    />
  )
}
