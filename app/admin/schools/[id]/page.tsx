import { notFound } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import {
  canForEntity, schoolStatusAccess, outreachVisitRequestAccess, canLogSchoolVisit, isAdmin,
} from '@/lib/auth/rbac'
import { getSchool } from '@/lib/data/schools'
import { listOutreachVisitRequestsForSchool } from '@/lib/data/outreach-visit-requests'
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
  try {
    const { id } = await params
    const [user, school] = await Promise.all([requireAccess('/admin/schools'), getSchool(id)])
    if (!school) notFound()

    const canEdit = canForEntity(user.role, 'edit_school', user.campus_id, school.campus_id)
    const statusAccess = schoolStatusAccess(user.role, user.campus_id, school.campus_id)
    const visitAccess = outreachVisitRequestAccess(user.role, user.campus_id, school.campus_id)
    const visitLogAccess = canLogSchoolVisit(user.role, user.campus_id, school.campus_id)
    const [visitRequests, roster, schoolVisits, budget] = await Promise.all([
      listOutreachVisitRequestsForSchool(school.id),
      listTeamMembers(school.campus_id),
      listSchoolVisitsForSchool(school.id),
      school.campus_id && school.campus?.quarter
        ? getCampusBudget(school.campus_id, school.campus.quarter)
        : Promise.resolve(null),
    ])

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
        schoolVisits={schoolVisits}
        visitLogAccess={visitLogAccess}
        isAdmin={isAdmin(user.role)}
      />
    )
  } catch (err: any) {
    return (
      <div className="p-6 bg-error/10 text-error rounded-xl">
        <h2 className="text-lg font-bold">Rendering Error</h2>
        <p className="font-mono text-sm whitespace-pre-wrap">{err.message}</p>
        <pre className="mt-2 text-xs font-mono whitespace-pre-wrap">{err.stack}</pre>
      </div>
    )
  }
}
