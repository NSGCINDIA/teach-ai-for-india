import { Reveal } from '@/components/marketing/reveal'
import type { PartnersContent } from '@/app/(public)/content'

/** Partner / supporter logo strip. Text wordmarks until real logos are in the CMS. */
export function Partners({ content }: { content: PartnersContent }) {
  if (content.items.length === 0) return null

  return (
    <section className="section-padding-sm border-y border-border bg-muted/30">
      <div className="container-wide">
        <Reveal>
          <p className="section-label text-center text-muted-foreground">Powered by a coalition of</p>
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {content.items.map((p) => (
              <li
                key={p.name}
                className="font-display text-lg font-bold text-muted-foreground/70 transition-colors hover:text-foreground"
              >
                {p.name}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
