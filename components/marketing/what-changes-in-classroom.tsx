import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'
import { landingContent } from '@/app/(public)/content'

export function WhatChangesInClassroomSection() {
  const content = landingContent.whatChangesInAClassroom

  return (
    <section id="what-changes" className="tai-section relative overflow-hidden bg-background py-16 md:py-24">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <Reveal>
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.2em] text-brand">
              <span>{content.eyebrow}</span>
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
                N&deg; 09
              </span>
            </div>

            <h2 className="tai-text-display mt-3 font-display text-foreground">
              {content.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {content.subtitle}
            </p>
          </div>
        </Reveal>

        {/* 6 Outcome Cards with "so students can..." statements */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.outcomes.map((item, idx) => (
            <Reveal key={item.id} delay={idx * 0.08} className="h-full">
              <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <span className="font-mono text-xs font-bold text-brand bg-brand/10 px-2 py-0.5 rounded">
                      Outcome 0{idx + 1}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Observable Shift
                    </span>
                  </div>

                  {/* Feature in classroom */}
                  <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    In the Classroom:
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {item.feature}
                  </p>

                  {/* The Benefit Statement ("so students can...") */}
                  <div className="mt-4 rounded-xl border border-brand/20 bg-brand/5 p-4">
                    <p className="font-serif text-sm font-bold italic leading-relaxed text-brand sm:text-base">
                      &ldquo;…{item.benefit}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Observable Evidence */}
                <div className="mt-5 border-t border-border/60 pt-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-snug">
                      <strong className="text-foreground/90">Observed: </strong>
                      {item.observable}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
