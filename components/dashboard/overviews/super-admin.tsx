import { BudgetRequestReviewList } from '@/components/dashboard/budget-request-review-list'
import { DashboardHero, SectionHeader } from '@/components/dashboard/dashboard-hero'
import { QuickActions } from '@/components/shared/quick-actions'
import type { CampusLeadData } from '@/lib/data/dashboard'
import { formatNumber } from '@/lib/format'
import { CalendarClock, ClipboardList, Images, MapPin, School, Users, Wallet } from 'lucide-react'
import { Kpi, ReimbursementRows, SchoolRows, SessionRows, Widget } from '@/components/dashboard/overviews/shared'

// ─── Super Admin ──────────────────────────────────────────────────────────────
export function SuperAdminOverview({
  name,
  data,
  canReviewBudgetRequests,
}: {
  name: string
  data: CampusLeadData
  canReviewBudgetRequests: boolean
}) {
  const k = data.kpis
  return (
    <div className="space-y-8 animate-fade-up">
      <DashboardHero
        greeting="Good to see you"
        userName={name}
        role="Super Admin"
        impact={[
          { label: 'Schools Reached', value: formatNumber(k.schoolsActive), icon: School, tone: 'brand' },
          { label: 'Active Volunteers', value: formatNumber(k.volunteersActive), icon: Users },
          { label: 'Awaiting Approval', value: formatNumber(k.schoolsAwaitingApproval), icon: ClipboardList },
          { label: 'Sessions This Week', value: formatNumber(k.sessionsScheduledThisWeek), icon: CalendarClock },
        ]}
      />

      {/* Extra attention tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi label="Pending Evidence Reviews" value={formatNumber(k.pendingEvidenceReviews)} icon={Images} />
        <Kpi label="Budget Requests Pending" value={formatNumber(k.budgetRequestsPendingReview)} icon={Wallet} />
      </div>

      <QuickActions
        title="What Do You Want To Do?"
        actions={[
          { label: 'Admin Panel', description: 'Platform-wide management', href: '/admin', icon: ClipboardList, variant: 'highlight' },
          { label: 'Manage Campuses', description: 'Add or update campuses', href: '/admin/campuses', icon: MapPin },
          { label: 'Manage Schools', description: 'Full school records', href: '/admin/schools', icon: School },
          { label: 'Manage Volunteers', description: 'All volunteer accounts', href: '/admin/volunteers', icon: Users },
        ]}
        columns={4}
      />

      <div className="space-y-4">
        <SectionHeader title="What's Happening Across All Campuses" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Widget title="Today's AI Sessions" href="/dashboard/sessions">
            <SessionRows sessions={data.todaySessions} empty="No sessions today." emptySubtext="Upcoming sessions will appear here." />
          </Widget>
          <Widget title="Upcoming Sessions" href="/dashboard/sessions">
            <SessionRows sessions={data.upcomingSessions} empty="Nothing scheduled yet." />
          </Widget>
          <Widget title="School Approvals Needed" href="/dashboard/schools">
            <SchoolRows schools={data.pendingApprovals} empty="All schools approved." emptySubtext="The pipeline is clear." />
          </Widget>
          <Widget title="Pending Session Reports" href="/dashboard/sessions">
            <SessionRows sessions={data.pendingReports} empty="All reports submitted!" emptySubtext="Great work across all campuses." />
          </Widget>
          <Widget title="Pending Reimbursements" href="/dashboard/reimbursements">
            <ReimbursementRows items={data.pendingReimbursements} />
          </Widget>
          <Widget title="Budget Requests">
            <BudgetRequestReviewList requests={data.pendingBudgetRequests} canReview={canReviewBudgetRequests} />
          </Widget>
        </div>
      </div>
    </div>
  )
}

// ─── Fallback ─────────────────────────────────────────────────────────────────
