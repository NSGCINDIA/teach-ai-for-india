'use client'

import Link from 'next/link'
import {
  Users,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Compass,
  ArrowRight,
  CheckCircle2,
  FileText,
} from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface Pillar {
  number: string
  title: string
  headline: string
  description: string
  icon: typeof Users
  badge: string
}

const PILLARS: Pillar[] = [
  {
    number: '01',
    title: 'Student-led',
    badge: 'Peer-to-Peer Energy',
    headline: "Young people aren't just talking about change. They're delivering it.",
    description:
      'Our NIAT student volunteers relate naturally to schoolchildren. There is zero intimidation — only curiosity, shared excitement, and collegiate role models showing what is possible.',
    icon: Users,
  },
  {
    number: '02',
    title: 'Hands-on',
    badge: 'Active Creation',
    headline: "Students don't just learn what AI is. They actually use it.",
    description:
      'We never deliver passive slideware or theoretical monologues. Every student holds a tablet, writes prompts, analyzes AI outputs, and creates something original in their first hour.',
    icon: Sparkles,
  },
  {
    number: '03',
    title: 'Scalable',
    badge: 'Decentralized Growth',
    headline: 'Our campus model expands without building a heavy bureaucracy.',
    description:
      'Each NIAT campus chapter functions as an autonomous outreach hub. This allows us to reach schools in tier-2 and tier-3 towns without bloating administrative costs or management layers.',
    icon: TrendingUp,
  },
  {
    number: '04',
    title: 'Documented',
    badge: 'Radical Transparency',
    headline: 'Every session is verified and documented.',
    description:
      'Every single visit is recorded with timestamped photographs, headmaster endorsements, attendance tallies, and volunteer logs openly viewable on our digital operating system.',
    icon: ShieldCheck,
  },
  {
    number: '05',
    title: 'Future-focused',
    badge: 'Generational Equity',
    headline: 'Preparing students for a world where AI will be part of every career.',
    description:
      'Access to AI is the defining opportunity gap of this decade. We ensure students in government classrooms enter the modern economy as confident digital creators, not spectators.',
    icon: Compass,
  },
]

export function WhyFundUs() {
  return (
    <section id="why-fund-us" className="tai-section relative overflow-hidden bg-card/30">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-4xl">
            <p className="tai-eyebrow text-brand">Institutional conviction</p>
            <h2 className="tai-text-display mt-4 font-display text-foreground">
              Why Teach AI for India?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
              Five clear reasons why philanthropists, CSR partners, and individuals choose to back this movement.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="#fund"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep"
            >
              See Funding Tiers
              <ArrowRight className="size-4.5" />
            </Link>
          </div>
        </div>

        {/* 5 Pillars Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p, idx) => {
            const Icon = p.icon
            return (
              <Reveal key={p.number} delay={idx * 0.1}>
                <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-foreground/15 bg-background p-8 sm:p-9 transition-all duration-300 hover:border-brand/40 hover:shadow-lg">
                  <div>
                    <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
                      <span className="font-mono text-sm font-bold uppercase tracking-widest text-brand">
                        {p.number} · {p.title}
                      </span>
                      <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <Icon className="size-5" />
                      </div>
                    </div>

                    <h3 className="mt-5 font-display text-2xl font-bold leading-snug text-foreground">
                      {p.headline}
                    </h3>

                    <p className="mt-3.5 text-base leading-relaxed text-muted-foreground">
                      {p.description}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-foreground/10 pt-4">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/80">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      {p.badge}
                    </span>
                  </div>
                </div>
              </Reveal>
            )
          })}

          {/* Institutional / CSR Partnership Card */}
          <Reveal delay={0.5}>
            <div className="relative flex h-full flex-col justify-between rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 via-transparent to-[var(--brand-orange)]/10 p-8 sm:p-9">
              <div>
                <span className="font-mono text-sm font-bold uppercase tracking-widest text-brand">
                  Partner with Us
                </span>
                <h3 className="mt-5 font-display text-2xl font-bold leading-snug text-foreground">
                  Corporate CSR &amp; Philanthropic Foundations
                </h3>
                <p className="mt-3.5 text-base leading-relaxed text-muted-foreground">
                  Sponsor entire districts, establish campus chapters in your community, and receive verified auditable impact reports with student testimonials.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <Link
                  href="/join?intent=partner"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-brand-deep shadow-sm"
                >
                  Start CSR Conversation
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/impact"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-foreground/20 bg-background/80 px-4 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  <FileText className="size-4" />
                  View Impact Ledger
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
