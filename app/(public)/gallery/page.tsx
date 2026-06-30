import type { Metadata } from 'next'
import { ImageIcon } from 'lucide-react'
import { getCampusCards, getPublicGallery } from '@/lib/data/public'
import { PageHeader } from '@/components/marketing/page-header'
import { GalleryFilters } from '@/components/shared/gallery-filters'
import { EmptyState } from '@/components/shared/states'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Photos and media from Teach AI for India sessions across government school classrooms.',
}

export default async function GalleryPage() {
  const [items, campuses] = await Promise.all([getPublicGallery(48), getCampusCards()])

  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="The movement in pictures"
        description="Moments captured across classrooms, campuses, and community sessions — every image is from a real, documented session."
      />

      <section className="section-padding">
        <div className="container-wide">
          {items.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="No photos published yet"
              description="Approved session photos will appear here as campuses upload and share them."
              action={{ label: 'Join the movement', href: '/join' }}
            />
          ) : (
            <GalleryFilters items={items} campuses={campuses.map((c) => ({ id: c.id, name: c.name }))} />
          )}
        </div>
      </section>
    </>
  )
}
