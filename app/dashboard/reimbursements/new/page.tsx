import { redirect } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { listClaimableSessions } from '@/lib/data/finance'
import { ClaimForm } from '@/components/finance/claim-form'

export const metadata = { title: 'New Claim' }

export default async function NewClaimPage() {
  const user = await requireAccess('/dashboard/reimbursements')
  if (can(user.role, 'submit_reimbursement') === false) redirect('/dashboard/reimbursements')

  const sessions = await listClaimableSessions(user.id)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">New reimbursement claim</h1>
        <p className="mt-1 text-muted-foreground">Save a draft, then submit it for review when you’re ready.</p>
      </header>
      <ClaimForm sessions={sessions} cancelHref="/dashboard/reimbursements" />
    </div>
  )
}
