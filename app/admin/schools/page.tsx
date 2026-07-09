import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { listSchools, listCampusOptions } from '@/lib/data/schools'
import { Button } from '@/components/ui/button'
import { SchoolsView } from '@/components/schools/schools-view'

export const metadata = { title: 'Schools · Admin' }

export default async function AdminSchoolsPage() {
  const user = await requireAccess('/admin/schools')
  // mgmt_admin oversees the pipeline but doesn't add schools (super_admin still can).
  const canCreate = user.role !== 'mgmt_admin'
  const [schools, campuses] = await Promise.all([listSchools(), listCampusOptions()])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Schools</h1>
          <p className="mt-1 text-muted-foreground">Every school in the outreach CRM, across all campuses.</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/admin/schools/new"><Plus className="size-4" /> Add school</Link>
          </Button>
        )}
      </header>

      <SchoolsView schools={schools} campuses={campuses} basePath="/admin/schools" />
    </div>
  )
}
