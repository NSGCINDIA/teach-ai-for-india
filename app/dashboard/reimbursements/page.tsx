import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { listReimbursements } from '@/lib/data/finance'
import { Button } from '@/components/ui/button'
import { ClaimsTable } from '@/components/finance/claims-table'

export const metadata = { title: 'Reimbursements' }

export default async function DashboardReimbursementsPage() {
  const user = await requireAccess('/dashboard/reimbursements')
  const claims = await listReimbursements({ claimant_id: user.id })
  const canCreate = can(user.role, 'submit_reimbursement') !== false

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Reimbursements</h1>
          <p className="mt-1 text-muted-foreground">Claim travel for sessions you attended and track payment.</p>
        </div>
        {canCreate && (
          <Button asChild><Link href="/dashboard/reimbursements/new"><Plus className="size-4" /> New claim</Link></Button>
        )}
      </header>

      <ClaimsTable claims={claims} basePath="/dashboard/reimbursements" />
    </div>
  )
}
