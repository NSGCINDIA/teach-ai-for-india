import { notFound } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { getSchool, listCampusOptions } from '@/lib/data/schools'
import { SchoolForm } from '@/components/schools/school-form'

export const metadata = { title: 'Edit School · Admin' }

export default async function AdminEditSchoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireAccess('/admin/schools')
  const school = await getSchool(id)
  if (!school) notFound()

  const campuses = await listCampusOptions()
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Edit school</h1>
        <p className="mt-1 text-muted-foreground">{school.name}</p>
      </header>
      <SchoolForm school={school} campuses={campuses} cancelHref={`/admin/schools/${id}`} />
    </div>
  )
}
