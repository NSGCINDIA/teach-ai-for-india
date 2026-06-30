import type { Metadata } from 'next'
import { getCampusCards } from '@/lib/data/public'
import { PageHeader } from '@/components/marketing/page-header'
import { CampusGrid } from '@/components/marketing/campus-grid'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Campuses',
  description: 'Explore the student-led campus teams delivering applied AI education to schools across India.',
}

export default async function CampusesPage() {
  const campuses = await getCampusCards()

  return (
    <>
      <PageHeader
        eyebrow="Campuses"
        title="The teams behind the movement"
        description="Every campus is a self-organising group of student volunteers serving government schools in their own region."
      />

      <section className="section-padding">
        <div className="container-wide">
          <CampusGrid campuses={campuses} />
        </div>
      </section>
    </>
  )
}
