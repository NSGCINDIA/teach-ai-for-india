import { Reveal } from '@/components/marketing/reveal'
import { PhotoReveal } from '@/components/marketing/photo-reveal'
import type { OriginMoment as OriginMomentContent } from '@/app/(public)/content'

interface OriginMomentProps {
  content: OriginMomentContent
  photo: { src: string; alt: string }
}

/** Section 2 — "March 2026". The idea developing from a question into an answer, one photo bleeding past the grid on desktop. */
export function OriginMoment({ content, photo }: OriginMomentProps) {
  return (
    <section className="tai-section bg-[var(--tai-clay)]/40">
      <div className="tai-container-wide grid gap-10 px-5 md:px-8 lg:grid-cols-12 lg:items-center lg:gap-8 lg:px-12">
        <div className="lg:col-span-5">
          <p className="tai-eyebrow text-brand">{content.eyebrow}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm font-medium uppercase tracking-wide">
            {content.progression.map((step, i) => (
              <Reveal key={step} delay={i * 0.1} className="flex items-center gap-2">
                <span className={i === content.progression.length - 1 ? 'font-semibold text-[var(--tai-crimson)]' : 'text-muted-foreground'}>
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

          <Reveal delay={0.3}>
            <p className="tai-reading mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">{content.body}</p>
          </Reveal>
        </div>

        <div className="lg:col-span-7 lg:-mr-8 xl:-mr-16">
          <PhotoReveal src={photo.src} alt={photo.alt} aspectClassName="aspect-[4/3]" className="rounded-xl" />
        </div>
      </div>
    </section>
  )
}
