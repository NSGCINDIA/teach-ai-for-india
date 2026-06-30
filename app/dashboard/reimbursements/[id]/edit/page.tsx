import { notFound, redirect } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { getReimbursement, listClaimableSessions } from '@/lib/data/finance'
import { ClaimForm } from '@/components/finance/claim-form'

export const metadata = { title: 'Edit Claim' }

export default async function EditClaimPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireAccess('/dashboard/reimbursements')
  const claim = await getReimbursement(id)
  if (!claim) notFound()
  // Only the claimant may edit, and only while draft or rejected.
  if (claim.claimant_id !== user.id || !['draft', 'rejected'].includes(claim.status)) {
    redirect(`/dashboard/reimbursements/${id}`)
  }

  const sessions = await listClaimableSessions(user.id)
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Edit claim</h1>
        <p className="mt-1 text-muted-foreground font-mono text-sm">{claim.reference_number}</p>
      </header>
      <ClaimForm claim={claim} sessions={sessions} cancelHref={`/dashboard/reimbursements/${id}`} />
    </div>
  )
}
