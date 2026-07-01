import { requireAccess } from '@/lib/auth/user'
import { listContentBlocks } from '@/lib/data/admin'
import { ContentEditor, type EditableBlock } from '@/components/admin/content-editor'

export const metadata = { title: 'Content · Admin' }

/** Public-site blocks the CMS knows how to surface (PRD §7.10). */
const CATALOG: { key: string; label: string; description: string }[] = [
  { key: 'hero', label: 'Homepage hero', description: 'Eyebrow, headline, subheadline' },
  { key: 'mission', label: 'Mission / About', description: 'Why-we-exist section + items' },
  { key: 'how_it_works', label: 'How it works', description: 'The ordered program steps' },
  { key: 'testimonials', label: 'Testimonials', description: 'Quotes shown on home + stories' },
  { key: 'partners', label: 'Partners', description: 'Partner names / logos' },
  { key: 'faq', label: 'FAQ', description: 'Questions & answers' },
  { key: 'stories', label: 'Impact stories', description: 'Featured stories list' },
  { key: 'contact_info', label: 'Contact info', description: 'Footer email, phone, address, socials' },
  { key: 'announcements', label: 'Announcements', description: 'Site-wide announcement banner' },
]

export default async function AdminContentPage() {
  await requireAccess('/admin/content')
  const rows = await listContentBlocks()
  const byKey = new Map(rows.map((r) => [r.block_key, r]))

  // Catalog blocks first (in a sensible edit order), then any extra DB blocks.
  const catalogKeys = new Set(CATALOG.map((c) => c.key))
  const catalogBlocks: EditableBlock[] = CATALOG.map((c) => {
    const row = byKey.get(c.key)
    return {
      block_key: c.key, label: c.label, description: c.description,
      content: row?.content ?? {}, updated_at: row?.updated_at ?? null,
    }
  })
  const extraBlocks: EditableBlock[] = rows
    .filter((r) => !catalogKeys.has(r.block_key))
    .map((r) => ({
      block_key: r.block_key, label: r.block_key, description: 'Custom content block',
      content: r.content, updated_at: r.updated_at,
    }))

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Content</h1>
        <p className="mt-1 text-muted-foreground">
          Edit the public website copy. Saving publishes immediately (revalidates the live pages).
        </p>
      </header>

      <ContentEditor blocks={[...catalogBlocks, ...extraBlocks]} />
    </div>
  )
}
