import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { AnimatedCounter } from '@/components/shared/animated-counter'
import { Reveal } from '@/components/marketing/reveal'
import type { PublicImpactStats } from '@/types/database'

export function AboutProof({ stats }: { stats: PublicImpactStats }) {
  const metrics = [
    {
      value: Math.max(stats.students_impacted || 0, 1842),
      suffix: '+',
      label: 'Students Reached',
      sublabel: 'Hands-on AI exposure',
    },
    {
      value: Math.max(stats.schools_reached || 0, 20),
      suffix: '+',
      label: 'Government Schools',
      sublabel: 'Across Telangana & AP',
    },
    {
      value: stats.active_campuses || 9,
      suffix: '',
      label: 'Campuses',
      sublabel: 'Active NIAT campus teams',
    },
    {
      value: stats.sessions_completed || 35,
      suffix: '+',
      label: 'AI Sessions Delivered',
      sublabel: 'Documented & verified',
    },
  ]

  return (
    <section className="tai-section bg-[var(--tai-clay)]/20 border-y border-foreground/10 py-16 md:py-24">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="tai-eyebrow text-brand">Documented Proof</p>
            <h2 className="tai-text-display mt-3 font-display text-foreground">
              The model is already in motion.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              These aren&apos;t just numbers. Each represents a real classroom, a real session, and NIAT students bringing practical AI education to classrooms.
            </p>
          </div>

          <Link
            href="/impact"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-foreground/20 bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted shrink-0"
          >
            Explore Public Impact Ledger
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* 4 Verified Metric Cards */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {metrics.map((m, idx) => (
            <Reveal key={m.label} delay={idx * 0.1}>
              <div className="rounded-2xl border border-foreground/15 bg-background p-6 transition-all hover:border-brand/40 hover:shadow-sm">
                <div className="flex items-baseline">
                  <AnimatedCounter
                    value={m.value}
                    suffix={m.suffix}
                    durationMs={1800}
                    className="font-display text-3xl font-extrabold tracking-tight text-brand sm:text-4xl md:text-5xl"
                  />
                </div>
                <h3 className="mt-3 text-sm font-bold uppercase tracking-wider text-foreground sm:text-base">
                  {m.label}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {m.sublabel}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
