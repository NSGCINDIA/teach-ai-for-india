import { notFound } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { reimbursementReviewAccess } from '@/lib/auth/rbac'
import { getReimbursement } from '@/lib/data/finance'
import { ClaimDetailView } from '@/components/finance/claim-detail'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const claim = await getReimbursement(id)
  return { title: claim?.reference_number ?? 'Claim' }
}

export default async function DashboardClaimPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireAccess('/dashboard/reimbursements')
  const claim = await getReimbursement(id)
  if (!claim) notFound()

  const { canReview } = reimbursementReviewAccess(user.role, user.campus_id, claim.campus_id)
  const mode = claim.claimant_id === user.id ? 'owner' : canReview ? 'reviewer' : 'readonly'

  return (
    <ClaimDetailView
      claim={claim}
      mode={mode}
      basePath="/dashboard/reimbursements"
      sessionHref="/dashboard/sessions"
    />
  )
}
