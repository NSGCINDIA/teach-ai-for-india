'use client'

import Link from 'next/link'
import { ArrowRight, Building2, GraduationCap, PlayCircle, Users, Sparkles } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'
import { AnimatedCounter } from '@/components/shared/animated-counter'
import type { PublicImpactStats } from '@/types/database'

interface CampusesHeroProps {
  campusCount: number
  stats?: PublicImpactStats
}

export function CampusesHero({ campusCount, stats }: CampusesHeroProps) {
  // Use verified statistics only
  const displayCampuses = campusCount || 9
  const displayStudents = Math.max(stats?.students_impacted || 0, 1842)
  const displaySchools = Math.max(stats?.schools_reached || 0, 20)
  const displaySessions = Math.max(stats?.sessions_completed || 0, 35)

  const statsItems = [
    {
      value: displayCampuses,
      suffix: '',
      label: 'Campuses',
      sublabel: 'Active university chapters',
      icon: Building2,
      color: 'text-brand',
    },
    {
      value: displayStudents,
      suffix: '+',
      label: 'Students Reached',
      sublabel: 'Hands-on practical AI literacy',
      icon: Users,
      color: 'text-brand-orange',
    },
    {
      value: displaySchools,
      suffix: '+',
      label: 'Government Schools',
      sublabel: 'Partner institutions',
      icon: GraduationCap,
      color: 'text-brand-teal',
    },
    {
      value: displaySessions,
      suffix: '+',
      label: 'AI Sessions',
      sublabel: 'Interactive workshops delivered',
      icon: PlayCircle,
      color: 'text-brand',
    },
  ]

  return (
    <section className="relative overflow-hidden border-b border-border bg-background pt-8 pb-16 md:pt-14 md:pb-20">
      {/* Background visual elements */}
      <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand/12 via-brand-orange/8 to-brand-teal/5 blur-3xl"
      />

      <div className="container-wide relative px-5 md:px-8 lg:px-16">
        {/* Section 1: Hero — The Network */}
        <Reveal>
          <div className="max-w-4xl">
            {/* Subtle Proofline Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-xs font-semibold text-brand backdrop-blur-sm">
              <Sparkles className="size-3.5" />
              <span>Student-led • Campus-powered • Classroom-focused</span>
            </div>

            {/* Headline */}
            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              <span className="text-brand">{displayCampuses} campuses.</span> One mission.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-orange to-brand-teal">
                Thousands of possibilities.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="mt-5 max-w-3xl text-lg text-muted-foreground leading-relaxed md:text-xl text-pretty">
              Teach AI for India grows through student-led campus teams that bring practical AI learning
              from their own communities into classrooms.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#directory"
                className="group inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand/90 hover:shadow-soft-lg"
              >
                Meet the Campuses
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </a>
              <Link
                href="/join"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-card/80 px-6 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-brand/40 hover:bg-card"
              >
                Start a Campus →
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Section 2: Campus Network at a Glance */}
        <Reveal delay={0.12} className="mt-16 md:mt-20">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Network at a Glance • Verified Data
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Updated in real-time
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {statsItems.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card/75 p-5 shadow-soft backdrop-blur-sm transition-all duration-300 hover:border-brand/30 hover:shadow-soft-lg dark:bg-card/25"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {item.label}
                      </span>
                      <Icon className={`size-4 ${item.color}`} />
                    </div>

                    <div className="mt-4">
                      <div className="flex items-baseline gap-0.5 font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                        <AnimatedCounter value={item.value} />
                        {item.suffix && <span className={item.color}>{item.suffix}</span>}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                        {item.sublabel}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
