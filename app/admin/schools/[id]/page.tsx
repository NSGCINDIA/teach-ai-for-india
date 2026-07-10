import { notFound } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import {
  canForEntity, schoolStatusAccess, outreachVisitRequestAccess,
  outreachRequestAccess, canLogSchoolVisit,
} from '@/lib/auth/rbac'
import { getSchool } from '@/lib/data/schools'
import { listOutreachVisitRequestsForSchool } from '@/lib/data/outreach-visit-requests'
import { listOutreachRequestsForSchool } from '@/lib/data/outreach-requests'
import { listSchoolVisitsForSchool } from '@/lib/data/school-visits'
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
  const user = await requireAccess('/admin/schools')
  const school = await getSchool(id)
  if (!school) notFound()

  const canEdit = canForEntity(user.role, 'edit_school', user.campus_id, school.campus_id)
  const statusAccess = schoolStatusAccess(user.role, user.campus_id, school.campus_id)
  const visitAccess = outreachVisitRequestAccess(user.role, user.campus_id, school.campus_id)
  const outreachAccess = outreachRequestAccess(user.role, user.campus_id, school.campus_id)
  const visitLogAccess = canLogSchoolVisit(user.role, user.campus_id, school.campus_id)
  const [visitRequests, roster, outreachRequests, schoolVisits] = await Promise.all([
    listOutreachVisitRequestsForSchool(school.id),
    listTeamMembers(school.campus_id),
    listOutreachRequestsForSchool(school.id),
    listSchoolVisitsForSchool(school.id),
  ])
  const budget = school.campus_id && school.campus?.quarter
    ? await getCampusBudget(school.campus_id, school.campus.quarter)
    : null

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
      outreachRequests={outreachRequests}
      outreachAccess={outreachAccess}
      schoolVisits={schoolVisits}
      visitLogAccess={visitLogAccess}
    />
  )
}
