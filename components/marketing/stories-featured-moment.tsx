'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Sparkles, Quote, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface Stage {
  id: number
  key: string
  title: string
  subtitle: string
  leadQuote?: string
  description: string
  takeaway: string
}

const STAGES: Stage[] = [
  {
    id: 1,
    key: 'THE QUESTION',
    title: 'A Student Asks a Simple Question',
    subtitle: 'ZPHS Bachupally • Class 8 • Morning Session',
    leadQuote: 'Anna, can it make a picture of Allu Arjun?',
    description:
      'The classroom was quiet during the introductory slides until one eighth-grader raised his hand with an authentic, unscripted question from his own world. He did not ask about algorithms or neural layers. He wanted to know if this tool understood who he cared about.',
    takeaway: 'Curiosity begins when technology connects to culture.',
  },
  {
    id: 2,
    key: 'THE EXPERIMENT',
    title: 'The Student Sees AI Respond',
    subtitle: 'Live Classroom Demonstration',
    description:
      'The volunteer did not just answer "yes." Instead, they invited the student to step up to the laptop and formulate the prompt. Together, they typed the actor’s name, added details in Telugu and English, and hit generate. For three seconds, sixty students held their breath.',
    takeaway: 'Seeing is the first step toward believing you can do it too.',
  },
  {
    id: 3,
    key: 'THE DISCOVERY',
    title: 'Understanding What AI Actually Does',
    subtitle: 'The Shift from Magic to Tool',
    description:
      'When the stylized portrait appeared on screen, the room broke into spontaneous applause. But the volunteer immediately paused: "Look closely. Did the computer copy this from Google? No. It synthesized pixels based on your words." That was the turning point.',
    takeaway: 'Demystifying AI moves children from passive awe to active understanding.',
  },
  {
    id: 4,
    key: 'THE CREATION',
    title: 'The Student Creates Something Themselves',
    subtitle: 'Hands-on Student Prompting',
    description:
      'With the barrier broken, every child in the room wanted to build. Students paired up on tablets, translating ideas into Telugu prompts — from flying school buses to peacocks teaching monkeys. They were no longer spectators. They were creators.',
    takeaway: 'Creation replaces intimidation with confidence.',
  },
  {
    id: 5,
    key: 'THE POSSIBILITY',
    title: 'A Simple Interaction Opens New Horizons',
    subtitle: 'Beyond the First Workshop',
    description:
      'The session concluded, but the questions did not. Students crowded the volunteers asking about computer science, robotics, and coding. One question about a cinema icon had cracked open a door to what technology could mean for their futures.',
    takeaway: 'One moment can permanently shift how a child sees their own potential.',
  },
]

export function StoriesFeaturedMoment() {
  const [activeStageId, setActiveStageId] = useState(1)
  const activeStage = STAGES.find((s) => s.id === activeStageId) ?? STAGES[0]

  return (
    <section id="featured-moment" className="relative overflow-hidden border-b border-border bg-card/25 py-16 md:py-24">
      <div className="container-wide px-5 md:px-8 lg:px-16">
        <Reveal>
          <div className="max-w-3xl">
            <span className="section-label text-brand">Featured Classroom Story</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl text-balance">
              The Allu Arjun Moment
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
              How one child&apos;s cultural reference turned an abstract technology into a classroom
              breakthrough.
            </p>
          </div>
        </Reveal>

        {/* 5-Stage Stepper Navigation */}
        <div className="mt-10 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {STAGES.map((st) => (
            <button
              key={st.id}
              onClick={() => setActiveStageId(st.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-left transition-all shrink-0 ${
                activeStageId === st.id
                  ? 'bg-brand text-white shadow-soft ring-2 ring-brand/20'
                  : 'border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <span
                className={`flex size-6 items-center justify-center rounded-full text-xs font-mono font-bold ${
                  activeStageId === st.id ? 'bg-white/20 text-white' : 'bg-muted text-foreground'
                }`}
              >
                0{st.id}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">{st.key}</span>
            </button>
          ))}
        </div>

        {/* Active Stage Card */}
        <div className="mt-8">
          <Reveal key={activeStage.id}>
            <div className="grid gap-8 lg:grid-cols-12 rounded-3xl border border-border/80 bg-card p-6 shadow-soft-lg md:p-10 lg:items-center">
              {/* Image side */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted lg:col-span-5 shadow-sm">
                <Image
                  src="https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177864/IMG-20260406-WA0007_3_hboy0k.jpg"
                  alt="Student prompt engineering during Teach AI classroom session"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover transition-transform duration-500 hover:scale-103"
                  priority
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                    <Sparkles className="size-3 text-brand-orange" /> Stage 0{activeStage.id} of 05
                  </span>
                </div>
              </div>

              {/* Content side */}
              <div className="space-y-6 lg:col-span-7">
                <div>
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-brand">
                    {activeStage.key}
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-extrabold text-foreground sm:text-3xl">
                    {activeStage.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {activeStage.subtitle}
                  </p>
                </div>

                {/* Quote if Stage 1 */}
                {activeStage.leadQuote && (
                  <div className="relative border-l-4 border-brand bg-brand/5 p-4 rounded-r-xl">
                    <Quote className="absolute top-2 right-3 size-6 text-brand/15" />
                    <p className="text-base font-bold italic text-foreground leading-relaxed pr-6 md:text-lg">
                      &quot;{activeStage.leadQuote}&quot;
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground font-medium">
                      — Class 8 Student, ZPHS Bachupally
                    </p>
                  </div>
                )}

                <p className="text-sm text-foreground/90 leading-relaxed md:text-base">
                  {activeStage.description}
                </p>

                <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-3.5 text-xs font-semibold text-brand">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>Takeaway: {activeStage.takeaway}</span>
                </div>

                {/* Stepper next button */}
                <div className="flex items-center justify-between border-t border-border/60 pt-4">
                  <span className="text-xs text-muted-foreground font-medium">
                    Stage {activeStage.id} of 5
                  </span>
                  {activeStage.id < 5 ? (
                    <button
                      onClick={() => setActiveStageId(activeStage.id + 1)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand-orange transition-colors"
                    >
                      Next: {STAGES[activeStage.id].key} <ArrowRight className="size-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Story Complete
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* The Golden Reflection Line */}
        <Reveal delay={0.15} className="mt-10">
          <div className="rounded-2xl border border-brand/20 bg-gradient-to-r from-brand/5 via-brand-orange/5 to-brand-teal/5 p-6 text-center">
            <p className="font-display text-lg font-bold text-foreground sm:text-xl md:text-2xl italic">
              &quot;One question became curiosity. Curiosity became learning. Learning became possibility.&quot;
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
