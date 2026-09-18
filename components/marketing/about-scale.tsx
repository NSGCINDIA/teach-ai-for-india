import { Users, BookOpen, Building, RefreshCw } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

const SCALE_PILLARS = [
  {
    title: 'CAMPUS TEAMS',
    tagline: 'NIAT student teams organize and deliver locally.',
    description: 'Teams of NIAT students live close to schools, communicate in regional languages, and build genuine rapport with students.',
    icon: Users,
  },
  {
    title: 'SHARED CURRICULUM',
    tagline: 'Learning resources and session structures can be reused and adapted.',
    description: 'Field-tested prompt engineering exercises, bilingual workbooks, and slide kits enable chapters to deliver consistent quality.',
    icon: BookOpen,
  },
  {
    title: 'SCHOOL PARTNERSHIPS',
    tagline: 'Local teams build relationships with nearby schools.',
    description: 'Direct collaboration with headmasters, teachers, and school administrators establishes long-term institutional trust.',
    icon: Building,
  },
  {
    title: 'LEARN → IMPROVE → REPEAT',
    tagline: 'Feedback from every classroom helps strengthen future sessions.',
    description: 'Every session ends with student questions and volunteer debriefs, feeding improvements directly into the next cohort plan.',
    icon: RefreshCw,
  },
]

export function AboutScale() {
  return (
    <section className="tai-section bg-background py-16 md:py-24">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="tai-eyebrow text-brand">Operating Model</p>
          <h2 className="tai-text-display mt-3 font-display text-foreground">
            Built to grow from one campus to many.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            How a decentralized, student-led movement powered by NIAT students organizes for consistent, localized classroom delivery.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SCALE_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon
            return (
              <Reveal key={pillar.title} delay={idx * 0.1}>
                <div className="flex h-full flex-col justify-between rounded-2xl border border-foreground/15 bg-card/40 p-6 transition-all hover:border-brand/40 hover:bg-card hover:shadow-sm">
                  <div>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <Icon className="size-5" />
                    </div>

                    <h3 className="mt-5 font-mono text-xs font-bold uppercase tracking-widest text-brand">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 font-display text-lg font-bold leading-snug text-foreground">
                      {pillar.tagline}
                    </p>

                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {pillar.description}
                    </p>
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
