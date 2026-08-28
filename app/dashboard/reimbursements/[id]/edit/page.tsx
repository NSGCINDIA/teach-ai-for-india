import { Receipt } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { getReimbursement, listClaimableSessions } from '@/lib/data/finance'
import { ClaimForm } from '@/components/finance/claim-form'
import { PageHeader } from '@/components/dashboard/page-header'

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
      <PageHeader
        icon={Receipt}
        title="Edit claim"
        description={<>{claim.reference_number}</>}
      />
      <ClaimForm claim={claim} sessions={sessions} cancelHref={`/dashboard/reimbursements/${id}`} />
    </div>
  )
}
