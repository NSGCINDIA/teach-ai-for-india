import { SectionHeading } from '@/components/shared/section-heading'
import { Reveal } from '@/components/marketing/reveal'
import type { HowItWorksContent } from '@/app/(public)/content'

/** "How it works" — a numbered 5-step timeline (identify → report). */
export function HowItWorks({ content }: { content: HowItWorksContent }) {
  return (
    <section className="section-padding bg-muted/40">
      <div className="container-wide">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="From a school on a map to a classroom that codes"
            description="A repeatable five-step playbook every campus team runs, end to end."
          />
        </Reveal>

        <ol className="relative mt-14 grid gap-8 md:grid-cols-5 md:gap-4">
          {/* Connecting line on desktop */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
          />
          {content.steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08}>
              <li className="relative flex flex-col items-center text-center md:items-start md:text-left">
                <span className="z-10 grid size-12 place-items-center rounded-full border border-border bg-card font-display text-lg font-bold text-brand shadow-soft">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-base font-bold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
