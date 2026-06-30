import { Banknote, Clock, TrendingUp, Wallet } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { listReimbursements, getFinanceSummary, getMonthlyTrend } from '@/lib/data/finance'
import { listCampusOptions } from '@/lib/data/schools'
import { formatCurrency, formatNumber } from '@/lib/format'
import { MetricCard } from '@/components/shared/metric-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClaimsTable } from '@/components/finance/claims-table'

export const metadata = { title: 'Finance · Admin' }

export default async function AdminFinancePage() {
  await requireAccess('/admin/finance')
  const [claims, summary, trend, campuses] = await Promise.all([
    listReimbursements(),
    getFinanceSummary(),
    getMonthlyTrend(),
    listCampusOptions(),
  ])
  const maxTrend = Math.max(1, ...trend.map((t) => Number(t.approved_total)))

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Finance</h1>
        <p className="mt-1 text-muted-foreground">Review reimbursement claims, approve, and record payments.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Pending review" value={formatNumber(summary.pending_count)} icon={Clock} />
        <MetricCard label="Approved (unpaid)" value={formatCurrency(summary.unpaid_liabilities)} icon={Wallet} />
        <MetricCard label="Paid to date" value={formatCurrency(summary.paid_total)} icon={Banknote} />
        <MetricCard label="This month" value={formatCurrency(summary.month_to_date)} icon={TrendingUp} />
      </div>

      {trend.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Approved spend by month</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-2" style={{ height: 140 }}>
              {trend.map((t) => (
                <div key={t.month} className="flex flex-1 flex-col items-center justify-end gap-1">
                  <div
                    className="w-full rounded-t bg-brand/80"
                    style={{ height: `${(Number(t.approved_total) / maxTrend) * 110}px` }}
                    title={formatCurrency(Number(t.approved_total))}
                  />
                  <span className="text-[10px] text-muted-foreground">{t.month.slice(5)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Claims queue</h2>
        <ClaimsTable claims={claims} basePath="/admin/finance/claims" showClaimant campuses={campuses} />
      </div>
    </div>
  )
}
