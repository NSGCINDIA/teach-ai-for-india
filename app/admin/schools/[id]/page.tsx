import { notFound } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import {
  canForEntity, schoolStatusAccess, outreachVisitRequestAccess, isAdmin,
} from '@/lib/auth/rbac'
import { getSchool } from '@/lib/data/schools'
import { listOutreachVisitRequestsForSchool } from '@/lib/data/outreach-visit-requests'
import { listTeamMembers } from '@/lib/data/sessions'
import { getCampusBudget } from '@/lib/data/budgets'
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
  const [visitRequests, roster, budget] = await Promise.all([
    listOutreachVisitRequestsForSchool(school.id),
    listTeamMembers(school.campus_id),
    school.campus_id && school.campus?.quarter
      ? getCampusBudget(school.campus_id, school.campus.quarter)
      : Promise.resolve(null),
  ])

  const canApproveOnboarding = isAdmin(user.role) || ((user.role === 'campus_lead' || user.role === 'outreach_lead') && user.campus_id === school.campus_id)

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
    />
  )
}
