import { Reveal } from '@/components/marketing/reveal'
import { Sparkles, Compass, Share2 } from 'lucide-react'

const BELIEFS = [
  {
    title: 'ACCESS',
    description: 'AI education should not depend on where a student studies.',
    icon: Compass,
  },
  {
    title: 'PRACTICE',
    description: 'Students learn more when they can experiment, create and ask questions.',
    icon: Sparkles,
  },
  {
    title: 'SHARING',
    description: 'What we learn becomes more valuable when we pass it on.',
    icon: Share2,
  },
]

export function WhatWeBelieve() {
  return (
    <section className="tai-section bg-[var(--tai-clay)]/20 border-y border-foreground/10 py-16 md:py-24">
      <div className="tai-container px-5 md:px-8">
        <div className="max-w-3xl">
          <p className="tai-eyebrow text-brand">Core Principles</p>
          <h2 className="tai-text-display mt-3 font-display text-foreground">
            What we believe
          </h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            Three simple convictions that guide every classroom session and campus chapter.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {BELIEFS.map((b, idx) => {
            const Icon = b.icon
            return (
              <Reveal key={b.title} delay={idx * 0.1}>
                <div className="flex h-full flex-col justify-between rounded-2xl border border-foreground/15 bg-background p-6 sm:p-8 transition-all hover:border-brand/40 hover:shadow-sm">
                  <div>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-5 font-mono text-xs font-bold uppercase tracking-widest text-brand">
                      {b.title}
                    </h3>
                    <p className="mt-3 font-display text-lg font-bold leading-snug text-foreground md:text-xl">
                      &ldquo;{b.description}&rdquo;
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
