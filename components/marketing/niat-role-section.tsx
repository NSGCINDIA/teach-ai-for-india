import { ArrowRight, Info, Building, Users, Rocket, Handshake } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'
import { landingContent } from '@/app/(public)/content'

export function NiatRoleSection() {
  const content = landingContent.niatRole

  const icons = [Building, Users, Rocket, Handshake]

  return (
    <section id="niats-role" className="tai-section relative overflow-hidden bg-background py-16 md:py-24">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <Reveal>
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="tai-eyebrow text-brand">{content.eyebrow}</span>
              <span className="rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-brand">
                N&deg; 05
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

        {/* 4-Node Relationship Architecture Diagram */}
        <div className="mt-14">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {content.nodes.map((node, idx) => {
              const Icon = icons[idx] || Building
              return (
                <Reveal key={node.step} delay={idx * 0.1} className="h-full">
                  <div className="relative flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md">
                    <div>
                      {/* Step & Role badge */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-brand bg-brand/10 px-2.5 py-1 rounded-md">
                          Step {node.step}
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {node.role}
                        </span>
                      </div>

                      {/* Icon & Title */}
                      <div className="mt-6 flex items-center gap-3">
                        <div className="grid size-11 place-items-center rounded-xl bg-muted text-brand shadow-xs">
                          <Icon className="size-5" />
                        </div>
                        <h3 className="font-display text-xl font-bold text-foreground">
                          {node.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                        {node.description}
                      </p>
                    </div>

                    {/* Flow arrow to next node */}
                    <div className="mt-6 border-t border-border/60 pt-3">
                      {idx < content.nodes.length - 1 ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand">
                          <span>Leads to: {content.nodes[idx + 1].title}</span>
                          <ArrowRight className="size-3" />
                        </div>
                      ) : (
                        <div className="text-xs font-semibold text-emerald-600">
                          Classroom Impact Scaled
                        </div>
                      )}
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>

        {/* Ecosystem Governance & Clarification Note */}
        <Reveal delay={0.4}>
          <div className="mt-10 rounded-2xl border border-border/80 bg-muted/40 p-5 md:p-6">
            <div className="flex items-start gap-3">
              <Info className="size-5 shrink-0 text-brand mt-0.5" />
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  Organizational Context &amp; Relationship
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {content.clarificationNote}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
