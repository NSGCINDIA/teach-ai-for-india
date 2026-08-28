'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useReducedMotion } from 'framer-motion'
import { ensureGsapRegistered, gsap, ScrollTrigger } from '@/lib/gsap'

interface Moment {
  label: string
  image: string
  alt: string
  quote?: string
  body: string
}

const MOMENTS: Moment[] = [
  {
    label: 'The school',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177864/WhatsApp_Image_2026-04-18_at_14.46.43_vtswq0.jpg',
    alt: 'A government school classroom before a Teach AI for India session begins',
    body: 'ZPHS Bachupally. Most students here have never seen an AI tool before today.',
  },
  {
    label: 'The setup',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177877/DJI_20260711131020_0287_D_rvh8gg.jpg',
    alt: 'NIAT x CDU volunteers preparing tablets for a hands-on AI workshop',
    body: 'Two volunteers. A handful of tablets. One class period to work with.',
  },
  {
    label: 'The first prompt',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177864/IMG-20260406-WA0007_3_hboy0k.jpg',
    alt: 'A student typing their first AI prompt during a Teach AI for India session',
    quote: '"Anna, can it make a picture of Allu Arjun?"',
    body: 'They already knew AI existed. They just had never been shown what else it could do.',
  },
  {
    label: 'The moment',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177867/IMG_20260324_121056961_prkzll.jpg',
    alt: 'A full classroom of students engaged during an AI literacy session',
    body: 'A full classroom. The room went quiet the moment the first AI-generated image appeared on screen.',
  },
  {
    label: 'The proof',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177911/DJI_20260711132101_0313_D_a48glv.jpg',
    alt: 'Students asking volunteers questions after an AI literacy session',
    quote: '"Anna, when are you coming again?"',
    body: "That's when we knew this wasn't just a workshop. It was useful.",
  },
]

/**
 * "This is what it looks like" — horizontal scroll-storytelling on desktop
 * (pinned viewport, vertical scroll drives horizontal translation), a plain
 * vertical stack everywhere else. No other part of the site shows the work at
 * this level of concreteness, which is the point.
 */
export function SessionStory() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    const progress = progressRef.current
    if (!section || !track || !progress || reduce) return

    ensureGsapRegistered()
    const mm = gsap.matchMedia()

    mm.add('(min-width: 1024px)', () => {
      const getDistance = () => track.scrollWidth - section.clientWidth
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${getDistance()}`,
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          gsap.set(track, { x: -getDistance() * self.progress })
          gsap.set(progress, { scaleX: self.progress })
        },
      })
      return () => st.kill()
    })

    return () => mm.revert()
  }, [reduce])

  return (
    <section id="session" className="tai-section bg-background">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <p className="tai-eyebrow text-brand">Inside a session</p>
        <h2 className="tai-text-display mt-4 max-w-2xl font-display text-foreground">
          This is what it looks like when a classroom meets AI for the first time.
        </h2>
      </div>

      <div ref={sectionRef} className="relative mt-14 lg:h-screen lg:overflow-hidden">
        <div
          ref={trackRef}
          className="flex flex-col gap-6 px-5 md:px-8 lg:h-full lg:flex-row lg:items-center lg:gap-10 lg:px-12"
        >
          {MOMENTS.map((moment) => (
            <article
              key={moment.label}
              className="flex flex-col gap-6 lg:w-[70vw] lg:flex-shrink-0 lg:flex-row lg:items-center lg:gap-12 xl:w-[62vw]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl lg:aspect-[3/2] lg:w-[58%]">
                <Image
                  src={moment.image}
                  alt={moment.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="lg:w-[42%]">
                <span className="tai-eyebrow text-brand">{moment.label}</span>
                {moment.quote && (
                  <p className="mt-3 font-display text-2xl italic text-foreground md:text-3xl">{moment.quote}</p>
                )}
                <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">{moment.body}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mx-5 mt-6 hidden h-0.5 overflow-hidden rounded-full bg-border md:mx-8 lg:mx-12 lg:block">
          <div ref={progressRef} className="h-full w-full origin-left scale-x-0 bg-brand" />
        </div>
      </div>
    </section>
  )
}
