import { Reveal } from '@/components/marketing/reveal'
import { Sparkles } from 'lucide-react'

export function AboutGap() {
  return (
    <section className="tai-section bg-[var(--tai-clay)]/25 border-y border-foreground/10">
      <div className="tai-container px-5 md:px-8">
        <div className="max-w-3xl">
          <p className="tai-eyebrow text-brand">The Gap</p>
          <h2 className="tai-text-display mt-3 font-display text-foreground">
            The AI opportunity isn&apos;t reaching every classroom.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground md:text-xl">
            AI is rapidly changing how we learn, work and create. But access to practical, hands-on AI learning is not equal.
          </p>

          <Reveal delay={0.15}>
            <div className="mt-8 rounded-2xl border border-brand/20 bg-card p-6 sm:p-8 shadow-sm">
              <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-brand">
                <Sparkles className="size-3.5" />
                Our response
              </div>
              <p className="mt-3 text-base leading-relaxed text-foreground md:text-lg font-medium">
                Teach AI for India brings practical AI learning into government-school classrooms through trained student volunteers and campus-led teams.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
