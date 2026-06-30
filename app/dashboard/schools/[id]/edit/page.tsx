import { notFound, redirect } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { canForEntity, can } from '@/lib/auth/rbac'
import { getSchool, listCampusOptions } from '@/lib/data/schools'
import { SchoolForm } from '@/components/schools/school-form'

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
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Edit school</h1>
        <p className="mt-1 text-muted-foreground">{school.name}</p>
      </header>
      <SchoolForm
        school={school}
        campuses={campuses}
        lockedCampusId={can(user.role, 'edit_school') === 'own' ? user.campus_id : null}
        cancelHref={`/dashboard/schools/${id}`}
      />
    </div>
  )
}
