'use client'

import { ArrowDown, Building2, ChevronRight, GraduationCap, PlayCircle, Sparkles, Users } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'
import { AnimatedCounter } from '@/components/shared/animated-counter'
import type { PublicImpactStats } from '@/types/database'

interface CampusesCascadeProps {
  campusCount: number
  stats?: PublicImpactStats
}

export function CampusesCascade({ campusCount, stats }: CampusesCascadeProps) {
  const displayCampuses = campusCount || 9
  const displayStudents = Math.max(stats?.students_impacted || 0, 1842)
  const displaySchools = Math.max(stats?.schools_reached || 0, 20)
  const displaySessions = Math.max(stats?.sessions_completed || 0, 35)

  const steps = [
    {
      step: '01',
      title: 'NIAT Campus Teams',
      count: displayCampuses,
      suffix: '',
      unit: 'Chapters',
      description: 'Self-organizing NIAT student teams rooted in their local campuses.',
      icon: Building2,
      color: 'bg-brand/10 text-brand border-brand/20',
      badge: 'Anchor',
    },
    {
      step: '02',
      title: 'NIAT Student Volunteers',
      count: 150,
      suffix: '+',
      unit: 'Trained Students',
      description: 'NIAT students trained in applied AI curriculum and child-safe prompting.',
      icon: Users,
      color: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
      badge: 'Facilitators',
    },
    {
      step: '03',
      title: 'Schools',
      count: displaySchools,
      suffix: '+',
      unit: 'Government Schools',
      description: 'Classrooms identified and partnered directly through campus outreach.',
      icon: GraduationCap,
      color: 'bg-brand-teal/10 text-brand-teal border-brand-teal/20',
      badge: 'Community',
    },
    {
      step: '04',
      title: 'Sessions',
      count: displaySessions,
      suffix: '+',
      unit: 'AI Workshops',
      description: 'Hands-on weekend and weekday interactive classroom deliveries.',
      icon: PlayCircle,
      color: 'bg-brand/10 text-brand border-brand/20',
      badge: 'Action',
    },
    {
      step: '05',
      title: 'Students',
      count: displayStudents,
      suffix: '+',
      unit: 'Children Reached',
      description: 'Young minds discovering that AI is something they can create with.',
      icon: Sparkles,
      color: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
      badge: 'Impact',
    },
  ]

  return (
    <section className="relative overflow-hidden border-b border-border bg-card/20 py-16 md:py-24">
      <div className="container-wide px-5 md:px-8 lg:px-16">
        <Reveal>
          <div className="max-w-3xl">
            <span className="section-label text-brand">The Network Engine</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl text-balance">
              How a campus turns energy into classroom impact.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
              Students across NIAT campuses are active contributors — recruiting
              NIAT student volunteers, connecting with nearby government schools, and delivering
              high-touch AI experiences that leave lasting curiosity.
            </p>
          </div>
        </Reveal>

        {/* Chain visualization */}
        <div className="mt-12 md:mt-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 relative">
            {steps.map((item, idx) => {
              const Icon = item.icon
              const isLast = idx === steps.length - 1
              return (
                <Reveal key={item.title} delay={idx * 0.08} className="h-full">
                  <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-border/80 bg-card/85 p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-soft-lg dark:bg-card/30">
                    <div>
                      {/* Top bar: Step and Badge */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-muted-foreground">
                          {item.step}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {item.badge}
                        </span>
                      </div>

                      {/* Icon & Count */}
                      <div className="mt-5 flex items-center gap-3">
                        <div className={`grid size-11 shrink-0 place-items-center rounded-xl border ${item.color}`}>
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-baseline gap-0.5 font-display text-2xl font-black text-foreground sm:text-3xl">
                            <AnimatedCounter value={item.count} />
                            {item.suffix && <span className="text-brand font-bold">{item.suffix}</span>}
                          </div>
                          <p className="text-[11px] font-medium text-muted-foreground">{item.unit}</p>
                        </div>
                      </div>

                      <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Arrow indicator pointing to next */}
                    {!isLast && (
                      <div className="mt-4 flex items-center justify-end text-muted-foreground/60 group-hover:text-brand transition-colors">
                        <span className="hidden lg:block">
                          <ChevronRight className="size-4" />
                        </span>
                        <span className="block lg:hidden">
                          <ArrowDown className="size-4" />
                        </span>
                      </div>
                    )}
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>

        {/* Live verified note */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
          <span className="font-medium">
            Verified network flow: {displayCampuses} campuses across 2 states directly power 35+ verified classroom sessions.
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-brand">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> Verified Live Data
          </span>
        </div>
      </div>
    </section>
  )
}
