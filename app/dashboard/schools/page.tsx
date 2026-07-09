import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { listSchools, listCampusOptions } from '@/lib/data/schools'
import { Button } from '@/components/ui/button'
import { SchoolsView } from '@/components/schools/schools-view'

export const metadata = { title: 'My Schools' }

export default async function DashboardSchoolsPage() {
  const user = await requireAccess('/dashboard/schools')
  const scopedToCampus = can(user.role, 'view_all_campuses') !== 'all' && !!user.campus_id

  const [schools, campuses] = await Promise.all([
    listSchools(scopedToCampus ? { campus_id: user.campus_id! } : {}),
    listCampusOptions(),
  ])
  const canCreate = can(user.role, 'edit_school') !== false && user.role !== 'mgmt_admin'

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Schools</h1>
          <p className="mt-1 text-muted-foreground">
            {scopedToCampus ? 'Outreach pipeline for your campus.' : 'Outreach pipeline across all campuses.'}
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/dashboard/schools/new"><Plus className="size-4" /> Add school</Link>
          </Button>
        )}
      </header>

      <SchoolsView schools={schools} campuses={campuses} basePath="/dashboard/schools" showCampusFilter={!scopedToCampus} />
    </div>
  )
}
