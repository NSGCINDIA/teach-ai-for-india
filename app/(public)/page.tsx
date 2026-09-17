import type { Metadata } from 'next'
import { getImpactStats, getCampusCards, getContentBlock } from '@/lib/data/public'
import { HERO_FALLBACK, TESTIMONIALS_FALLBACK, type HeroContent, type TestimonialsContent } from '@/app/(public)/content'
import { Hero } from '@/components/marketing/hero'
import { Tension } from '@/components/marketing/tension'
import { Evidence } from '@/components/marketing/evidence'
import { FundraisingTiers } from '@/components/marketing/fundraising-tiers'
import { AlluArjunMoment } from '@/components/marketing/allu-arjun-moment'
import { FieldVideoReel } from '@/components/marketing/field-video-reel'
import { BeforeAfter } from '@/components/marketing/before-after'
import { PartnerCSR } from '@/components/marketing/partner-csr'
import { Transparency } from '@/components/marketing/transparency'
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
      {/* 1. HERO SECTION: Immediate mission and impact */}
      <Hero content={hero} />

      {/* PROBLEM: The digital and AI divide */}
      <Tension />

      {/* 2. IMPACT SECTION: Large numbers & emotional line directly after problem */}
      <Evidence stats={stats} />

      {/* 3. FUNDRAISING SECTION: Your support becomes a classroom */}
      <FundraisingTiers />

      {/* 4. REAL CLASSROOM STORY: Allu Arjun moment & 5-step storytelling flow */}
      <AlluArjunMoment />

      {/* 5. SEE TEACH AI IN ACTION: Prominent 45s raw field documentary reel */}
      <FieldVideoReel />

      {/* 6. BEFORE -> AFTER IMPACT: Observable classroom transformation */}
      <BeforeAfter />

      {/* 7. WHY PARTNER WITH TEACH AI: Dedicated CSR and donor collaboration */}
      <PartnerCSR />

      {/* 8. TRANSPARENCY: Where your support goes & verified reports repository */}
      <Transparency />

      {/* CAMPUS NETWORK: Student-led collegiate chapters */}
      <Network campuses={campuses} />

      {/* 9. STUDENT TESTIMONIALS: Authentic voices from the ground */}
      <Voices content={testimonials} />

      {/* 10. FINAL CTA: Simple, strong closing invitation */}
      <Invitation />
    </>
  )
}
