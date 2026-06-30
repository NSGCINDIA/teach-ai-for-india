import { requireAccess } from '@/lib/auth/user'
import { listEvidence, listEvidenceFilterOptions } from '@/lib/data/evidence'
import { EvidenceBrowser } from '@/components/evidence/evidence-browser'

export const metadata = { title: 'Evidence · Admin' }

export default async function AdminEvidencePage() {
  await requireAccess('/admin/evidence')
  const [items, options] = await Promise.all([listEvidence(), listEvidenceFilterOptions()])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Evidence vault</h1>
        <p className="mt-1 text-muted-foreground">
          Review uploads, approve them, and publish standout photos to the public gallery.
        </p>
      </header>
      <EvidenceBrowser items={items} options={options} canModerate />
    </div>
  )
}
