import Link from 'next/link'
import {
  School,
  BookOpen,
  Tablet,
  Sparkles,
  GraduationCap,
  Users,
  Truck,
  Handshake,
  HeartHandshake,
  ArrowRight,
  Info,
} from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'
import { landingContent } from '@/app/(public)/content'

const ICONS: Record<string, typeof School> = {
  School,
  BookOpen,
  Tablet,
  Sparkles,
  GraduationCap,
  Users,
  Truck,
  Handshake,
  Heart: HeartHandshake,
}

export function HowOthersCanHelpSection() {
  const content = landingContent.howOthersCanHelp

  return (
    <section id="how-others-can-help" className="tai-section relative overflow-hidden bg-card/20 border-t border-border/80 py-16 md:py-24">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.2em] text-brand">
                <span>{content.eyebrow}</span>
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
                  N&deg; 12
                </span>
              </div>

              <h2 className="tai-text-display mt-3 font-display text-foreground">
                {content.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                {content.subtitle}
              </p>
            </div>

            <Link
              href="#start-a-conversation"
              className="group inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-7 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep shrink-0"
            >
              {content.cta.label}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </Reveal>

        {/* Funding Balance / Positioning Note */}
        <Reveal delay={0.1}>
          <div className="mt-8 rounded-xl border border-border/80 bg-background/80 p-4 text-xs leading-relaxed text-muted-foreground">
            <div className="flex items-start gap-2.5">
              <Info className="size-4 text-brand shrink-0 mt-0.5" />
              <p>
                <strong className="text-foreground">About our resource model: </strong>
                {content.fundingClarification}
              </p>
            </div>
          </div>
        </Reveal>

        {/* 9 Partnership Pillars Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.cards.map((card, idx) => {
            const IconComponent = ICONS[card.icon] || Handshake
            const isFunding = card.id === 'help-funding'

            return (
              <Reveal key={card.id} delay={idx * 0.06} className="h-full">
                <div
                  className={`group relative flex h-full flex-col justify-between rounded-2xl border p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                    isFunding
                      ? 'border-brand/30 bg-brand/5 hover:border-brand'
                      : 'border-border bg-card hover:border-brand/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="grid size-11 place-items-center rounded-xl bg-muted text-brand group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                        <IconComponent className="size-5" />
                      </div>
                      <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {card.category}
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-lg font-bold text-foreground">
                      {card.title}
                    </h3>

                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-border/60 pt-3">
                    <Link
                      href="#start-a-conversation"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                    >
                      Connect on this &rarr;
                    </Link>
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
