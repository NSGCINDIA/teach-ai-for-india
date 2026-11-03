import { ArrowRight, Cpu, Code2, Users, Sparkles, BookOpen } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'
import { landingContent } from '@/app/(public)/content'

export function WhyTheyTeachSection() {
  const content = landingContent.whyTheyTeach

  return (
    <section id="why-they-teach" className="tai-section relative overflow-hidden bg-card/20 border-t border-border/80 py-16 md:py-24">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <Reveal>
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="tai-eyebrow text-brand">{content.eyebrow}</span>
              <span className="rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-brand">
                N&deg; 04
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

        {/* 3 Contrast Columns / Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {content.contrasts.map((item, idx) => (
            <Reveal key={idx} delay={idx * 0.1} className="h-full">
              <div className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md">
                <div className="space-y-6">
                  {/* Part 1: What we learn at NIAT */}
                  <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        At NIAT
                      </span>
                      <span className="rounded-md bg-background px-2 py-0.5 text-[10px] font-semibold text-foreground/80">
                        Input
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-foreground">
                      {item.learnTitle}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {item.learnDescription}
                    </p>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex items-center justify-center -my-2 text-brand">
                    <span className="rounded-full bg-brand/10 p-1.5 shadow-xs">
                      <ArrowRight className="size-4 rotate-90 md:rotate-0" />
                    </span>
                  </div>

                  {/* Part 2: What we give back */}
                  <div className="rounded-xl border border-brand/30 bg-brand/5 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-brand">
                        In the Classroom
                      </span>
                      <span className="rounded-md bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                        Giving Back
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-foreground">
                      {item.giveTitle}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-foreground/85">
                      {item.giveDescription}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-border/60 pt-3 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Dimension 0{idx + 1} · Shared Knowledge
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
