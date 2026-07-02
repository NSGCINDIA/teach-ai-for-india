import Link from 'next/link'
import { FileText } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { listPlansForCampus } from '@/lib/data/plans'
import { formatDate } from '@/lib/format'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/states'
import type { SessionPlanStatus } from '@/types/database'

export const metadata = { title: 'Approval Letters' }

const STATUS_META: Record<SessionPlanStatus, { label: string; tone: 'pending' | 'success' | 'neutral' }> = {
  draft: { label: 'Draft', tone: 'pending' },
  approved: { label: 'Approved', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
}

export default async function DashboardApprovalLettersPage() {
  const user = await requireAccess('/dashboard/approval-letters')

  if (!user.campus_id) {
    return <EmptyState title="No campus assigned" description="Approval letters need a campus to scope to." />
  }

  const plans = await listPlansForCampus(user.campus_id)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Approval letters</h1>
        <p className="mt-1 text-muted-foreground">
          Every school's planning record, its visit dates, and its approval-letter status. Edit a letter path from the
          school's planning panel.
        </p>
      </header>

      {plans.length === 0 ? (
        <EmptyState title="No planning records yet" description="Start planning a school visit to see it listed here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="p-3 font-medium">School</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Planned date</th>
                <th className="p-3 font-medium">Backup date</th>
                <th className="p-3 font-medium">Approval letter</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-b last:border-0 align-middle hover:bg-accent/40">
                  <td className="p-3">
                    {plan.school ? (
                      <Link href={`/dashboard/schools/${plan.school.id}`} className="font-medium text-brand hover:underline">
                        {plan.school.name}
                      </Link>
                    ) : '—'}
                  </td>
                  <td className="p-3"><StatusBadge {...STATUS_META[plan.status]} /></td>
                  <td className="p-3 text-muted-foreground">{formatDate(plan.planned_date)}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(plan.backup_date)}</td>
                  <td className="p-3">
                    {plan.approval_letter_path ? (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <FileText className="size-3.5" /> Attached
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Not uploaded</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
