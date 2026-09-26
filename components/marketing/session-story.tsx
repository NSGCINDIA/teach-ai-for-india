'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'
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

export function SessionStory() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [activeMobileIdx, setActiveMobileIdx] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    const progress = progressRef.current
    if (!section || !track || !progress || reduce) return

    ensureGsapRegistered()
    const mm = gsap.matchMedia()

    mm.add('(min-width: 1024px)', () => {
      const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth + 120)

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 1, // Smooth, interpolated physics matching Lenis
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      tl.to(track, {
        x: () => -getDistance(),
        ease: 'none',
      })

      tl.to(
        progress,
        {
          scaleX: 1,
          ease: 'none',
        },
        0
      )

      return () => {
        tl.kill()
      }
    })

    // Refresh after images load to ensure precise dimensions
    const timer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 600)

    return () => {
      clearTimeout(timer)
      mm.revert()
    }
  }, [reduce])

  const scrollMobile = (direction: 'next' | 'prev') => {
    if (!trackRef.current) return
    const newIdx =
      direction === 'next'
        ? Math.min(MOMENTS.length - 1, activeMobileIdx + 1)
        : Math.max(0, activeMobileIdx - 1)
    setActiveMobileIdx(newIdx)
    const itemWidth = trackRef.current.clientWidth * 0.85
    trackRef.current.scrollTo({
      left: newIdx * itemWidth,
      behavior: 'smooth',
    })
  }

  return (
    <section
      ref={sectionRef}
      id="session"
      className="relative overflow-hidden bg-background py-8 lg:py-10 lg:h-screen lg:flex lg:flex-col lg:justify-between"
    >
      <div className="tai-container-wide shrink-0 px-5 md:px-8 lg:px-12">
        <div className="flex items-end justify-between">
          <div>
            <p className="tai-eyebrow text-brand">Inside a session</p>
            <h2 className="tai-text-display mt-2 max-w-4xl font-display text-foreground">
              This is what it looks like when a classroom meets AI for the first time.
            </h2>
          </div>

          {/* Mobile Swiper Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => scrollMobile('prev')}
              disabled={activeMobileIdx === 0}
              className="flex size-9 items-center justify-center rounded-full border border-foreground/20 bg-background text-foreground disabled:opacity-30"
              aria-label="Previous story"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              onClick={() => scrollMobile('next')}
              disabled={activeMobileIdx === MOMENTS.length - 1}
              className="flex size-9 items-center justify-center rounded-full border border-foreground/20 bg-background text-foreground disabled:opacity-30"
              aria-label="Next story"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative my-auto mt-6 flex-1 flex flex-col justify-center overflow-hidden lg:mt-0">
        <div
          ref={trackRef}
          className="flex gap-6 overflow-x-auto px-5 pb-4 md:px-8 lg:flex-row lg:items-center lg:gap-10 lg:overflow-visible lg:px-12 lg:pb-0 scroll-smooth no-scrollbar snap-x snap-mandatory lg:snap-none"
          style={{ willChange: 'transform' }}
        >
          {MOMENTS.map((moment, idx) => (
            <article
              key={moment.label}
              className="flex w-[85vw] shrink-0 snap-center flex-col gap-6 rounded-2xl border border-foreground/10 bg-card/40 p-5 sm:w-[70vw] md:w-[60vw] lg:w-[68vw] lg:flex-row lg:items-center lg:gap-10 lg:border-none lg:bg-transparent lg:p-0 xl:w-[62vw]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg lg:aspect-[16/10] lg:w-[56%]">
                <Image
                  src={moment.image}
                  alt={moment.alt}
                  fill
                  sizes="(max-width: 1024px) 85vw, 50vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="lg:w-[44%]">
                <span className="tai-eyebrow text-brand">
                  {idx + 1}. {moment.label}
                </span>
                {moment.quote && (
                  <p className="mt-2.5 font-display text-2xl italic text-foreground md:text-3xl lg:text-4xl">
                    {moment.quote}
                  </p>
                )}
                <p className="mt-2.5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  {moment.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Desktop Progress Bar */}
      <div className="tai-container-wide shrink-0 px-5 pt-3 md:px-8 lg:px-12">
        <div className="hidden h-1 overflow-hidden rounded-full bg-border lg:block">
          <div ref={progressRef} className="h-full w-full origin-left scale-x-0 bg-brand transition-transform duration-75" />
        </div>
      </div>
    </section>
  )
}
