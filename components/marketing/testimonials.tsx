import { Quote } from 'lucide-react'
import { SectionHeading } from '@/components/shared/section-heading'
import { Reveal } from '@/components/marketing/reveal'
import type { TestimonialsContent } from '@/app/(public)/content'

/** Testimonial grid — voices from teachers, volunteers, and principals. */
export function Testimonials({ content }: { content: TestimonialsContent }) {
  if (content.items.length === 0) return null

  return (
    <section className="section-padding">
      <div className="container-wide">
        <Reveal>
          <SectionHeading eyebrow="Voices" title="What the movement sounds like on the ground" />
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {content.items.map((t, i) => (
            <Reveal key={`${t.name}-${i}`} delay={i * 0.08}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-7 shadow-soft">
                <Quote className="size-7 text-brand/30" aria-hidden />
                <blockquote className="mt-4 flex-1 text-pretty text-foreground">{t.quote}</blockquote>
                <figcaption className="mt-6 border-t border-border pt-4">
                  <span className="block font-display font-bold">{t.name}</span>
                  <span className="block text-sm text-muted-foreground">{t.role}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
