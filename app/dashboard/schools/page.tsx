import Link from 'next/link'
import { Plus, School } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { listSchools, listCampusOptions } from '@/lib/data/schools'
import { Button } from '@/components/ui/button'
import { SchoolsView } from '@/components/schools/schools-view'
import { ContextualUpdates } from '@/components/shared/contextual-updates'
import { PageHeader } from '@/components/dashboard/page-header'

export const metadata = { title: 'My Schools' }

export default async function DashboardSchoolsPage() {
  const user = await requireAccess('/dashboard/schools')
  const scopedToCampus = can(user.role, 'view_all_campuses') !== 'all' && !!user.campus_id

  const [schools, campuses] = await Promise.all([
    listSchools(scopedToCampus ? { campus_id: user.campus_id! } : {}),
    listCampusOptions(),
  ])
  const canCreate = can(user.role, 'edit_school') !== false

  // Header summary. Computed here rather than in SchoolsView because these
  // describe the whole pipeline — they must not move when a filter is applied.
  const today = new Date().toISOString().slice(0, 10)
  const activeSchools = schools.filter((s) => s.status === 'sessions_active').length
  const studentsReached = schools.reduce((sum, s) => sum + (s.total_students ?? 0), 0)
  const overdue = schools.filter(
    (s) => s.next_action_date && s.next_action_date < today && s.status !== 'archived',
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        icon={School}
        title="Schools"
        description={scopedToCampus ? 'Outreach pipeline for your campus.' : 'Outreach pipeline across all campuses.'}
        stats={[
          { label: 'In the pipeline', value: schools.length },
          { label: 'Running sessions', value: activeSchools, tone: 'brand' },
          { label: 'Students reached', value: studentsReached.toLocaleString('en-IN'), tone: 'success' },
          {
            label: 'Follow-ups overdue',
            value: overdue,
            tone: overdue > 0 ? 'attention' : 'default',
            hint: overdue > 0 ? 'Past their next-action date' : 'All up to date',
          },
        ]}
        actions={canCreate && (
          <Button asChild>
            <Link href="/dashboard/schools/new"><Plus className="size-4" /> Add school</Link>
          </Button>
        )}
      />

      <div className="space-y-6">
        <SchoolsView schools={schools} campuses={campuses} basePath="/dashboard/schools" showCampusFilter={!scopedToCampus} />
        <ContextualUpdates module="schools" />
      </div>
    </div>
  )
}
