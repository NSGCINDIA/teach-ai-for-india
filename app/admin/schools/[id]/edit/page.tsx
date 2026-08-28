import { School } from 'lucide-react'
import { notFound } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { getSchool, listCampusOptions } from '@/lib/data/schools'
import { SchoolForm } from '@/components/schools/school-form'
import { PageHeader } from '@/components/dashboard/page-header'

export const metadata = { title: 'Edit School · Admin' }

export default async function AdminEditSchoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireAccess('/admin/schools')
  const school = await getSchool(id)
  if (!school) notFound()

  const campuses = await listCampusOptions()
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        icon={School}
        title="Edit school"
        description={<>{school.name}</>}
      />
      <SchoolForm school={school} campuses={campuses} cancelHref={`/admin/schools/${id}`} />
    </div>
  )
}
