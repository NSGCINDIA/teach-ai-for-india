import { notFound } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { getReimbursement } from '@/lib/data/finance'
import { ClaimDetailView } from '@/components/finance/claim-detail'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const claim = await getReimbursement(id)
  return { title: claim ? `${claim.reference_number} · Admin` : 'Claim · Admin' }
}

export default async function AdminClaimPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireAccess('/admin/finance')
  const claim = await getReimbursement(id)
  if (!claim) notFound()

  return (
    <ClaimDetailView
      claim={claim}
      mode="reviewer"
      basePath="/admin/finance"
      sessionHref="/admin/sessions"
    />
  )
}
