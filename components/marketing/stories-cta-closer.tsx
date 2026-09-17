'use client'

import Link from 'next/link'
import { ArrowRight, HeartHandshake, MessageSquarePlus, Sparkles, School } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

export function StoriesCtaCloser() {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Section 12: Story Submission */}
      <section className="relative border-b border-border bg-card/20 py-14 md:py-18">
        <div className="container-wide px-5 md:px-8 lg:px-16">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 rounded-3xl border border-border/80 bg-card p-6 shadow-soft md:p-10">
              <div className="max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand">
                  <MessageSquarePlus className="size-4" />
                  <span>Community Voices</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                  Have a Teach AI story to share?
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed md:text-base">
                  Tell us about a moment that stayed with you — whether you are a volunteer who
                  taught, a teacher who hosted, or a partner who visited.
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  href="/contact?subject=Share+a+Story"
                  className="group inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand/90 hover:shadow-soft-lg"
                >
                  Share Your Story
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Section 13: Final CTA */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid opacity-30" />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"
        />

        <div className="container-wide relative px-5 text-center md:px-8 lg:px-16">
          <Reveal>
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand/5 border border-brand/20 px-4 py-1.5 text-xs font-semibold text-brand">
                <Sparkles className="size-3.5" />
                <span>Every Number Has a Face • Every Classroom Has a Story</span>
              </div>

              <h2 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl text-balance">
                Some stories start with a question.
              </h2>

              <p className="mx-auto max-w-xl text-lg text-muted-foreground leading-relaxed md:text-xl text-pretty">
                Help us create more classrooms where students can ask, experiment, and discover.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link
                  href="/contact"
                  className="group inline-flex h-13 items-center gap-2 rounded-xl bg-brand px-8 text-base font-semibold text-white shadow-soft transition-all hover:bg-brand/90 hover:shadow-soft-lg"
                >
                  Partner With Us
                  <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/contact#schools"
                  className="inline-flex h-13 items-center gap-2 rounded-xl border border-border bg-card px-8 text-base font-semibold text-foreground shadow-soft transition-all hover:border-brand/40 hover:bg-muted/40"
                >
                  <School className="size-4.5 text-brand-teal" />
                  Bring Teach AI to Your School →
                </Link>
              </div>

              <p className="pt-4 text-xs text-muted-foreground font-medium">
                Always free for government schools • Driven by student communities
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
