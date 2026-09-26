'use client'

import Link from 'next/link'
import {
  Building2,
  GraduationCap,
  BookOpen,
  Users2,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Award,
} from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface PartnerPillar {
  id: string
  title: string
  tagline: string
  description: string
  icon: typeof Building2
  outcomes: string[]
}

const PARTNER_CARDS: PartnerPillar[] = [
  {
    id: 'school',
    title: 'Sponsor a School',
    tagline: 'Comprehensive school-wide rollout',
    description:
      'Adopt an entire government school. Covers multi-week practical AI curriculum delivery across classes 7 through 10, headmaster alignment, and a student AI demo exhibition.',
    icon: Building2,
    outcomes: [
      '100–150+ students in hands-on sessions',
      'School leadership integration & feedback',
      'Audited field report with photo logs',
    ],
  },
  {
    id: 'classroom',
    title: 'Sponsor a Classroom',
    tagline: 'Direct cohort transformation',
    description:
      'Enable an individual grade to experience applied AI. Covers hardware access kits, mobile hotspot connectivity, and NIAT student volunteer facilitators.',
    icon: GraduationCap,
    outcomes: [
      '30+ students in hands-on workshops',
      'Live cloud AI tool generation access',
      'Principal-signed session documentation',
    ],
  },
  {
    id: 'resources',
    title: 'Fund Learning Resources',
    tagline: 'Curriculum & bilingual materials',
    description:
      'Underwrite printed bilingual AI prompt cards, student workbooks, and offline reference guides so learning continues long after the volunteers leave.',
    icon: BookOpen,
    outcomes: [
      'Bilingual prompt cheat-sheets (Telugu & English)',
      'Permanent student reference workbooks',
      'Reusable classroom practice supplies',
    ],
  },
  {
    id: 'volunteering',
    title: 'Employee Volunteering',
    tagline: 'Corporate tech mentorship',
    description:
      'Connect your engineering, product, or design teams with young learners as guest mentors, speakers, and project reviewers alongside our NIAT student chapters.',
    icon: Users2,
    outcomes: [
      'Structured corporate volunteering days',
      'Industry role-modelling for rural students',
      'Collaborative campus chapter co-delivery',
    ],
  },
]

export function PartnerCSR() {
  return (
    <section id="partner" className="tai-section relative overflow-hidden bg-card/30">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="tai-eyebrow text-brand">Institutional collaboration</p>
            <h2 className="tai-text-display mt-4 font-display text-foreground">
              Partner with Teach AI for India
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
              Turn your support into measurable AI education. Partner with the NIAT student community to bring hands-on AI literacy directly to government school classrooms.
            </p>
          </div>

          <Link
            href="/contact?intent=partner"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-7 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep shrink-0"
          >
            Partner With Us &rarr;
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PARTNER_CARDS.map((card, idx) => {
            const Icon = card.icon
            return (
              <Reveal key={card.id} delay={idx * 0.1}>
                <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-foreground/15 bg-background p-7 transition-all duration-300 hover:border-brand/40 hover:shadow-lg">
                  <div>
                    <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                        <Icon className="size-5" />
                      </div>
                      <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                        0{idx + 1}
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-xl font-bold text-foreground">
                      {card.title}
                    </h3>
                    <p className="font-mono text-xs font-semibold text-brand mt-1">
                      {card.tagline}
                    </p>

                    <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-foreground/10 pt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Key Deliverables:
                    </p>
                    <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-foreground/85">
                      {card.outcomes.map((item, oIdx) => (
                        <li key={oIdx} className="flex items-start gap-2">
                          <span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-brand" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        {/* Credibility & CSR Diligence Banner */}
        <div className="mt-12 rounded-2xl border border-foreground/15 bg-background p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-3 md:items-center">
            <div className="flex items-center gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Verified Field Evidence</h4>
                <p className="text-xs text-muted-foreground">Headmaster signatures, attendance tallies, timestamped photos</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <FileCheck className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Audited Utilization</h4>
                <p className="text-xs text-muted-foreground">Detailed expenditure logs mapped to student cohorts</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                <Award className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">CSR Compliance Ready</h4>
                <p className="text-xs text-muted-foreground">Custom impact reports structured for corporate CSR committees</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
