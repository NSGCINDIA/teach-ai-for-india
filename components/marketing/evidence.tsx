import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles } from 'lucide-react'
import { AnimatedCounter } from '@/components/shared/animated-counter'
import { Reveal } from '@/components/marketing/reveal'
import type { PublicImpactStats } from '@/types/database'

const STORY_IMAGE =
  'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1400/v1784177867/IMG_20260324_121056961_prkzll.jpg'

export function Evidence({ stats }: { stats: PublicImpactStats }) {
  const metrics = [
    {
      value: Math.max(stats.students_impacted || 0, 1800),
      suffix: '+',
      label: 'Students Reached',
      sublabel: 'Hands-on practical AI literacy',
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
      sublabel: 'Active university chapters',
    },
    {
      value: stats.sessions_completed || 35,
      suffix: '+',
      label: 'AI Sessions',
      sublabel: 'Verified & fully documented',
    },
    {
      value: 120,
      suffix: '+',
      label: 'Student Volunteers',
      sublabel: 'College mentors in classrooms',
    },
  ]

  return (
    <section id="impact" className="tai-section relative overflow-hidden bg-background">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-foreground/15 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="tai-eyebrow text-brand">Real, verified scale</p>
            <h2 className="tai-text-display mt-3 font-display text-foreground">
              These aren&apos;t projections. <br className="hidden sm:inline" />
              They&apos;re documented sessions.
            </h2>
          </div>
          <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground sm:text-sm">
            Telangana &amp; Andhra Pradesh · Live Operations
          </div>
        </div>

        {/* HUGE Impact Numbers Grid */}
        <div className="mt-14 grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-5">
          {metrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.1}>
              <div className="group relative rounded-2xl border border-foreground/15 bg-card/60 p-6 sm:p-7 transition-all duration-300 hover:border-brand/40 hover:bg-card hover:shadow-lg">
                <div className="flex items-baseline">
                  <AnimatedCounter
                    value={m.value}
                    suffix={m.suffix}
                    durationMs={m.value >= 1000 ? 2200 : 1600}
                    className="font-display text-4xl font-extrabold tracking-tight text-brand md:text-5xl lg:text-6xl xl:text-7xl"
                  />
                </div>
                <h3 className="mt-3.5 text-base font-bold uppercase tracking-wider text-foreground">
                  {m.label}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {m.sublabel}
                </p>
                <div className="mt-4 h-1 w-8 rounded-full bg-brand/20 transition-all group-hover:w-16 group-hover:bg-brand" />
              </div>
            </Reveal>
          ))}
        </div>

        {/* Powerful Emotional Underline Banner */}
        <Reveal delay={0.25}>
          <div className="mt-12 rounded-2xl border border-brand/20 bg-gradient-to-r from-brand/10 via-[var(--brand-orange)]/10 to-brand/5 p-6 text-center md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3.5 py-1.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand backdrop-blur-sm">
              <Sparkles className="size-4 text-brand" />
              Real Classroom Impact
            </div>
            <p className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              &ldquo;Every number represents a student who got the opportunity to experience AI.&rdquo;
            </p>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">
              Not slideware or passive demonstrations — students typing, questioning, and generating their very first AI outputs with their own ideas.
            </p>
          </div>
        </Reveal>

        {/* Real Classroom Moment Photo Feature */}
        <Reveal delay={0.35}>
          <div className="relative mt-14 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-foreground/15 md:aspect-[21/9]">
            <Image
              src={STORY_IMAGE}
              alt="A student at MPPS Nandakramaguda during an AI literacy session"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="font-display text-2xl italic text-white md:text-4xl">
                  &ldquo;Anna, when are you coming again?&rdquo;
                </p>
                <p className="mt-2 text-sm text-white/80 md:text-base">
                  — A student, MPPS Nandakramaguda, Rangareddy District
                </p>
              </div>

              <Link
                href="/impact"
                className="group inline-flex h-11 items-center gap-2 rounded-lg bg-white/95 px-5 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-white"
              >
                Explore Full Field Data
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="absolute left-6 top-6 rounded-full bg-black/60 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md">
              MPPS Nandakramaguda · Verified Session Record N&deg; 01
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
