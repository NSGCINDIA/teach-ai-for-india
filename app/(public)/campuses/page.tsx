import type { Metadata } from 'next'
import { getCampusCards, getImpactStats } from '@/lib/data/public'
import { CampusesHero } from '@/components/marketing/campuses-hero'
import { CampusesCascade } from '@/components/marketing/campuses-cascade'
import { CampusesDashboard } from '@/components/marketing/campuses-dashboard'
import { CampusOperatingModel } from '@/components/marketing/campus-operating-model'
import { CampusStoriesSection } from '@/components/marketing/campus-stories-section'
import { CampusTeamSection } from '@/components/marketing/campus-team-section'
import { CampusGalleryMoments } from '@/components/marketing/campus-gallery-moments'
import { CampusWhySection } from '@/components/marketing/campus-why-section'
import { CampusCtaSection } from '@/components/marketing/campus-cta-section'
import { Reveal } from '@/components/marketing/reveal'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Campuses',
  description:
    'Teach AI for India grows through student-led campus teams that bring practical AI learning from their own communities into classrooms.',
}

export default async function CampusesPage() {
  const [allCampuses, stats] = await Promise.all([
    getCampusCards(),
    getImpactStats(),
  ])

  // Filter out any developmental/test records to ensure strictly verified campuses
  const campuses = allCampuses.filter(
    (c) =>
      !c.slug.includes('testing') &&
      !c.name.toLowerCase().includes('testing') &&
      !c.university_name.toLowerCase().includes('anna ey'),
  )

  const campusCount = campuses.length || 9

  return (
    <>
      {/* 1. HERO — THE NETWORK & 2. CAMPUS NETWORK AT A GLANCE */}
      <CampusesHero campusCount={campusCount} stats={stats} />

      {/* 7. CAMPUS IMPACT — THE NETWORK ENGINE CASCADE */}
      <CampusesCascade campusCount={campusCount} stats={stats} />

      {/* 3. CAMPUS DIRECTORY & MAP EXPLORER */}
      <section id="directory" className="relative overflow-hidden border-b border-border bg-background py-16 md:py-24">
        <div className="container-wide px-5 md:px-8 lg:px-16">
          <Reveal>
            <div className="mb-10 max-w-3xl">
              <span className="section-label text-brand">Campus Directory</span>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl text-balance">
                Meet the campuses powering the classrooms.
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
                Explore individual chapters run by local university students. Search by campus or
                filter by state to see schools reached, students engaged, and delivered sessions.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <CampusesDashboard campuses={campuses} />
          </Reveal>
        </div>
      </section>

      {/* 5. HOW A CAMPUS WORKS — THE 6-STEP OPERATING MODEL */}
      <CampusOperatingModel />

      {/* 4. CAMPUS STORIES — FROM CAMPUS TO CLASSROOM */}
      <CampusStoriesSection />

      {/* 6. CAMPUS LEADERS / TEAM — THE STUDENTS BEHIND THE CLASSROOMS */}
      <CampusTeamSection />

      {/* 8. CAMPUS GALLERY & 9. STUDENT MOMENTS */}
      <CampusGalleryMoments />

      {/* 10. "WHY CAMPUS-LED?" */}
      <CampusWhySection />

      {/* 11. START A CAMPUS, 12. FOR INSTITUTIONS & 13. FINAL CTA */}
      <CampusCtaSection />
    </>
  )
}
