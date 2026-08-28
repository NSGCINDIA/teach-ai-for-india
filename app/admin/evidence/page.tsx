import { Images } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { listEvidence, listEvidenceFilterOptions } from '@/lib/data/evidence'
import { EvidenceBrowser } from '@/components/evidence/evidence-browser'
import { PageHeader } from '@/components/dashboard/page-header'

export const metadata = { title: 'Evidence · Admin' }

export default async function AdminEvidencePage() {
  await requireAccess('/admin/evidence')
  const [items, options] = await Promise.all([listEvidence(), listEvidenceFilterOptions()])

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Images}
        title="Evidence vault"
        description="Review uploads, approve them, and publish standout photos to the public gallery."
      />
      <EvidenceBrowser items={items} options={options} canModerate />
    </div>
  )
}
