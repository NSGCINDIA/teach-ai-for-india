'use client'

import Link from 'next/link'
import { ArrowRight, Building, CheckCircle2, GraduationCap, HeartHandshake, Sparkles, Users } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

const REQUIREMENTS = [
  {
    title: 'A committed student team',
    desc: '4 to 8 undergraduates eager to share practical AI knowledge with younger students.',
    icon: Users,
  },
  {
    title: 'A campus coordinator/lead',
    desc: 'A dedicated student organizer to coordinate schedules, curriculum, and reporting.',
    icon: GraduationCap,
  },
  {
    title: 'A willingness to work with local schools',
    desc: 'A commitment to outreach to nearby government schools and deliver free sessions.',
    icon: HeartHandshake,
  },
]

export function CampusCtaSection() {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Section 11: Start a Campus */}
      <section id="start-a-campus" className="relative border-b border-border py-16 md:py-24">
        <div className="container-wide px-5 md:px-8 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left side text & CTA */}
            <div className="lg:col-span-6">
              <Reveal>
                <div>
                  <span className="section-label text-brand">Expansion</span>
                  <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl text-balance">
                    Could your campus be next?
                  </h2>
                  <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
                    Bring together students who want to learn, teach and create opportunities for others.
                    We equip your university team with vetted curricula, training, and school outreach frameworks.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      href="/join"
                      className="group inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand/90 hover:shadow-soft-lg"
                    >
                      Start a Campus
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <a
                      href="#requirements"
                      className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      View Requirements
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right side 3 simple requirements */}
            <div id="requirements" className="lg:col-span-6">
              <Reveal delay={0.1}>
                <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft-lg md:p-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand">
                    Three simple requirements
                  </span>
                  <div className="mt-6 space-y-4">
                    {REQUIREMENTS.map((req, idx) => {
                      const Icon = req.icon
                      return (
                        <div
                          key={req.title}
                          className="flex items-start gap-4 rounded-xl border border-border/60 bg-muted/25 p-4 transition-colors hover:border-brand/30"
                        >
                          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                            <Icon className="size-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-muted-foreground">
                                0{idx + 1}
                              </span>
                              <h3 className="font-display text-sm font-bold text-foreground">
                                {req.title}
                              </h3>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                              {req.desc}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Section 12: For Institutions */}
      <section className="relative border-b border-border bg-card/20 py-14 md:py-18">
        <div className="container-wide px-5 md:px-8 lg:px-16">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 rounded-2xl border border-border/80 bg-card p-6 shadow-soft md:p-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-teal">
                  <Building className="size-4" />
                  <span>For Universities & Colleges</span>
                </div>
                <h3 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
                  Want to bring Teach AI to your campus?
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed md:text-base">
                  We work with educational institutions and student communities to create opportunities
                  for students to contribute to real classroom learning.
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  href="/contact"
                  className="group inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-semibold text-foreground shadow-xs transition-all hover:border-brand/40 hover:bg-card"
                >
                  Partner With Us
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 text-brand" />
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
          className="pointer-events-none absolute -bottom-20 left-1/2 size-96 -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"
        />

        <div className="container-wide relative px-5 text-center md:px-8 lg:px-16">
          <Reveal>
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand/5 border border-brand/20 px-4 py-1.5 text-xs font-semibold text-brand">
                <Sparkles className="size-3.5" />
                <span>One Movement • Many Classrooms</span>
              </div>

              <h2 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl text-balance">
                One campus can start a classroom.
              </h2>

              <p className="mx-auto max-w-xl text-lg text-muted-foreground leading-relaxed md:text-xl text-pretty">
                The next student-led team could be yours.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link
                  href="/join"
                  className="group inline-flex h-13 items-center gap-2 rounded-xl bg-brand px-8 text-base font-semibold text-white shadow-soft transition-all hover:bg-brand/90 hover:shadow-soft-lg"
                >
                  Start a Campus
                  <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-13 items-center gap-2 rounded-xl border border-border bg-card px-8 text-base font-semibold text-foreground shadow-soft transition-all hover:border-brand/40 hover:bg-muted/40"
                >
                  Partner With Us →
                </Link>
              </div>

              <p className="pt-4 text-xs text-muted-foreground font-medium">
                Free for all partner government schools • 100% student-powered
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
