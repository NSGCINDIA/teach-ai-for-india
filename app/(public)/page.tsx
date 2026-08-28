import type { Metadata } from 'next'
import { getImpactStats, getCampusCards, getContentBlock } from '@/lib/data/public'
import { HERO_FALLBACK, TESTIMONIALS_FALLBACK, type HeroContent, type TestimonialsContent } from '@/app/(public)/content'
import { Hero } from '@/components/marketing/hero'
import { Tension } from '@/components/marketing/tension'
import { SessionStory } from '@/components/marketing/session-story'
import { Evidence } from '@/components/marketing/evidence'
import { Network } from '@/components/marketing/network'
import { Voices } from '@/components/marketing/voices'
import { Invitation } from '@/components/marketing/invitation'

export const revalidate = 300

export const metadata: Metadata = {
  description:
    "India's first student-led AI education movement — bringing applied AI literacy to government school classrooms across Telangana and Andhra Pradesh.",
}

export default async function HomePage() {
  const [hero, stats, campuses, testimonials] = await Promise.all([
    getContentBlock<HeroContent>('hero', HERO_FALLBACK),
    getImpactStats(),
    getCampusCards(),
    getContentBlock<TestimonialsContent>('testimonials', TESTIMONIALS_FALLBACK),
  ])

  return (
    <>
      <Hero content={hero} />
      <Tension />
      <SessionStory />
      <Evidence stats={stats} />
      <Network campuses={campuses} />
      <Voices content={testimonials} />
      <Invitation />
    </>
  )
}
