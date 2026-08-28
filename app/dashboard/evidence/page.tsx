import { Images } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { can, isAdmin } from '@/lib/auth/rbac'
import { listEvidence, listEvidenceFilterOptions } from '@/lib/data/evidence'
import { EvidenceBrowser } from '@/components/evidence/evidence-browser'
import { ContextualUpdates } from '@/components/shared/contextual-updates'
import { PageHeader } from '@/components/dashboard/page-header'

export const metadata = { title: 'Evidence' }

export default async function DashboardEvidencePage() {
  const user = await requireAccess('/dashboard/evidence')
  const [items, options] = await Promise.all([listEvidence(), listEvidenceFilterOptions()])
  const canModerate = isAdmin(user.role) || user.role === 'campus_lead'

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Images}
        title="Evidence vault"
        description="Photos, attendance docs, and files captured during sessions."
      />
      
      <div className="space-y-6">
        <EvidenceBrowser
          items={items}
          options={options}
          canModerate={canModerate}
          showCampusFilter={can(user.role, 'view_all_campuses') === 'all'}
        />
        <ContextualUpdates module="evidence" />
      </div>
    </div>
  )
}
