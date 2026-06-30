import { SectionHeading } from '@/components/shared/section-heading'
import { Reveal } from '@/components/marketing/reveal'
import { LucideIcon } from '@/components/marketing/lucide-icon'
import type { MissionContent } from '@/app/(public)/content'

/** Mission 3-column — icon + title + copy, icons resolved by name from the CMS. */
export function Mission({ content }: { content: MissionContent }) {
  return (
    <section className="section-padding">
      <div className="container-wide">
        <Reveal>
          <SectionHeading eyebrow={content.eyebrow} title={content.title} description={content.description} />
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {content.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <article className="group h-full rounded-2xl border border-border bg-card p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg">
                <span className="grid size-12 place-items-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  <LucideIcon name={item.icon} className="size-6" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-pretty text-muted-foreground">{item.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
