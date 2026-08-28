import { BudgetRequestReviewList } from '@/components/dashboard/budget-request-review-list'
import { DashboardHero } from '@/components/dashboard/dashboard-hero'
import { QuickActions } from '@/components/shared/quick-actions'
import { Badge } from '@/components/ui/badge'
import type { FinanceLeadData } from '@/lib/data/dashboard'
import { formatCurrency } from '@/lib/format'
import { ArrowRight, CheckCircle2, DollarSign, Receipt, TrendingUp, Wallet, Wrench } from 'lucide-react'
import Link from 'next/link'
import { Widget, WorkQueueCard } from '@/components/dashboard/overviews/shared'

// ─── Finance Lead ─────────────────────────────────────────────────────────────
export function FinanceLeadOverview({
  name,
  data,
  finWorkspaceData,
}: {
  name: string
  data: FinanceLeadData
  finWorkspaceData?: any
}) {
  const k = data.kpis
  const actionItems = finWorkspaceData?.actionItems ?? []

  return (
    <div className="space-y-8 animate-fade-up">
      <DashboardHero
        greeting="Good to see you"
        userName={name}
        role="Finance Lead"
        impact={[
          { label: 'Allocated Budget', value: formatCurrency(finWorkspaceData?.allocatedBudget ?? k.allocatedAmount), icon: Wallet },
          { label: 'Actual Spend', value: formatCurrency(finWorkspaceData?.spentBudget ?? 0), icon: Receipt },
          { label: 'Available Budget', value: formatCurrency(finWorkspaceData?.availableBudget ?? 0), icon: CheckCircle2 },
          { label: 'Utilization', value: `${finWorkspaceData?.utilizationRate ?? 0}%`, icon: TrendingUp },
        ]}
      />

      <WorkQueueCard
        title="Action Required — Operational Finance"
        subtitle="Tasks needing your review, verification, or approval"
        icon={DollarSign}
        href="/dashboard/finance"
        hrefLabel="View all finance"
        empty={actionItems.length === 0}
        emptyMessage="All accounts are reconciled! No pending approvals."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {actionItems.map((item: any) => (
            <div key={item.id} className="p-4 rounded-xl border border-brand-orange/20 bg-brand-orange/5 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-base text-foreground">{item.title}</h4>
                <Badge variant="outline" className="border-brand-gold/40 bg-brand-gold/15 text-brand-gold font-bold shrink-0">
                  {item.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-medium">{item.subtitle}</p>
              <div className="flex items-center justify-between border-t border-border/50 pt-3">
                <span className="font-bold text-base text-brand-deep">₹{item.amount}</span>
                {item.schoolId && (
                  <Link href={`/dashboard/schools/${item.schoolId}`} className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline">
                    Review School <ArrowRight className="size-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </WorkQueueCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <Widget title="Extra Budget Requests" href="/dashboard/finance">
          <BudgetRequestReviewList requests={data.pendingBudgetRequests} canReview={false} />
        </Widget>
        <Widget title="Quick Navigate">
          <QuickActions
            title=""
            actions={[
              { label: 'Campus Finance Summary', description: 'View budget utilization and spend', href: '/dashboard/finance', icon: TrendingUp },
              { label: 'School Execution Plans', description: 'Review plan budgets across schools', href: '/dashboard/schools', icon: Wrench },
            ]}
            columns={2}
          />
        </Widget>
      </div>
    </div>
  )
}

// ─── Management Admin ─────────────────────────────────────────────────────────
