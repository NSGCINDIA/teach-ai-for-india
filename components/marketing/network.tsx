'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Reveal } from '@/components/marketing/reveal'
import { CampusMap } from '@/components/marketing/campus-map'
import type { PublicCampusCard } from '@/types/database'

const FALLBACK_IMAGES: Record<string, string> = {
  'niat-kkh': 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177876/DJI_20260711124202_0244_D_zgvqzo.jpg',
  'niat-cdu': 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177877/DJI_20260711131020_0287_D_rvh8gg.jpg',
  'niat-aurora': 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177864/IMG-20260406-WA0007_3_hboy0k.jpg',
  'niat-mrv': 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177867/IMG_20260324_121056961_prkzll.jpg',
  'niat-chevella': 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784178443/motion_photo_8450246088682134754_gtddpq.jpg',
}
const DEFAULT_IMAGE = 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177911/DJI_20260711132101_0313_D_a48glv.jpg'

/** "The Network" — one featured campus spotlight plus a chip row, standing in for an interactive map without the build cost or the gimmick risk. */
export function Network({ campuses }: { campuses: PublicCampusCard[] }) {
  const list = campuses.slice(0, 9)
  const [activeSlug, setActiveSlug] = useState(list[0]?.slug)
  const active = list.find((c) => c.slug === activeSlug) ?? list[0]

  if (!active) return null

  const image = active.hero_image_url || FALLBACK_IMAGES[active.slug] || DEFAULT_IMAGE

  return (
    <section className="tai-section bg-background">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <p className="tai-eyebrow text-brand">The campuses</p>
        <h2 className="tai-text-display mt-4 max-w-2xl font-display text-foreground">
          One campus became nine. One school became {active.schools_reached >= 18 ? 'eighteen' : 'many'}.
        </h2>

        <Reveal className="mt-10">
          <CampusMap campuses={list} activeSlug={active.slug} onSelect={setActiveSlug} />
        </Reveal>

        <Reveal className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl lg:col-span-7">
            <Image
              key={active.slug}
              src={image}
              alt={`Teach AI for India volunteers and students at ${active.name}`}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
            />
          </div>

          <div className="lg:col-span-5">
            <h3 className="font-display text-2xl text-foreground">{active.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{active.city}, {active.state}</p>
            <p className="mt-4 text-sm font-medium uppercase tracking-wide text-foreground">
              {active.schools_reached} schools · {active.students_impacted.toLocaleString('en-IN')} students ·{' '}
              {active.sessions_completed} sessions
            </p>
            {active.description && (
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">{active.description}</p>
            )}
            <Link
              href={`/campuses/${active.slug}`}
              className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand"
            >
              Explore this campus
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 flex gap-3 overflow-x-auto pb-2">
          {list.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveSlug(c.slug)}
              className={cn(
                'shrink-0 rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                c.slug === active.slug
                  ? 'border-brand bg-secondary text-foreground'
                  : 'border-border text-muted-foreground hover:border-border-hover hover:text-foreground',
              )}
            >
              <span className="block font-semibold">{c.name}</span>
              <span className="block text-xs text-muted-foreground">{c.students_impacted.toLocaleString('en-IN')} students</span>
            </button>
          ))}
        </div>

        <Link href="/campuses" className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand">
          See all {list.length} campuses
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
    </section>
  )
}
