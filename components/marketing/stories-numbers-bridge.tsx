'use client'

import Link from 'next/link'
import { ArrowRight, Building2, GraduationCap, PlayCircle, Sparkles, Users } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'
import { AnimatedCounter } from '@/components/shared/animated-counter'

const BRIDGES = [
  {
    count: 1842,
    suffix: '+',
    metric: 'Students',
    bridge: 'Real Classroom Moments',
    description:
      'Children who moved from simply watching video content to prompting, reasoning, and building with AI models.',
    icon: Users,
    color: 'text-brand',
  },
  {
    count: 20,
    suffix: '+',
    metric: 'Schools',
    bridge: 'Real School Communities',
    description:
      'Government high schools, primary schools, and state residential institutions partnering to bridge the digital divide.',
    icon: GraduationCap,
    color: 'text-brand-orange',
  },
  {
    count: 9,
    suffix: '',
    metric: 'Campuses',
    bridge: 'Real Student Teams',
    description:
      'NIAT campus chapters self-organizing outreach, hardware logistics, and classroom delivery in their home regions.',
    icon: Building2,
    color: 'text-brand-teal',
  },
  {
    count: 35,
    suffix: '+',
    metric: 'Sessions',
    bridge: 'Real Learning Experiences',
    description:
      'Interactive hands-on workshops delivered entirely free of cost to students and educators.',
    icon: PlayCircle,
    color: 'text-brand',
  },
]

export function StoriesNumbersBridge() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-card/25 py-16 md:py-24">
      <div className="container-wide px-5 md:px-8 lg:px-16">
        <Reveal>
          <div className="max-w-3xl">
            <span className="section-label text-brand">Emotion & Evidence</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl text-balance">
              Behind every number is a story.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
              Numbers document scale, but stories capture the shift in confidence. See how each verified
              metric connects to students, teachers, and NIAT student volunteers on the ground.
            </p>
          </div>
        </Reveal>

        {/* 4 Cards Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BRIDGES.map((b, idx) => {
            const Icon = b.icon
            return (
              <Reveal key={b.metric} delay={idx * 0.08} className="h-full">
                <div className="group flex h-full flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-soft-lg">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {b.metric} Reached
                      </span>
                      <Icon className={`size-4.5 ${b.color}`} />
                    </div>

                    <div className="mt-4 flex items-baseline gap-0.5 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
                      <AnimatedCounter value={b.count} />
                      {b.suffix && <span className={b.color}>{b.suffix}</span>}
                    </div>

                    <div className="mt-3 inline-block rounded-md bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground">
                      → {b.bridge}
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        {/* Explore Impact CTA */}
        <Reveal delay={0.2} className="mt-12 text-center">
          <Link
            href="/impact"
            className="group inline-flex items-center gap-2 rounded-xl bg-brand px-7 py-3 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand/90 hover:shadow-soft-lg"
          >
            Explore Our Impact
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
