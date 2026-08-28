import Link from 'next/link'
import { Plus, School } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { listSchools, listCampusOptions } from '@/lib/data/schools'
import { Button } from '@/components/ui/button'
import { SchoolsView } from '@/components/schools/schools-view'
import { PageHeader } from '@/components/dashboard/page-header'

export const metadata = { title: 'Schools · Admin' }

export default async function AdminSchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  await requireAccess('/admin/schools')
  const [schools, campuses] = await Promise.all([listSchools(), listCampusOptions()])
  // So the admin overview's "Schools with overdue follow-up" alert lands on the
  // filtered list instead of an unfiltered 500-row page.
  const { view } = await searchParams

  return (
    <div className="space-y-6">
      <PageHeader
        icon={School}
        title="Schools"
        description="Every school in the outreach CRM, across all campuses."
        actions={<Button asChild>
          <Link href="/admin/schools/new"><Plus className="size-4" /> Add school</Link>
        </Button>}
      />

      <SchoolsView
        schools={schools}
        campuses={campuses}
        basePath="/admin/schools"
        overdueOnly={view === 'overdue'}
      />
    </div>
  )
}
