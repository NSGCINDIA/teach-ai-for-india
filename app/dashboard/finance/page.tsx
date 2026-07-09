import { Banknote, Clock, PiggyBank, Wallet } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { getCampusFinanceSummary, getPendingFinanceReviewCounts } from '@/lib/data/finance'
import { listBudgetIncreaseRequests } from '@/lib/data/budgets'
import { campusBudgetAccess } from '@/lib/auth/rbac'
import { formatCurrency, formatNumber } from '@/lib/format'
import { MetricCard } from '@/components/shared/metric-card'
import { EmptyState } from '@/components/shared/states'
import { BudgetRequestPanel } from '@/components/finance/budget-request-panel'

export const metadata = { title: 'Campus Finance' }

export default async function DashboardFinancePage() {
  const user = await requireAccess('/dashboard/finance')

  if (!user.campus_id) {
    return <EmptyState title="No campus assigned" description="The Campus Finance Dashboard needs a campus to scope to." />
  }

  const [summary, pending, requests] = await Promise.all([
    getCampusFinanceSummary(user.campus_id),
    getPendingFinanceReviewCounts(user.campus_id),
    listBudgetIncreaseRequests(user.campus_id),
  ])

  const hasBudget = summary?.budget_id != null
  const access = campusBudgetAccess(user.role, user.campus_id, user.campus_id)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Campus Finance</h1>
        <p className="mt-1 text-muted-foreground">
          {summary?.campus_name ?? 'Your campus'}&rsquo;s budget and expenditure
          {summary?.period ? ` for ${summary.period}` : ''}.
        </p>
      </header>

      <BudgetRequestPanel
        campusId={user.campus_id}
        period={summary?.period ?? null}
        hasBudget={hasBudget}
        requests={requests}
        access={access}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total allocated"
          value={hasBudget ? formatCurrency(summary!.allocated_amount!) : '—'}
          icon={PiggyBank}
        />
        <MetricCard
          label="Reserved"
          value={hasBudget ? formatCurrency(summary!.reserved_amount!) : '—'}
          icon={Wallet}
          sublabel="Approved outreach + execution commitments"
        />
        <MetricCard
          label="Approved expenses"
          value={formatCurrency(summary?.approved_expenses ?? 0)}
          icon={Banknote}
          sublabel={`${formatNumber(summary?.pending_count ?? 0)} claims pending review`}
        />
        <MetricCard
          label="Remaining"
          value={hasBudget ? formatCurrency(summary!.remaining_amount!) : '—'}
          icon={Clock}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          label="Outreach visit requests pending finance review"
          value={formatNumber(pending.outreachPending)}
        />
        <MetricCard
          label="Execution plans pending finance review"
          value={formatNumber(pending.executionPending)}
        />
      </div>
    </div>
  )
}
