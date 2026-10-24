import { X, Check } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

const BEFORE_ITEMS = [
  'Limited exposure to practical AI tools',
  'AI can feel distant or complicated',
  'Few opportunities to experiment hands-on',
]

const AFTER_ITEMS = [
  'Students interact with real AI tools',
  'Students experiment with prompts and ideas',
  'Students create something themselves',
  'Students ask new questions with confidence',
]

export function ImpactBeforeAfter() {
  return (
    <section className="tai-section bg-background py-16 md:py-24 border-b border-foreground/10">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="tai-eyebrow text-brand">Observable Shift</p>
          <h2 className="tai-text-display mt-3 font-display text-foreground">
            What changes when students get to experience AI?
          </h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            Framed as an immediate, observable learning experience inside the classroom.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {/* BEFORE CARD */}
          <Reveal delay={0.1}>
            <div className="flex h-full flex-col justify-between rounded-2xl border border-red-500/25 bg-red-950/5 p-7 sm:p-9">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-red-600 dark:text-red-400">
                  <X className="size-3.5" /> Before
                </span>

                <ul className="mt-6 space-y-4">
                  {BEFORE_ITEMS.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-600">
                        <X className="size-3.5 stroke-[3]" />
                      </div>
                      <span className="text-base text-foreground font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-8 text-xs font-mono text-muted-foreground pt-4 border-t border-red-500/15">
                The Status Quo: passive consumers with little to no creative agency over digital tools.
              </p>
            </div>
          </Reveal>

          {/* AFTER CARD */}
          <Reveal delay={0.2}>
            <div className="flex h-full flex-col justify-between rounded-2xl border border-emerald-500/30 bg-emerald-950/5 p-7 sm:p-9">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">
                  <Check className="size-3.5" /> After
                </span>

                <ul className="mt-6 space-y-4">
                  {AFTER_ITEMS.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                        <Check className="size-3.5 stroke-[3]" />
                      </div>
                      <span className="text-base text-foreground font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-8 text-xs font-mono text-muted-foreground pt-4 border-t border-emerald-500/15">
                The 90-Minute Shift: active creators who realize technology can build their own ideas.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
