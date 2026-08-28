import { BudgetRequestReviewList } from '@/components/dashboard/budget-request-review-list'
import { DashboardHero } from '@/components/dashboard/dashboard-hero'
import { QuickActions } from '@/components/shared/quick-actions'
import type { CampusLeadData } from '@/lib/data/dashboard'
import { formatNumber } from '@/lib/format'
import { CalendarClock, Images, School, TrendingUp, Users, Wallet } from 'lucide-react'
import { ReimbursementRows, Widget } from '@/components/dashboard/overviews/shared'

// ─── Management Admin ─────────────────────────────────────────────────────────
export function CampusMgmtOverview({ name, data }: { name: string; data: CampusLeadData }) {
  const k = data.kpis
  return (
    <div className="space-y-8 animate-fade-up">
      <DashboardHero
        greeting="Good to see you"
        userName={name}
        role="Management Admin"
        impact={[
          { label: 'Schools Reached', value: formatNumber(k.schoolsActive), icon: School },
          { label: 'Active Volunteers', value: formatNumber(k.volunteersActive), icon: Users },
          { label: 'Evidence Reviews Pending', value: formatNumber(k.pendingEvidenceReviews), icon: Images },
          { label: 'Sessions This Week', value: formatNumber(k.sessionsScheduledThisWeek), icon: CalendarClock },
        ]}
      />

      <QuickActions
        title="What Do You Want To Do?"
        actions={[
          { label: 'View Analytics', description: 'Measure campus-wide impact', href: '/dashboard/analytics', icon: TrendingUp },
          { label: 'Campus Finance', description: 'Budget and spend overview', href: '/dashboard/finance', icon: Wallet },
        ]}
        columns={2}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Widget title="Pending Budget Requests">
          <BudgetRequestReviewList requests={data.pendingBudgetRequests} canReview={false} />
        </Widget>
        <Widget title="Pending Reimbursements" href="/dashboard/reimbursements">
          <ReimbursementRows items={data.pendingReimbursements} />
        </Widget>
      </div>
    </div>
  )
}

// ─── Super Admin ──────────────────────────────────────────────────────────────
