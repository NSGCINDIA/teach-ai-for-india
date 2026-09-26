'use client'

import Link from 'next/link'
import { ArrowRight, Building2, ChevronRight, GraduationCap, Sparkles, Users } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface Journey {
  campus: string
  team: string
  school: string
  classroom: string
  moment: string
  quoteAttribution: string
}

const JOURNEYS: Journey[] = [
  {
    campus: 'NIAT × KKH (Hyderabad)',
    team: '12 NIAT Student Facilitators',
    school: 'ZPHS Bachupally',
    classroom: '45 Students • Applied Prompting',
    moment: 'Anna, can it make a picture of Allu Arjun?',
    quoteAttribution: '— Class 8 Student, spontaneous cultural prompt',
  },
  {
    campus: 'NIAT × NSRIT (Visakhapatnam)',
    team: '8 NIAT Student Volunteers',
    school: 'ZPH High School Sontyam',
    classroom: '60 Students • Telugu Parameter Lab',
    moment: 'Technology literacy is about logical thinking, not English fluency.',
    quoteAttribution: '— Volunteer Lead on native language adoption',
  },
  {
    campus: 'NIAT × CDU (Hyderabad)',
    team: '6 NIAT Senior Volunteers',
    school: 'MPPS Nanakramguda',
    classroom: '30 Students • Tablet-Based Workshop',
    moment: 'Anna, when are you coming again?',
    quoteAttribution: '— Class 7 Student at session conclusion',
  },
]

export function StoriesCampusJourneys() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-16 md:py-24">
      <div className="container-wide px-5 md:px-8 lg:px-16">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="max-w-3xl">
              <span className="section-label text-brand">The Network in Action</span>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl text-balance">
                From NIAT campuses to government-school classrooms.
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
                Students across NIAT campuses are helping bring AI learning to more classrooms.
                See how university chapters connect with their nearby schools.
              </p>
            </div>

            <Link
              href="/campuses"
              className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground transition-all hover:border-brand/40 hover:bg-muted/40 shrink-0"
            >
              Explore All Campuses
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 text-brand" />
            </Link>
          </div>
        </Reveal>

        {/* 3 Journey Cards */}
        <div className="mt-12 space-y-6">
          {JOURNEYS.map((j, idx) => (
            <Reveal key={j.campus} delay={idx * 0.08}>
              <div className="group rounded-2xl border border-border/80 bg-card p-6 shadow-soft transition-all duration-300 hover:border-brand/30 hover:shadow-soft-lg">
                {/* Visual Pathway */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-center">
                  {/* Step 1: Campus */}
                  <div className="rounded-xl bg-muted/40 p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                      01 • CAMPUS
                    </span>
                    <h3 className="mt-1 font-display text-sm font-bold text-foreground">
                      {j.campus}
                    </h3>
                  </div>

                  {/* Step 2: Team */}
                  <div className="rounded-xl bg-muted/40 p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange">
                      02 • TEAM
                    </span>
                    <h3 className="mt-1 font-display text-sm font-bold text-foreground">
                      {j.team}
                    </h3>
                  </div>

                  {/* Step 3: School */}
                  <div className="rounded-xl bg-muted/40 p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                      03 • SCHOOL
                    </span>
                    <h3 className="mt-1 font-display text-sm font-bold text-foreground">
                      {j.school}
                    </h3>
                  </div>

                  {/* Step 4: Classroom */}
                  <div className="rounded-xl bg-muted/40 p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
                      04 • CLASSROOM
                    </span>
                    <h3 className="mt-1 font-display text-sm font-bold text-foreground">
                      {j.classroom}
                    </h3>
                  </div>

                  {/* Step 5: Student Moment */}
                  <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                      05 • MOMENT
                    </span>
                    <p className="mt-1 text-xs font-bold italic text-foreground line-clamp-2">
                      &quot;{j.moment}&quot;
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
