'use client'

import { HelpCircle, Sparkles, BookOpen, Users, Building, ShieldCheck } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

export function FAQHero() {
  const quickAudiences = [
    { label: 'Students', icon: BookOpen },
    { label: 'Volunteers', icon: Users },
    { label: 'Schools', icon: Building },
    { label: 'CSR & Partners', icon: ShieldCheck },
  ]

  return (
    <section className="relative overflow-hidden border-b border-border bg-background pt-12 pb-14 md:pt-20 md:pb-18">
      {/* Subtle background decoration */}
      <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid opacity-35" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-brand/5 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 left-1/4 h-80 w-80 rounded-full bg-brand-orange/5 blur-3xl"
      />

      <div className="container-wide relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <Reveal>
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand mb-6 shadow-soft">
            <HelpCircle className="size-3.5" />
            <span>Help Center & FAQ</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-6">
            Questions?{' '}
            <span className="bg-gradient-to-r from-brand via-brand-orange to-brand-amber bg-clip-text text-transparent">
              Start here.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8 font-serif sm:font-sans">
            Everything you need to know about Teach AI for India, our classrooms powered by NIAT students, campus chapters, and how you can get involved.
          </p>

          {/* Audience quick tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-medium text-muted-foreground">
            <span className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold mr-1">
              Answers for:
            </span>
            {quickAudiences.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-foreground/80 shadow-soft"
              >
                <Icon className="size-3 text-brand" />
                {label}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
