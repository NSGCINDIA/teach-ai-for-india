import { School } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { listCampusOptions } from '@/lib/data/schools'
import { SchoolForm } from '@/components/schools/school-form'
import { PageHeader } from '@/components/dashboard/page-header'

export const metadata = { title: 'Add School · Admin' }

export default async function AdminNewSchoolPage() {
  await requireAccess('/admin/schools')
  const campuses = await listCampusOptions()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        icon={School}
        title="Add a school"
        description="We’ll check for duplicates in the same district before creating it."
      />
      <SchoolForm campuses={campuses} cancelHref="/admin/schools" />
    </div>
  )
}
