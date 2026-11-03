import { AnimatedCounter } from '@/components/shared/animated-counter'
import { Reveal } from '@/components/marketing/reveal'
import { landingContent } from '@/app/(public)/content'

export function NumbersStripSection() {
  const content = landingContent.numbers

  return (
    <section id="numbers" className="tai-section relative overflow-hidden bg-card/25 border-t border-b border-border/80 py-16 md:py-24">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 border-b border-foreground/15 pb-6 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.2em] text-brand">
                <span>{content.eyebrow}</span>
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
                  N&deg; 08
                </span>
              </div>

              <h2 className="tai-text-display mt-3 font-display text-foreground">
                {content.title}
              </h2>
            </div>
            <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground sm:text-sm">
              Telangana &amp; Andhra Pradesh · Live Operations
            </div>
          </div>
        </Reveal>

        {/* Numbers Grid */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {content.stats.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.07}>
              <div className="group relative rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-brand/40 hover:shadow-md">
                <div className="flex items-baseline">
                  <AnimatedCounter
                    value={m.value}
                    suffix={m.suffix}
                    durationMs={1600}
                    className="font-display text-3xl font-extrabold tracking-tight text-brand sm:text-4xl lg:text-5xl"
                  />
                </div>
                <h3 className="mt-2 text-xs font-bold uppercase tracking-wider text-foreground">
                  {m.label}
                </h3>
                <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                  {m.sublabel}
                </p>

                {/* Clearly marked placeholder tag */}
                <div className="mt-3 border-t border-border/50 pt-2 font-mono text-[10px] text-brand font-semibold">
                  {m.verifyTag}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Disclaimer Note */}
        <Reveal delay={0.3}>
          <div className="mt-8 text-center">
            <p className="font-mono text-xs text-muted-foreground">
              {content.subtitle} · Figures updated per semester cohort.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
