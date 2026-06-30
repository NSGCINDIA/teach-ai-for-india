import { notFound } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { getReimbursement } from '@/lib/data/finance'
import { ClaimDetailView } from '@/components/finance/claim-detail'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const claim = await getReimbursement(id)
  return { title: claim?.reference_number ?? 'Claim' }
}

export default async function DashboardClaimPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireAccess('/dashboard/reimbursements')
  const claim = await getReimbursement(id)
  if (!claim) notFound()

  return (
    <ClaimDetailView
      claim={claim}
      mode="owner"
      basePath="/dashboard/reimbursements"
      sessionHref="/dashboard/sessions"
    />
  )
}
