import type { Metadata } from 'next'
import { listPublishedBlogs } from '@/lib/data/blogs'
import { StoriesHero } from '@/components/marketing/stories-hero'
import { StoriesFeaturedMoment } from '@/components/marketing/stories-featured-moment'
import { StoriesDashboard } from '@/components/marketing/stories-dashboard'
import { StoriesStudentProfiles } from '@/components/marketing/stories-student-profiles'
import { StoriesQuestionsSpotlight } from '@/components/marketing/stories-questions-spotlight'
import { StoriesEducatorVoices } from '@/components/marketing/stories-educator-voices'
import { StoriesVolunteerVoices } from '@/components/marketing/stories-volunteer-voices'
import { StoriesCampusJourneys } from '@/components/marketing/stories-campus-journeys'
import { StoriesGalleryWall } from '@/components/marketing/stories-gallery-wall'
import { StoriesDayJourney } from '@/components/marketing/stories-day-journey'
import { StoriesNumbersBridge } from '@/components/marketing/stories-numbers-bridge'
import { StoriesCtaCloser } from '@/components/marketing/stories-cta-closer'
import { Reveal } from '@/components/marketing/reveal'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Stories',
  description:
    'Every classroom has a story. Behind every number is a student who asked a question, tried something new, or discovered that AI could be something they could create with.',
}

export default async function StoriesPage() {
  const blogs = await listPublishedBlogs()

  return (
    <>
      {/* 1. HERO — THE PEOPLE BEHIND THE IMPACT */}
      <StoriesHero />

      {/* 2. FEATURED STORY — THE ALLU ARJUN MOMENT */}
      <StoriesFeaturedMoment />

      {/* 3. STORY COLLECTION — EDITORIAL STORY GRID & READER */}
      <section id="story-collection" className="relative overflow-hidden border-b border-border bg-background py-16 md:py-24">
        <div className="container-wide px-5 md:px-8 lg:px-16">
          <Reveal>
            <div className="mb-12 max-w-3xl">
              <span className="section-label text-brand">Field Archives</span>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl text-balance">
                Dispatches from the Classroom
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
                Explore documented reflections, milestone updates, and volunteer field reports
                from our regional campus chapters.
              </p>
            </div>
          </Reveal>

          <StoriesDashboard initialBlogs={blogs} />
        </div>
      </section>

      {/* 4. STUDENT STORIES — MEET THE STUDENTS */}
      <StoriesStudentProfiles />

      {/* 5. "WHEN STUDENTS ASK" — CLASSROOM INQUIRIES SPOTLIGHT */}
      <StoriesQuestionsSpotlight />

      {/* 6. EDUCATOR VOICES — TEACHERS SEE THE DIFFERENCE */}
      <StoriesEducatorVoices />

      {/* 7. VOLUNTEER STORIES — STUDENTS TEACHING STUDENTS */}
      <StoriesVolunteerVoices />

      {/* 8. CAMPUS STORIES — FROM CAMPUS TO CLASSROOM */}
      <StoriesCampusJourneys />

      {/* 9. PHOTO / VIDEO STORY WALL WITH LIGHTBOX */}
      <StoriesGalleryWall />

      {/* 10. "A DAY WITH TEACH AI" — CHRONOLOGICAL CLASSROOM JOURNEY */}
      <StoriesDayJourney />

      {/* 11. STORIES BEHIND THE NUMBERS — EMOTION & EVIDENCE */}
      <StoriesNumbersBridge />

      {/* 12. STORY SUBMISSION & 13. FINAL CTA */}
      <StoriesCtaCloser />
    </>
  )
}