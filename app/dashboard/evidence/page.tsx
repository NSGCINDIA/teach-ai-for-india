import { requireAccess } from '@/lib/auth/user'
import { can, isAdmin } from '@/lib/auth/rbac'
import { listEvidence, listEvidenceFilterOptions } from '@/lib/data/evidence'
import { EvidenceBrowser } from '@/components/evidence/evidence-browser'

export const metadata = { title: 'Evidence' }

export default async function DashboardEvidencePage() {
  const user = await requireAccess('/dashboard/evidence')
  const [items, options] = await Promise.all([listEvidence(), listEvidenceFilterOptions()])
  const canModerate = isAdmin(user.role) || user.role === 'campus_lead'

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Evidence vault</h1>
        <p className="mt-1 text-muted-foreground">Photos, attendance docs, and files captured during sessions.</p>
      </header>
      <EvidenceBrowser
        items={items}
        options={options}
        canModerate={canModerate}
        showCampusFilter={can(user.role, 'view_all_campuses') === 'all'}
      />
    </div>
  )
}
