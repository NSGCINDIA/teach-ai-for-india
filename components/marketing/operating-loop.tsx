import { MaskHeading } from '@/components/marketing/mask-heading'
import { Reveal } from '@/components/marketing/reveal'
import { PhotoReveal } from '@/components/marketing/photo-reveal'
import { ProgressiveRail } from '@/components/marketing/progressive-rail'
import type { OperatingLoopContent, VolunteerNote } from '@/app/(public)/content'

interface OperatingLoopProps {
  content: OperatingLoopContent
  volunteerNote: VolunteerNote
  photo?: { src: string; alt: string }
}

/** Section 6 — the operating model as a living, student-run loop, not a generic 3-card "our approach". */
export function OperatingLoop({ content, volunteerNote, photo }: OperatingLoopProps) {
  return (
    <section className="tai-section bg-background">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <p className="tai-eyebrow text-brand">{content.eyebrow}</p>
        <MaskHeading as="h2" lines={[content.headline]} className="tai-text-display mt-4 max-w-2xl font-display text-foreground" />
        <Reveal delay={0.1}>
          <p className="tai-reading mt-4 text-base text-muted-foreground">{content.supportingLine}</p>
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-12">
          <div className="relative pl-10 lg:col-span-7">
            <ProgressiveRail className="left-3" />
            {content.steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08} className="relative pb-10 last:pb-0">
                <span className="absolute -left-10 top-0.5 grid size-6 place-items-center rounded-full border-2 border-[var(--tai-crimson)] bg-[var(--tai-paper)] text-[10px] font-semibold text-[var(--tai-crimson)]">
                  {i + 1}
                </span>
                <h3 className="font-display text-lg text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </Reveal>
            ))}
          </div>

          {photo && (
            <div className="order-last lg:order-none lg:col-span-5">
              <PhotoReveal src={photo.src} alt={photo.alt} aspectClassName="aspect-[4/5]" className="rounded-xl" />
            </div>
          )}
        </div>

        <Reveal delay={0.2}>
          <p className="tai-prose mt-16 border-l border-border pl-6 text-sm italic leading-relaxed text-muted-foreground">
            {volunteerNote.body}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
