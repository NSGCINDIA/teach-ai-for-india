import { School } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { canForEntity, can } from '@/lib/auth/rbac'
import { getSchool, listCampusOptions } from '@/lib/data/schools'
import { SchoolForm } from '@/components/schools/school-form'
import { PageHeader } from '@/components/dashboard/page-header'

export const metadata = { title: 'Edit School' }

export default async function EditSchoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireAccess('/dashboard/schools')
  const school = await getSchool(id)
  if (!school) notFound()
  if (!canForEntity(user.role, 'edit_school', user.campus_id, school.campus_id)) {
    redirect(`/dashboard/schools/${id}`)
  }

  const campuses = await listCampusOptions()
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        icon={School}
        title="Edit school"
        description={<>{school.name}</>}
      />
      <SchoolForm
        school={school}
        campuses={campuses}
        lockedCampusId={can(user.role, 'edit_school') === 'own' ? user.campus_id : null}
        cancelHref={`/dashboard/schools/${id}`}
      />
    </div>
  )
}
