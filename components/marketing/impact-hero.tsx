import { AnimatedCounter } from '@/components/shared/animated-counter'
import { Reveal } from '@/components/marketing/reveal'
import { MaskHeading } from '@/components/marketing/mask-heading'
import type { PublicImpactStats } from '@/types/database'

export function ImpactHero({ stats }: { stats: PublicImpactStats }) {
  const metrics = [
    {
      value: Math.max(stats.students_impacted || 0, 1842),
      suffix: '+',
      label: 'Students Reached',
      sublabel: 'Hands-on practical AI literacy',
    },
    {
      value: Math.max(stats.schools_reached || 0, 20),
      suffix: '+',
      label: 'Government Schools',
      sublabel: 'Across Telangana & Andhra Pradesh',
    },
    {
      value: stats.active_campuses || 9,
      suffix: '',
      label: 'Campuses',
      sublabel: 'Active NIAT campus chapters',
    },
    {
      value: stats.sessions_completed || 35,
      suffix: '+',
      label: 'AI Sessions Delivered',
      sublabel: 'Verified & fully documented',
    },
  ]

  return (
    <section className="relative overflow-hidden bg-background pt-20 pb-12 md:pt-28 md:pb-16 border-b border-foreground/10">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-brand font-semibold sm:text-sm">
            Verified impact &bull; Powered by NIAT students &bull; Classroom-led
          </div>

          <MaskHeading
            as="h1"
            immediate
            delay={0.1}
            className="tai-text-display-xl mt-5 font-display text-foreground"
            lines={['1,842+ students.', 'Real classrooms.', 'One growing movement.']}
          />

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Powered by a growing community of NIAT student volunteers and campus teams. Every number represents a student who got the opportunity to explore AI, ask questions, experiment, and create.
          </p>
        </div>

        {/* Impact Numbers Grid */}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {metrics.map((m, idx) => (
            <Reveal key={m.label} delay={idx * 0.08}>
              <div className="rounded-2xl border border-foreground/15 bg-card/60 p-6 sm:p-7 transition-all hover:border-brand/40 hover:bg-card hover:shadow-sm">
                <div className="flex items-baseline">
                  <AnimatedCounter
                    value={m.value}
                    suffix={m.suffix}
                    durationMs={1800}
                    className="font-display text-4xl font-extrabold tracking-tight text-brand md:text-5xl"
                  />
                </div>
                <h3 className="mt-3 text-sm font-bold uppercase tracking-wider text-foreground sm:text-base">
                  {m.label}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  {m.sublabel}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-4 font-mono text-xs text-muted-foreground text-center sm:text-left">
          * Impact figures are based on documented Teach AI for India program activity.
        </p>
      </div>
    </section>
  )
}
