import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getImpactStats, getCampusCards, getContentBlock } from '@/lib/data/public'
import {
  HERO_FALLBACK,
  MISSION_FALLBACK,
  HOW_IT_WORKS_FALLBACK,
  TESTIMONIALS_FALLBACK,
  PARTNERS_FALLBACK,
  type HeroContent,
  type MissionContent,
  type HowItWorksContent,
  type TestimonialsContent,
  type PartnersContent,
} from '@/app/(public)/content'
import { Hero } from '@/components/marketing/hero'
import { ImpactBar } from '@/components/marketing/impact-bar'
import { Mission } from '@/components/marketing/mission'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { Testimonials } from '@/components/marketing/testimonials'
import { Partners } from '@/components/marketing/partners'
import { CtaBand } from '@/components/marketing/cta-band'
import { CampusGrid } from '@/components/marketing/campus-grid'
import { SectionHeading } from '@/components/shared/section-heading'
import { Reveal } from '@/components/marketing/reveal'

export const revalidate = 300

export const metadata: Metadata = {
  description:
    "India's first student-led AI education movement — bringing applied AI literacy to government school classrooms across Telangana and Andhra Pradesh.",
}

export default async function HomePage() {
  const [hero, stats, mission, howItWorks, campuses, testimonials, partners] = await Promise.all([
    getContentBlock<HeroContent>('hero', HERO_FALLBACK),
    getImpactStats(),
    getContentBlock<MissionContent>('mission', MISSION_FALLBACK),
    getContentBlock<HowItWorksContent>('how_it_works', HOW_IT_WORKS_FALLBACK),
    getCampusCards(),
    getContentBlock<TestimonialsContent>('testimonials', TESTIMONIALS_FALLBACK),
    getContentBlock<PartnersContent>('partners', PARTNERS_FALLBACK),
  ])

  return (
    <>
      <Hero content={hero} />

      {/* Impact bar */}
      <section className="section-padding-sm">
        <div className="container-wide">
          <Reveal>
            <ImpactBar stats={stats} />
          </Reveal>
        </div>
      </section>

      <Mission content={mission} />

      <HowItWorks content={howItWorks} />

      {/* Campuses */}
      <section className="section-padding">
        <div className="container-wide">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading
                align="left"
                eyebrow="On the ground"
                title="Campuses powering the movement"
                description="Each campus is a self-organising team of student volunteers serving schools in their region."
                className="max-w-xl"
              />
              <Button asChild variant="outline" className="group shrink-0">
                <Link href="/campuses">
                  All campuses
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </Button>
            </div>
          </Reveal>
          <div className="mt-12">
            <CampusGrid campuses={campuses.slice(0, 6)} />
          </div>
        </div>
      </section>

      <Testimonials content={testimonials} />

      <Partners content={partners} />

      <CtaBand />
    </>
  )
}
