import { redirect } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { listCampusOptions } from '@/lib/data/schools'
import { SchoolForm } from '@/components/schools/school-form'

export const metadata = { title: 'Add School' }

export default async function NewSchoolPage() {
  const user = await requireAccess('/dashboard/schools')
  const scope = can(user.role, 'edit_school')
  if (scope === false) redirect('/dashboard/schools')

  const campuses = await listCampusOptions()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Add a school</h1>
        <p className="mt-1 text-muted-foreground">
          We’ll check for duplicates in the same district before creating it.
        </p>
      </header>
      <SchoolForm
        campuses={campuses}
        lockedCampusId={scope === 'own' ? user.campus_id : null}
        cancelHref="/dashboard/schools"
      />
    </div>
  )
}
