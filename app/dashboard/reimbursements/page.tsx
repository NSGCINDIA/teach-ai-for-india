import Link from 'next/link'
import { Plus, Banknote, Clock, PiggyBank, Wallet } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { can, campusBudgetAccess } from '@/lib/auth/rbac'
import { listReimbursements, getCampusFinanceSummary } from '@/lib/data/finance'
import { listBudgetIncreaseRequests } from '@/lib/data/budgets'
import { Button } from '@/components/ui/button'
import { ClaimsTable } from '@/components/finance/claims-table'
import { ContextualUpdates } from '@/components/shared/contextual-updates'
import { MetricCard } from '@/components/shared/metric-card'
import { EmptyState } from '@/components/shared/states'
import { BudgetRequestReviewList } from '@/components/dashboard/budget-request-review-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatCurrency, formatNumber } from '@/lib/format'

export const metadata = { title: 'Finance' }

export default async function DashboardReimbursementsPage() {
  const user = await requireAccess('/dashboard/reimbursements')

  // If Campus Lead, show the Finance Analysis & Budget Verification dashboard
  if (user.role === 'campus_lead') {
    if (!user.campus_id) {
      return (
        <EmptyState
          title="No campus assigned"
          description="The Finance Analysis Dashboard needs a campus to scope to."
        />
      )
    }

    const [summary, requests] = await Promise.all([
      getCampusFinanceSummary(user.campus_id),
      listBudgetIncreaseRequests(user.campus_id),
    ])

    const hasBudget = summary?.budget_id != null
    const access = campusBudgetAccess(user.role, user.campus_id, user.campus_id)

    // Map requests to BudgetRequestLite[] for BudgetRequestReviewList
    const pendingLite = requests
      .filter((r) => r.status === 'pending')
      .map((r) => ({
        id: r.id,
        requested_amount: r.requested_amount,
        reason: r.reason,
        period: r.period,
        created_at: r.created_at,
        requester_name: r.requester?.full_name ?? 'Finance Lead',
      }))

    const history = requests.filter((r) => r.status !== 'pending')

    return (
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-2xl font-bold tracking-tight">Finance Analysis & Budget Verification</h1>
          <p className="mt-1 text-muted-foreground">
            Analyze spend metrics and verify additional budget requests for {summary?.campus_name ?? 'your campus'}
            {summary?.period ? ` for ${summary.period}` : ''}.
          </p>
        </header>

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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Pending Budget Verification Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <BudgetRequestReviewList requests={pendingLite} canReview={access.canReviewIncrease} />
              </CardContent>
            </Card>

            {history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Verification History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-border">
                    {history.map((r) => (
                      <li key={r.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium">
                            {r.requester?.full_name ?? 'Finance Lead'} · {formatCurrency(r.requested_amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {r.period} — {r.reason}
                          </p>
                          {r.review_note && (
                            <p className="mt-1 text-xs text-muted-foreground bg-muted p-2 rounded">
                              Note: {r.review_note}
                            </p>
                          )}
                        </div>
                        <StatusBadge kind="approval" status={r.status} />
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          <ContextualUpdates module="finance" />
        </div>
      </div>
    )
  }

  // Standard Reimbursements layout for other roles
  const isFinanceQueue = user.role === 'finance_lead' && !!user.campus_id
  const claims = await listReimbursements(
    isFinanceQueue ? { campus_id: user.campus_id! } : { claimant_id: user.id },
  )
  const canCreate = can(user.role, 'submit_reimbursement') !== false

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Reimbursements</h1>
          <p className="mt-1 text-muted-foreground">
            {isFinanceQueue
              ? 'Review and process reimbursement claims for your campus.'
              : 'Claim travel for sessions you attended and track payment.'}
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/dashboard/reimbursements/new">
              <Plus className="size-4" /> New claim
            </Link>
          </Button>
        )}
      </header>

      <div className="space-y-6">
        <ClaimsTable claims={claims} basePath="/dashboard/reimbursements" showClaimant={isFinanceQueue} />
        <ContextualUpdates module="finance" />
      </div>
    </div>
  )
}
