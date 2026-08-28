import Link from 'next/link'
import { Plus, School } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { listSchools, listCampusOptions } from '@/lib/data/schools'
import { countOverdue } from '@/lib/schools/overdue'
import { Button } from '@/components/ui/button'
import { SchoolsView } from '@/components/schools/schools-view'
import { ContextualUpdates } from '@/components/shared/contextual-updates'
import { PageHeader } from '@/components/dashboard/page-header'

export const metadata = { title: 'My Schools' }

export default async function DashboardSchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const user = await requireAccess('/dashboard/schools')
  const scopedToCampus = can(user.role, 'view_all_campuses') !== 'all' && !!user.campus_id

  const [schools, campuses] = await Promise.all([
    listSchools(scopedToCampus ? { campus_id: user.campus_id! } : {}),
    listCampusOptions(),
  ])
  const canCreate = can(user.role, 'edit_school') !== false

  // The overdue filter lives in the URL so the KPI can link to it, the view
  // survives a refresh, and a lead can send someone "here is what you owe me".
  const { view } = await searchParams
  const overdueOnly = view === 'overdue'

  // Header summary. Computed here rather than in SchoolsView because these
  // describe the whole pipeline — they must not move when a filter is applied.
  const activeSchools = schools.filter((s) => s.status === 'sessions_active').length
  const studentsReached = schools.reduce((sum, s) => sum + (s.total_students ?? 0), 0)
  const overdue = countOverdue(schools)

  return (
    <div className="space-y-6">
      <PageHeader
        icon={School}
        title="Schools"
        description={scopedToCampus ? 'Outreach pipeline for your campus.' : 'Outreach pipeline across all campuses.'}
        // Only the last of these is a number anyone acts on, so it is the only
        // one that carries a tone. Tinting the neutral counts as well — which
        // this row used to do — left three colours competing and the one that
        // means "do something" reading as decoration.
        stats={[
          { label: 'In the pipeline', value: schools.length },
          { label: 'Running sessions', value: activeSchools },
          { label: 'Students reached', value: studentsReached.toLocaleString('en-IN') },
          {
            label: 'Follow-ups overdue',
            value: overdue,
            tone: overdue > 0 ? 'attention' : 'default',
            hint: overdueOnly
              ? 'Showing these only'
              : overdue > 0
                ? 'Past their next-action date'
                : 'All up to date',
            // A link to an empty list is a dead end, not an affordance.
            href: overdue > 0 ? (overdueOnly ? '/dashboard/schools' : '/dashboard/schools?view=overdue') : undefined,
            hrefLabel: overdueOnly
              ? 'Show all schools again'
              : `Show only the ${overdue} schools with overdue follow-ups`,
          },
        ]}
        actions={canCreate && (
          <Button asChild>
            <Link href="/dashboard/schools/new"><Plus className="size-4" /> Add school</Link>
          </Button>
        )}
      />

      <div className="space-y-6">
        <SchoolsView
          schools={schools}
          campuses={campuses}
          basePath="/dashboard/schools"
          showCampusFilter={!scopedToCampus}
          overdueOnly={overdueOnly}
        />
        <ContextualUpdates module="schools" />
      </div>
    </div>
  )
}
