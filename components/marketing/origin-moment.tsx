import { Reveal } from '@/components/marketing/reveal'
import { PhotoReveal } from '@/components/marketing/photo-reveal'
import type { OriginMoment as OriginMomentContent } from '@/app/(public)/content'

interface OriginMomentProps {
  content: OriginMomentContent
  photo: { src: string; alt: string }
}

/** Section 2 — "March 2026". The idea developing from a question into an answer, with generous whitespace and clear pull quote. */
export function OriginMoment({ content, photo }: OriginMomentProps) {
  return (
    <section className="tai-section bg-[var(--tai-clay)]/30 py-16 md:py-24">
      <div className="tai-container-wide grid gap-12 px-5 md:px-8 lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-12">
        <div className="lg:col-span-6">
          <p className="tai-eyebrow text-brand">{content.eyebrow}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm font-medium uppercase tracking-wide">
            {content.progression.map((step, i) => (
              <Reveal key={step} delay={i * 0.1} className="flex items-center gap-2">
                <span
                  className={
                    i === content.progression.length - 1
                      ? 'font-bold text-brand bg-brand/10 px-2.5 py-1 rounded-md'
                      : 'text-muted-foreground'
                  }
                >
                  {step}
                </span>
                {i < content.progression.length - 1 && (
                  <span aria-hidden className="text-muted-foreground/50">
                    →
                  </span>
                )}
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="my-6 border-l-2 border-brand pl-5">
              <p className="font-display text-xl italic font-semibold text-foreground md:text-2xl">
                &ldquo;What could we teach that almost no one else was?&rdquo;
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              <p>
                It started inside a student group at NIAT looking for a real way to give back to society. The first instinct was obvious — teach mathematics or physics, the subjects we knew best.
              </p>
              <p>
                Then we asked a harder question: plenty of people were already tutoring textbook subjects. We were already learning generative AI ourselves. No one was bringing it to the students who needed access the most.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-6">
          <PhotoReveal src={photo.src} alt={photo.alt} aspectClassName="aspect-[4/3]" className="rounded-2xl shadow-lg" />
        </div>
      </div>
    </section>
  )
}
