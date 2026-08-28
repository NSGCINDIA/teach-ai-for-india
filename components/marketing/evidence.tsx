import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { AnimatedCounter } from '@/components/shared/animated-counter'
import { Reveal } from '@/components/marketing/reveal'
import type { PublicImpactStats } from '@/types/database'

const METRICS = (stats: PublicImpactStats) => [
  { value: stats.students_impacted, label: 'students addressed', context: `across ${stats.schools_reached} government schools` },
  { value: stats.active_campuses, label: 'campus teams', context: 'across Telangana and Andhra Pradesh' },
  { value: stats.schools_reached, label: 'schools reached', context: 'each session verified and documented' },
]

const STORY_IMAGE =
  'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1400/v1784177867/IMG_20260324_121056961_prkzll.jpg'

/** "The Evidence" — verified impact numbers, immediately grounded by one real quote and photo rather than left as an abstract dashboard. */
export function Evidence({ stats }: { stats: PublicImpactStats }) {
  const metrics = METRICS(stats)

  return (
    <section className="tai-section bg-background">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <p className="tai-eyebrow text-brand">Verified impact</p>
        <h2 className="tai-text-display mt-4 max-w-2xl font-display text-foreground">
          These aren&apos;t projections. They&apos;re documented sessions.
        </h2>

        <div className="mt-16 grid gap-10 sm:grid-cols-3">
          {metrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.15}>
              <div className="text-center sm:text-left">
                <AnimatedCounter
                  value={m.value}
                  durationMs={m.value >= 1000 ? 2400 : m.value >= 100 ? 1800 : 1200}
                  className="tai-text-metric font-display font-bold text-[var(--tai-saffron)]"
                />
                <p className="mt-2 text-sm font-medium uppercase tracking-wide text-foreground">{m.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{m.context}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="relative mt-20 aspect-video w-full overflow-hidden rounded-xl">
            <Image
              src={STORY_IMAGE}
              alt="A student at MPPS Nandakramaguda during an AI literacy session"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10">
              <p className="font-display text-2xl italic text-white md:text-3xl">
                &ldquo;Anna, when are you coming again?&rdquo;
              </p>
              <p className="mt-2 text-sm text-white/70">— A student, MPPS Nandakramaguda</p>
            </div>
            <div className="absolute right-6 top-6 rounded-full bg-black/50 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              Rangareddy · Class 7 · First session
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.3}>
          <Link
            href="/impact"
            className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand"
          >
            See the full impact
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
