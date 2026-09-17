'use client'

import Image from 'next/image'
import { Sparkles, ArrowDown, BookOpen } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

export function StoriesHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background pt-10 pb-16 md:pt-16 md:pb-24">
      {/* Background dot grid and warm glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid opacity-35" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[44rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand/15 via-brand-orange/10 to-brand-teal/5 blur-3xl"
      />

      <div className="container-wide relative px-5 md:px-8 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left Text */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="space-y-6">
                {/* Proofline */}
                <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-xs font-semibold text-brand backdrop-blur-sm">
                  <Sparkles className="size-3.5" />
                  <span>The Emotional Heart • Authentic Field Notes • Student Voices</span>
                </div>

                {/* Headline */}
                <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
                  Every classroom{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-orange to-brand-teal">
                    has a story.
                  </span>
                </h1>

                {/* Supporting Text */}
                <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed md:text-xl text-pretty">
                  Behind every number is a student who asked a question, tried something new,
                  or discovered that AI could be something they could create with.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <a
                    href="#featured-moment"
                    className="group inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand/90 hover:shadow-soft-lg"
                  >
                    The Classroom Moment
                    <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" />
                  </a>
                  <a
                    href="#story-collection"
                    className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-card/80 px-6 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-brand/40 hover:bg-card"
                  >
                    <BookOpen className="size-4 text-brand" />
                    Read Field Notes
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Cinematic Hero Image */}
          <div className="lg:col-span-5">
            <Reveal delay={0.1}>
              <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border/80 bg-muted shadow-soft-lg sm:aspect-[16/11]">
                <Image
                  src="https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_900/v1784177864/WhatsApp_Image_2026-04-18_at_14.46.43_vtswq0.jpg"
                  alt="Teach AI for India students learning prompt engineering in classroom"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Image Overlay Label */}
                <div className="absolute bottom-4 inset-x-4 text-white">
                  <span className="inline-block rounded-md bg-brand-orange px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    ZPHS Bachupally
                  </span>
                  <p className="mt-1 font-display text-sm font-bold leading-snug">
                    A classroom experiencing generative AI for the very first time.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
