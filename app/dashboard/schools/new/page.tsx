import { School } from 'lucide-react'
import { redirect } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { listCampusOptions } from '@/lib/data/schools'
import { SchoolForm } from '@/components/schools/school-form'
import { PageHeader } from '@/components/dashboard/page-header'

export const metadata = { title: 'Add School' }

export default async function NewSchoolPage() {
  const user = await requireAccess('/dashboard/schools')
  const scope = can(user.role, 'edit_school')
  if (scope === false) redirect('/dashboard/schools')

  const campuses = await listCampusOptions()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        icon={School}
        title="Add a school"
        description="We’ll check for duplicates in the same district before creating it."
      />
      <SchoolForm
        campuses={campuses}
        lockedCampusId={scope === 'own' ? user.campus_id : null}
        cancelHref="/dashboard/schools"
      />
    </div>
  )
}
