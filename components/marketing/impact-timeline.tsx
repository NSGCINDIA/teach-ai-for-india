import { Reveal } from '@/components/marketing/reveal'
import { Calendar, Compass, GraduationCap, Sparkles } from 'lucide-react'

interface Milestone {
  dateOrTag: string
  title: string
  detail: string
  icon: typeof Calendar
}

const MILESTONES: Milestone[] = [
  {
    dateOrTag: 'MARCH 2026',
    title: 'Movement Begins',
    detail: 'Inside NIAT, students asked what they could uniquely give back. Rather than tutoring textbook theory, we decided to teach applied AI.',
    icon: Compass,
  },
  {
    dateOrTag: 'FIRST CLASSROOM',
    title: 'MPPS Nandakramaguda',
    detail: '~150 students gathered for a 1-hour-15-minute hands-on pilot. The first prompt sparked spontaneous laughter, curiosity, and endless questions.',
    icon: GraduationCap,
  },
  {
    dateOrTag: 'CHAPTER EXPANSION',
    title: '9 Collegiate Chapters',
    detail: 'Students across Telangana and Andhra Pradesh formed local chapters to coordinate directly with nearby government high schools.',
    icon: Calendar,
  },
  {
    dateOrTag: 'TODAY',
    title: '1,842+ Students Reached',
    detail: 'Documented sessions across 20+ partner government schools, powered by college volunteers and verified open logs.',
    icon: Sparkles,
  },
]

export function ImpactTimeline() {
  return (
    <section className="tai-section bg-[var(--tai-clay)]/25 border-b border-foreground/10 py-16 md:py-24">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="tai-eyebrow text-brand">Milestones over time</p>
          <h2 className="tai-text-display mt-3 font-display text-foreground">
            From one classroom to a growing movement.
          </h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            A visual record of verified steps taken by our student-led teams.
          </p>
        </div>

        {/* Horizontal Milestone Progression */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MILESTONES.map((m, idx) => {
            const Icon = m.icon
            return (
              <Reveal key={m.title} delay={idx * 0.1}>
                <div className="relative flex h-full flex-col justify-between rounded-2xl border border-foreground/15 bg-background p-6 transition-all hover:border-brand/40 hover:shadow-sm">
                  <div>
                    <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand">
                        {m.dateOrTag}
                      </span>
                      <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                        <Icon className="size-4" />
                      </div>
                    </div>

                    <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                      {m.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {m.detail}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-2 pt-4 border-t border-foreground/10 font-mono text-[11px] text-muted-foreground">
                    <span className="size-2 rounded-full bg-brand" />
                    <span>Verified Milestone 0{idx + 1}</span>
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
