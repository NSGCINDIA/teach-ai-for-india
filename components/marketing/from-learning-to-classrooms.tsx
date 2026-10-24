'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Layers,
  Sparkles,
  ShieldCheck,
  Cpu,
  Users2,
  MessageSquare,
} from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'
import { landingContent } from '@/app/(public)/content'

export function FromLearningToClassroomsSection() {
  const content = landingContent.fromLearningToClassrooms
  const [activeTab, setActiveTab] = useState<'journey' | 'loop'>('journey')

  return (
    <section id="from-learning-to-classrooms" className="tai-section relative overflow-hidden bg-card/25 border-t border-border/80 py-16 md:py-24">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="tai-eyebrow text-brand">{content.eyebrow}</span>
                <span className="rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-brand">
                  N&deg; 06
                </span>
              </div>

              <h2 className="tai-text-display mt-3 font-display text-foreground">
                {content.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                {content.subtitle}
              </p>
            </div>

            {/* Switch between Four-Session Curriculum and Volunteer Loop */}
            <div className="flex rounded-xl border border-border bg-background p-1 shadow-xs shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('journey')}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                  activeTab === 'journey'
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                The 4-Session School Journey
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('loop')}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                  activeTab === 'loop'
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                The Campus Operating Loop
              </button>
            </div>
          </div>
        </Reveal>

        {/* TAB 1: FOUR-SESSION SCHOOL JOURNEY */}
        {activeTab === 'journey' && (
          <div className="mt-12">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {content.fourSessionJourney.map((session, idx) => (
                <Reveal key={session.session} delay={idx * 0.08} className="h-full">
                  <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md">
                    <div>
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <span className="font-mono text-xs font-bold text-brand bg-brand/10 px-2 py-0.5 rounded">
                          {session.session}
                        </span>
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Stage 0{idx + 1}
                        </span>
                      </div>

                      <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                        {session.title}
                      </h3>

                      <p className="mt-1 text-xs font-semibold text-brand">
                        Focus: {session.focus}
                      </p>

                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                        {session.summary}
                      </p>
                    </div>

                    <div className="mt-5 rounded-xl border border-border/80 bg-muted/40 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                        Observable Outcome:
                      </p>
                      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                        {session.outcome}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: THE CAMPUS OPERATING LOOP */}
        {activeTab === 'loop' && (
          <div className="mt-12">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {content.operatingLoop.map((step, idx) => (
                <Reveal key={step.step} delay={idx * 0.08} className="h-full">
                  <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-brand bg-brand/10 px-2 py-0.5 rounded">
                          Phase {step.step}
                        </span>
                      </div>

                      <h3 className="mt-4 font-display text-base font-bold text-foreground">
                        {step.name}
                      </h3>

                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>

                    <div className="mt-5 border-t border-border/60 pt-3 text-[11px] font-mono text-muted-foreground">
                      {idx < content.operatingLoop.length - 1 ? (
                        <span>Next &rarr; Phase {content.operatingLoop[idx + 1].step}</span>
                      ) : (
                        <span className="font-bold text-brand">Loops Back to Schools</span>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
