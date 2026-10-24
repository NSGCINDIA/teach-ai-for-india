'use client'

import { Compass, RefreshCw, ShieldCheck } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

const PRINCIPLES = [
  {
    pillar: 'LOCAL',
    title: 'Deep Community Roots',
    description:
      'Students understand their communities and can build relationships close to home.',
    detail:
      'Rather than sending external teams into unfamiliar areas, university students visit schools within their own districts, speaking the local language and relating directly to the kids.',
    icon: Compass,
    accent: 'text-brand bg-brand/10 border-brand/20',
  },
  {
    pillar: 'OWNERSHIP',
    title: 'Genuine Responsibility',
    description:
      "Campus teams don't just volunteer. They help organize, deliver and improve the work.",
    detail:
      'From securing school permissions to transporting monitors and managing classroom energy, student leaders take full end-to-end accountability for their session outcomes.',
    icon: ShieldCheck,
    accent: 'text-brand-orange bg-brand-orange/10 border-brand-orange/20',
  },
  {
    pillar: 'REPEATABILITY',
    title: 'Shared Knowledge Loop',
    description:
      'A shared approach allows each campus to learn from the experiences of others.',
    detail:
      'When one campus develops a successful Telugu prompt exercise or solves an offline lab constraint, the curriculum and tactics are immediately shared across the other chapters.',
    icon: RefreshCw,
    accent: 'text-brand-teal bg-brand-teal/10 border-brand-teal/20',
  },
]

export function CampusWhySection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-card/25 py-16 md:py-24">
      <div className="container-wide px-5 md:px-8 lg:px-16">
        <Reveal>
          <div className="max-w-3xl">
            <span className="section-label text-brand">The Philosophy</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl text-balance">
              Why campuses matter.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
              We didn&apos;t choose a top-down NGO structure. We organized around the NIAT community and NIAT Campus Teams
              because local trust, personal ownership, and peer connection are what actually make
              classrooms light up.
            </p>
          </div>
        </Reveal>

        {/* 3 Principles Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PRINCIPLES.map((item, idx) => {
            const Icon = item.icon
            return (
              <Reveal key={item.pillar} delay={idx * 0.08} className="h-full">
                <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-soft-lg">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground">
                        0{idx + 1}
                      </span>
                      <span className="rounded-md bg-muted px-2.5 py-1 text-[11px] font-extrabold tracking-wider uppercase text-foreground">
                        {item.pillar}
                      </span>
                    </div>

                    <div className={`mt-6 grid size-12 place-items-center rounded-xl border ${item.accent}`}>
                      <Icon className="size-6" />
                    </div>

                    <h3 className="mt-5 font-display text-xl font-bold text-foreground">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm font-semibold text-foreground/90 leading-snug">
                      &quot;{item.description}&quot;
                    </p>

                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                      {item.detail}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-border/50 pt-3 text-[11px] font-semibold text-brand">
                    Campus-Led Principle
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
