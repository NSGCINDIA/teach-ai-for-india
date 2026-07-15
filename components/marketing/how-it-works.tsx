import { SectionHeading } from '@/components/shared/section-heading'
import { Reveal } from '@/components/marketing/reveal'
import type { HowItWorksContent } from '@/app/(public)/content'
import { Search, MessageSquareCode, ShieldCheck, Presentation, ClipboardCheck } from 'lucide-react'

const ICONS = [
  Search,
  MessageSquareCode,
  ShieldCheck,
  Presentation,
  ClipboardCheck,
]

const ICON_BGS = [
  'bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white',
  'bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange group-hover:text-white',
  'bg-brand-teal/10 text-brand-teal group-hover:bg-brand-teal group-hover:text-white',
  'bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white',
  'bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange group-hover:text-white',
]

/** "How it works" — a numbered 5-step timeline (identify → report). */
export function HowItWorks({ content }: { content: HowItWorksContent }) {
  return (
    <section className="section-padding bg-muted/40 relative overflow-hidden">
      {/* Inline styles for connection timeline animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flow-line {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}} />

      <div className="container-wide">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="From a school on a map to a classroom that codes"
            description="A repeatable five-step playbook every campus team runs, end to end."
          />
        </Reveal>

        <ol className="relative mt-14 grid gap-6 md:grid-cols-5">
          {/* Animated flowing gradient connection line on desktop */}
          <div
            aria-hidden
            className="absolute left-6 right-6 top-[44px] hidden h-0.5 md:block opacity-40 rounded-full"
            style={{
              backgroundImage: 'linear-gradient(90deg, var(--brand), var(--brand-orange), var(--brand-teal), var(--brand))',
              backgroundSize: '300% 100%',
              animation: 'flow-line 5s linear infinite',
            }}
          />
          
          {content.steps.map((step, i) => {
            const Icon = ICONS[i] || Search
            return (
              <Reveal key={step.title} delay={i * 0.08}>
                <li className="group relative flex flex-col items-center text-center md:items-start md:text-left bg-card/50 dark:bg-card/25 backdrop-blur border border-border/80 rounded-2xl p-6 shadow-soft hover:shadow-soft-lg hover:-translate-y-1.5 transition-all duration-300 h-full">
                  {/* Glowing background on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* Step indicators */}
                  <div className="relative z-10 flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl font-display text-sm font-extrabold border border-border bg-background shadow-sm text-muted-foreground group-hover:text-brand group-hover:border-brand/30 transition-all duration-300">
                      {i + 1}
                    </span>
                    <span className={`grid size-10 place-items-center rounded-xl transition-all duration-300 ${ICON_BGS[i]}`}>
                      <Icon className="size-5" />
                    </span>
                  </div>

                  <h3 className="relative z-10 mt-5 font-display text-base font-extrabold text-foreground group-hover:text-brand transition-colors">
                    {step.title}
                  </h3>
                  <p className="relative z-10 mt-2 text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </li>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
