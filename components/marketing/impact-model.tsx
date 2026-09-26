import { Users, Sparkles, MessageSquare, RefreshCw } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

const STAGES = [
  {
    step: '01',
    title: 'REACH',
    tagline: 'How many students and schools we engage.',
    description: 'Documenting verified classroom attendance, school locations, and NIAT campus chapter participation with transparent logs.',
    icon: Users,
  },
  {
    step: '02',
    title: 'EXPERIENCE',
    tagline: 'What students actually participate in during sessions.',
    description: 'Ensuring every student gets hands-on time with live tools, writing their own prompts rather than watching passive lectures.',
    icon: Sparkles,
  },
  {
    step: '03',
    title: 'FEEDBACK',
    tagline: 'What students and educators tell us.',
    description: 'Capturing what students spontaneously ask, what confused them, and what headmasters observe about pupil engagement.',
    icon: MessageSquare,
  },
  {
    step: '04',
    title: 'IMPROVEMENT',
    tagline: 'How feedback informs future sessions.',
    description: 'Using classroom learnings to iterate exercises, improve Telugu translations, and refine NIAT volunteer coaching.',
    icon: RefreshCw,
  },
]

export function ImpactModel() {
  return (
    <section className="tai-section bg-background py-16 md:py-24 border-b border-foreground/10">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="tai-eyebrow text-brand">Methodology</p>
          <h2 className="tai-text-display mt-3 font-display text-foreground">
            How we think about impact.
          </h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            Beyond counting headcount, we look at the depth of classroom participation and how each visit strengthens the next.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((s, idx) => {
            const Icon = s.icon
            return (
              <Reveal key={s.title} delay={idx * 0.08}>
                <div className="flex h-full flex-col justify-between rounded-2xl border border-foreground/15 bg-card/40 p-6 transition-all hover:border-brand/40 hover:bg-card hover:shadow-sm">
                  <div>
                    <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
                      <span className="font-mono text-xs font-bold text-brand">
                        Stage {s.step}
                      </span>
                      <div className="flex size-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <Icon className="size-4.5" />
                      </div>
                    </div>

                    <h3 className="mt-4 font-mono text-xs font-bold uppercase tracking-widest text-brand">
                      {s.title}
                    </h3>
                    <p className="mt-2 font-display text-lg font-bold leading-snug text-foreground">
                      {s.tagline}
                    </p>
                    <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                      {s.description}
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
