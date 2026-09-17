'use client'

import { useState } from 'react'
import { X, Check, ArrowRight, Sparkles, ArrowDown } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface ComparisonPoint {
  title: string
  detail: string
}

const BEFORE_POINTS: ComparisonPoint[] = [
  {
    title: 'Limited exposure to AI',
    detail: 'Little to no prior interaction with artificial intelligence tools or modern digital creation platforms.',
  },
  {
    title: 'AI feels distant or complicated',
    detail: 'Assumed AI belonged only to software engineers and tech giants in faraway cities — completely out of reach.',
  },
  {
    title: 'Few opportunities for hands-on experimentation',
    detail: 'School computer rooms are often locked or unequipped. Practical digital experimentation was practically zero.',
  },
]

const AFTER_POINTS: ComparisonPoint[] = [
  {
    title: 'Students interact with real AI tools',
    detail: 'Hands-on access to live generative tools during interactive workshops on shared tablets.',
  },
  {
    title: 'Students understand practical AI concepts',
    detail: 'Grasping how prompts work, how models process instructions, and how clear thinking produces better output.',
  },
  {
    title: 'Students create and experiment themselves',
    detail: 'Designing artwork, exploring bilingual concepts in Telugu and English, and generating original ideas with confidence.',
  },
  {
    title: 'Students begin imagining AI-related possibilities',
    detail: 'Fear turns into ambition: asking volunteers about coding, science, problem-solving, and future technology pathways.',
  },
]

export function BeforeAfter() {
  const [activeTab, setActiveTab] = useState<'both' | 'before' | 'after'>('both')

  return (
    <section id="before-after" className="tai-section relative overflow-hidden bg-card/40">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="max-w-4xl">
          <p className="tai-eyebrow text-brand">Visible transformation</p>
          <h2 className="tai-text-display mt-4 font-display text-foreground">
            What actually changes in a classroom?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
            This isn&apos;t just about claiming impact. It&apos;s about the observable shift that happens when a child goes from being a passive consumer of tech to an active builder.
          </p>
        </div>

        {/* Desktop & Tablet Side-by-Side Comparison */}
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {/* BEFORE CARD */}
          <Reveal delay={0.1}>
            <div className="relative flex h-full flex-col justify-between rounded-2xl border border-red-500/20 bg-red-950/5 p-8 sm:p-10 transition-all hover:border-red-500/30">
              <div>
                <div className="flex items-center justify-between border-b border-red-500/15 pb-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3.5 py-1.5 font-mono text-sm font-semibold text-red-600 dark:text-red-400">
                    <X className="size-4" />
                    Before Teach AI
                  </span>
                  <span className="font-mono text-sm text-muted-foreground">The Status Quo</span>
                </div>

                <div className="mt-8 space-y-6">
                  {BEFORE_POINTS.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-600 dark:text-red-400">
                        <X className="size-4.5 stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="font-display text-lg font-bold sm:text-xl text-foreground">
                          {item.title}
                        </h4>
                        <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 rounded-xl border border-red-500/10 bg-background/60 p-5 text-sm md:text-base italic text-muted-foreground">
                &ldquo;We thought computers were only for typing exams or playing games someone else created.&rdquo;
              </div>
            </div>
          </Reveal>

          {/* AFTER CARD */}
          <Reveal delay={0.2}>
            <div className="relative flex h-full flex-col justify-between rounded-2xl border border-emerald-500/30 bg-emerald-950/5 p-8 sm:p-10 shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-md">
              <div>
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3.5 py-1.5 font-mono text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    <Check className="size-4" />
                    After Teach AI
                  </span>
                  <span className="font-mono text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    The 90-Minute Shift
                  </span>
                </div>

                <div className="mt-8 space-y-6">
                  {AFTER_POINTS.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        <Check className="size-4.5 stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="font-display text-lg font-bold sm:text-xl text-foreground">
                          {item.title}
                        </h4>
                        <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 rounded-xl border border-emerald-500/20 bg-background/70 p-5 text-sm md:text-base font-medium text-emerald-800 dark:text-emerald-200">
                <div className="flex items-center gap-2 text-brand">
                  <Sparkles className="size-4.5" />
                  <span className="font-bold uppercase tracking-wider text-xs sm:text-sm">Outcome:</span>
                </div>
                <p className="mt-1.5 italic text-sm md:text-base">
                  &ldquo;Anna, can it make a picture of Allu Arjun? What if we ask it in Telugu? What if we build a website tomorrow?&rdquo;
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Bottom Context Banner */}
        <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-foreground/15 bg-background p-5 text-base text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
              ✓
            </span>
            <span className="font-medium text-foreground">
              This makes the impact visible, rather than just claiming it.
            </span>
          </div>
          <a
            href="#session"
            className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline"
          >
            See a session walkthrough
            <ArrowRight className="size-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
