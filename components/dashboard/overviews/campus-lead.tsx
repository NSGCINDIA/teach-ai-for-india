import { BudgetRequestReviewList } from '@/components/dashboard/budget-request-review-list'
import { DashboardHero, SectionHeader } from '@/components/dashboard/dashboard-hero'
import { QuickActions } from '@/components/shared/quick-actions'
import type { CampusLeadData } from '@/lib/data/dashboard'
import { formatNumber } from '@/lib/format'
import { CalendarClock, CalendarDays, ClipboardList, Images, School, TrendingUp, Users, Wallet } from 'lucide-react'
import { Kpi, SchoolRows, SessionRows, Widget } from '@/components/dashboard/overviews/shared'

// ─── Campus Lead ─────────────────────────────────────────────────────────────
export function CampusLeadOverview({
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
      {/* Hero */}
      <DashboardHero
        greeting="Good to see you"
        userName={name}
        role="Campus Governance Lead"
        impact={[
          { label: 'Schools Reached', value: formatNumber(k.schoolsActive), icon: School },
          { label: 'Active Volunteers', value: formatNumber(k.volunteersActive), icon: Users },
          { label: 'Sessions This Week', value: formatNumber(k.sessionsScheduledThisWeek), icon: CalendarClock },
          { label: 'Needs Your Attention', value: formatNumber(k.pendingEvidenceReviews + k.schoolsAwaitingApproval + k.budgetRequestsPendingReview), icon: ClipboardList },
        ]}
      />

      {/* What Needs Your Attention */}
      <div className="space-y-4">
        <SectionHeader
          title="What Needs Your Attention"
          description="Review these items to keep the campus moving forward"
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Kpi label="Schools Awaiting Approval" value={formatNumber(k.schoolsAwaitingApproval)} icon={ClipboardList} />
          <Kpi label="Pending Evidence Reviews" value={formatNumber(k.pendingEvidenceReviews)} icon={Images} />
          <Kpi label="Budget Requests Pending" value={formatNumber(k.budgetRequestsPendingReview)} icon={Wallet} />
        </div>
      </div>

      {/* Queues — bento 2-col */}
      <div className="space-y-4">
        <SectionHeader title="What's Happening" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Widget
            title="Outreach Approvals"
            subtitle="Schools waiting on your review to proceed"
            href="/dashboard/schools"
          >
            <SchoolRows
              schools={data.pendingApprovals}
              empty="Nothing waiting on you right now."
              emptySubtext="All outreach approvals are up to date."
            />
          </Widget>

          <Widget
            title="Session Reports to Verify"
            subtitle="Reports submitted by your Execution Lead"
            href="/dashboard/sessions"
          >
            <SessionRows
              sessions={data.pendingReports}
              empty="All session reports are verified! 🎉"
            />
          </Widget>

          <Widget
            title="Extra Budget Requests"
            subtitle="Requests from your schools needing additional funding"
            href="/dashboard/finance"
          >
            <BudgetRequestReviewList
              requests={data.pendingBudgetRequests}
              canReview={canReviewBudgetRequests}
            />
          </Widget>

          {/* Quick navigate */}
          <Widget title="Navigate Your Campus">
            <QuickActions
              title=""
              actions={[
                { label: 'School Pipeline', description: "Track every school's journey", href: '/dashboard/schools', icon: School },
                { label: 'Session Oversight', description: 'Governance and session records', href: '/dashboard/sessions', icon: CalendarDays },
                { label: 'Evidence Gallery', description: 'Review photos and documentation', href: '/dashboard/evidence', icon: Images },
                { label: 'Campus Analytics', description: 'Measure your campus impact', href: '/dashboard/analytics', icon: TrendingUp },
              ]}
              columns={2}
            />
          </Widget>
        </div>
      </div>
    </div>
  )
}

// ─── Outreach Lead ────────────────────────────────────────────────────────────
