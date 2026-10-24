'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MapPin, Building, Sparkles } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'
import { CampusMap } from '@/components/marketing/campus-map'
import type { PublicCampusCard } from '@/types/database'
import { landingContent } from '@/app/(public)/content'

const FALLBACK_CAMPUSES: PublicCampusCard[] = [
  {
    id: 'niat-kkh',
    name: 'NIAT Hyderabad (KKH)',
    slug: 'niat-kkh',
    university_name: 'NIAT Campus',
    city: 'Hyderabad',
    state: 'Telangana',
    description: 'Active collegiate chapter in western Hyderabad.',
    hero_image_url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177876/DJI_20260711124202_0244_D_zgvqzo.jpg',
    lead_name: 'Sneha Reddy',
    lead_avatar_url: null,
    schools_reached: 9,
    students_impacted: 390,
    sessions_completed: 18,
  },
  {
    id: 'niat-cdu',
    name: 'NIAT Vijayawada (CDU)',
    slug: 'niat-cdu',
    university_name: 'NIAT Campus',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    description: 'Serving Krishna district government schools.',
    hero_image_url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177877/DJI_20260711131020_0287_D_rvh8gg.jpg',
    lead_name: 'Karthik M.',
    lead_avatar_url: null,
    schools_reached: 8,
    students_impacted: 340,
    sessions_completed: 16,
  },
  {
    id: 'niat-aurora',
    name: 'NIAT Hyderabad (Aurora)',
    slug: 'niat-aurora',
    university_name: 'NIAT Campus',
    city: 'Hyderabad',
    state: 'Telangana',
    description: 'Leading bilingual AI curriculum workshops.',
    hero_image_url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177864/IMG-20260406-WA0007_3_hboy0k.jpg',
    lead_name: 'Ananya S.',
    lead_avatar_url: null,
    schools_reached: 7,
    students_impacted: 310,
    sessions_completed: 14,
  },
  {
    id: 'niat-nsrit',
    name: 'NIAT Visakhapatnam (NSRIT)',
    slug: 'niat-nsrit',
    university_name: 'NIAT Campus',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    description: 'Coastal chapter with rural school outreach.',
    hero_image_url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177876/DJI_20260711124202_0244_D_zgvqzo.jpg',
    lead_name: 'Ravi Teja',
    lead_avatar_url: null,
    schools_reached: 4,
    students_impacted: 150,
    sessions_completed: 8,
  },
  {
    id: 'niat-chevella',
    name: 'NIAT Chevella',
    slug: 'niat-chevella',
    university_name: 'NIAT Campus',
    city: 'Chevella',
    state: 'Telangana',
    description: 'Deep outreach in peri-urban and rural schools.',
    hero_image_url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784178443/motion_photo_8450246088682134754_gtddpq.jpg',
    lead_name: 'Ahladini Sindhu Sri',
    lead_avatar_url: null,
    schools_reached: 5,
    students_impacted: 210,
    sessions_completed: 10,
  },
  {
    id: 'niat-ciet',
    name: 'NIAT Guntur (CIET)',
    slug: 'niat-ciet',
    university_name: 'NIAT Campus',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    description: 'Active campus chapter across Guntur mandals.',
    hero_image_url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177911/DJI_20260711132101_0313_D_a48glv.jpg',
    lead_name: 'Jahnavi Chandra',
    lead_avatar_url: null,
    schools_reached: 4,
    students_impacted: 160,
    sessions_completed: 8,
  }
]

export function WhereMovementIsGoingSection({
  campuses = FALLBACK_CAMPUSES,
}: {
  campuses?: PublicCampusCard[]
}) {
  const content = landingContent.whereMovementIsGoing
  const list = campuses.length > 0 ? campuses : FALLBACK_CAMPUSES
  const [activeSlug, setActiveSlug] = useState<string>(list[0]?.slug || 'niat-kkh')

  const active = list.find((c) => c.slug === activeSlug) ?? list[0]

  return (
    <section id="where-movement-is-going" className="tai-section relative overflow-hidden bg-background py-16 md:py-24">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 border-b border-foreground/15 pb-6 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.2em] text-brand">
                <span>{content.eyebrow}</span>
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
                  N&deg; 11
                </span>
              </div>

              <h2 className="tai-text-display mt-3 font-display text-foreground">
                {content.title}
              </h2>
            </div>
            <p className="max-w-xl text-base text-muted-foreground leading-relaxed md:text-lg">
              {content.subtitle}
            </p>
          </div>
        </Reveal>

        {/* Interactive Vector SVG Map + Campus Details */}
        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-center">
          {/* Map Slot */}
          <div className="lg:col-span-7">
            <Reveal>
              <CampusMap campuses={list} activeSlug={activeSlug} onSelect={setActiveSlug} />
            </Reveal>
          </div>

          {/* Active Campus Spotlight Details */}
          <div className="lg:col-span-5">
            <Reveal delay={0.15}>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand">
                    Active Chapter Spotlight
                  </span>
                  <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                    Live Operations
                  </span>
                </div>

                <h3 className="mt-3 font-display text-2xl font-bold text-foreground">
                  {active.name}
                </h3>

                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  {active.city}, {active.state}
                </p>

                {/* Chapter Stats */}
                <div className="mt-5 grid grid-cols-3 gap-2 border-y border-border/60 py-4 text-center">
                  <div>
                    <span className="block font-display text-xl font-bold text-brand">
                      {active.schools_reached}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground uppercase">
                      Schools
                    </span>
                  </div>
                  <div>
                    <span className="block font-display text-xl font-bold text-brand">
                      {active.students_impacted}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground uppercase">
                      Students
                    </span>
                  </div>
                  <div>
                    <span className="block font-display text-xl font-bold text-brand">
                      {active.sessions_completed}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground uppercase">
                      Sessions
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                  Student volunteers at this chapter coordinate directly with local mandal and zilla parishad schools to conduct structured four-session AI workshops.
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                  <Link
                    href={`/campuses/${active.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
                  >
                    View chapter reports <ArrowRight className="size-3.5" />
                  </Link>
                  <Link
                    href="/campuses"
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    All campuses &rarr;
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* State Breakdown Chips & Expansion Target */}
        <Reveal delay={0.25}>
          <div className="mt-12 rounded-2xl border border-brand/20 bg-brand/5 p-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand">
                  Upcoming Horizon
                </span>
                <p className="mt-1 text-sm font-semibold text-foreground md:text-base">
                  {content.expansionGoal}
                </p>
              </div>

              <Link
                href="#start-a-conversation"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-5 text-xs font-semibold text-white shadow-xs hover:bg-brand-deep shrink-0"
              >
                Launch a Chapter on Your Campus &rarr;
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
