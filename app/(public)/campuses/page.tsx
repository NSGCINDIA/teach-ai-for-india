import type { Metadata } from 'next'
import { getCampusCards } from '@/lib/data/public'
import { PageHeader } from '@/components/marketing/page-header'
import { CampusesDashboard } from '@/components/marketing/campuses-dashboard'
import { Reveal } from '@/components/marketing/reveal'

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
        title={
          <>
            The teams behind the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-orange to-brand-teal">
              movement
            </span>
          </>
        }
        description="Every campus is a self-organizing group of student volunteers serving government schools in their own region."
      />

      <section className="section-padding">
        <div className="container-wide">
          <Reveal delay={0.08}>
            <CampusesDashboard campuses={campuses} />
          </Reveal>
        </div>
      </section>
    </>
  )
}
