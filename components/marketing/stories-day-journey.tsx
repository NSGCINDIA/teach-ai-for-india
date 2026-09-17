'use client'

import { Clock, CheckCircle2, ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface Stage {
  stageNumber: string
  label: string
  title: string
  description: string
  quote?: string
}

const STAGES: Stage[] = [
  {
    stageNumber: '01',
    label: 'PREPARE',
    title: 'Hardware & Syllabus Readiness',
    description:
      'The university campus team gathers early, loads tablets and spare peripherals into travel bags, and runs a final check on offline teaching kits.',
  },
  {
    stageNumber: '02',
    label: 'ARRIVE',
    title: 'School Welcome & Setup',
    description:
      'Volunteers arrive at the partner government school, greet the headmaster, and configure the computer lab or multipurpose classroom.',
  },
  {
    stageNumber: '03',
    label: 'TEACH',
    title: 'Interactive Foundational Concepts',
    description:
      'Using relatable analogies from daily life, facilitators explain how computers learn from examples rather than pure programmed rules.',
  },
  {
    stageNumber: '04',
    label: 'EXPERIMENT',
    title: 'Hands-on Student Prompting',
    description:
      'Students pair up to craft their own text prompts, generating original concepts in Telugu and English while exploring model boundaries.',
  },
  {
    stageNumber: '05',
    label: 'REFLECT',
    title: 'Classroom Showcase & Inquiries',
    description:
      'Children present their generated drawings to the class, ask how the technology works under the hood, and challenge each other’s ideas.',
  },
  {
    stageNumber: '06',
    label: 'RETURN',
    title: 'The Question That Stays With Us',
    description:
      'As tablets are packed away, a student invariably walks up to ask the question that keeps our movement running week after week.',
    quote: 'Anna, when are you coming again?',
  },
]

export function StoriesDayJourney() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-16 md:py-24">
      <div className="container-wide px-5 md:px-8 lg:px-16">
        <Reveal>
          <div className="max-w-3xl">
            <span className="section-label text-brand">Classroom Chronology</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl text-balance">
              A Day in a Teach AI Classroom
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
              What does a session actually look like from start to finish? Six key stages turn an
              unfamiliar computer lab into a place of joyful digital creation.
            </p>
          </div>
        </Reveal>

        {/* 6 Chronological Stages */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((s, idx) => (
            <Reveal key={s.label} delay={idx * 0.07} className="h-full">
              <div className="group flex h-full flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-soft-lg">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand bg-brand/10 px-2.5 py-1 rounded-md">
                      Stage {s.stageNumber}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-lg font-bold text-foreground group-hover:text-brand transition-colors">
                    {s.title}
                  </h3>

                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {s.description}
                  </p>

                  {s.quote && (
                    <div className="mt-4 rounded-xl border border-brand/20 bg-brand/5 p-3">
                      <p className="text-xs font-bold italic text-foreground text-center">
                        &quot;{s.quote}&quot;
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-border/50 pt-3 text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Sequence {idx + 1} of 6</span>
                  {idx < STAGES.length - 1 && (
                    <span className="text-brand flex items-center gap-1 font-bold">
                      {STAGES[idx + 1].label} <ArrowRight className="size-3" />
                    </span>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
