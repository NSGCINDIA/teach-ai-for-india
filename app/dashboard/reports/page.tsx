import { FileBarChart } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { getCampusSessionFunnel } from '@/lib/data/campus-analytics'
import { SESSION_STATUS_META } from '@/lib/constants/status'
import type { SessionStatus, StatusCount } from '@/types/database'
import { StatusBreakdown, type BreakdownItem } from '@/components/analytics/status-breakdown'
import { EmptyState } from '@/components/shared/states'
import { PageHeader } from '@/components/dashboard/page-header'

export const metadata = { title: 'Reports' }

const SESSION_ORDER: SessionStatus[] = [
  'planned', 'in_progress', 'reported', 'campus_approved', 'verified', 'cancelled',
]

function orderedItems(rows: StatusCount[]): BreakdownItem[] {
  const byStatus = new Map(rows.map((r) => [r.status, r.count]))
  return SESSION_ORDER
    .map((s) => ({ label: SESSION_STATUS_META[s].label, count: byStatus.get(s) ?? 0, tone: SESSION_STATUS_META[s].tone }))
    .filter((i) => i.count > 0)
}

export default async function DashboardReportsPage() {
  const user = await requireAccess('/dashboard/reports')

  if (!user.campus_id) {
    return <EmptyState title="No campus assigned" description="Reports need a campus to scope to." />
  }

  const funnel = await getCampusSessionFunnel(user.campus_id)

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileBarChart}
        title="Reports"
        description="Where your campus's sessions stand across the delivery lifecycle."
      />

      <StatusBreakdown title="Session funnel" items={orderedItems(funnel)} />
    </div>
  )
}
