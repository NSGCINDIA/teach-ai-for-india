import { MaskHeading } from '@/components/marketing/mask-heading'
import { Reveal } from '@/components/marketing/reveal'
import { PhotoReveal } from '@/components/marketing/photo-reveal'
import { ProgressiveRail } from '@/components/marketing/progressive-rail'
import { RefreshCw } from 'lucide-react'
import type { OperatingLoopContent, VolunteerNote } from '@/app/(public)/content'

interface OperatingLoopProps {
  content: OperatingLoopContent
  volunteerNote?: VolunteerNote
  photo?: { src: string; alt: string }
}

/** Section 6 — "How the movement runs", styled as a repeatable, disciplined operating model. */
export function OperatingLoop({ content, volunteerNote, photo }: OperatingLoopProps) {
  return (
    <section className="tai-section bg-background py-16 md:py-24">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="tai-eyebrow text-brand">{content.eyebrow}</p>
          <MaskHeading as="h2" lines={[content.headline]} className="tai-text-display mt-4 font-display text-foreground" />
          
          <Reveal delay={0.1}>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {content.supportingLine}
            </p>
            {/* Repeatable Cycle Supporting Line */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-muted/70 px-4 py-2 text-xs sm:text-sm font-medium text-foreground">
              <RefreshCw className="size-4 text-brand shrink-0" />
              <span>A simple cycle designed to learn from every classroom and improve the next one.</span>
            </div>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className="relative pl-10 lg:col-span-7">
            <ProgressiveRail className="left-3" />
            {content.steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.07} className="relative pb-10 last:pb-0">
                <span className="absolute -left-10 top-0.5 grid size-7 place-items-center rounded-full border-2 border-[var(--tai-crimson)] bg-background text-xs font-bold text-[var(--tai-crimson)] shadow-sm">
                  {i + 1}
                </span>
                <h3 className="font-display text-xl font-bold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-base text-muted-foreground leading-relaxed">{step.description}</p>
              </Reveal>
            ))}
          </div>

          {photo && (
            <div className="order-last lg:order-none lg:col-span-5 sticky top-24">
              <PhotoReveal src={photo.src} alt={photo.alt} aspectClassName="aspect-[4/5]" className="rounded-2xl shadow-md" />
              <p className="mt-3 text-xs font-mono text-muted-foreground text-center">
                Fig. — Volunteer chapter preparing session curriculum &amp; logistics
              </p>
            </div>
          )}
        </div>

        {volunteerNote && (
          <Reveal delay={0.2}>
            <div className="mt-16 border-l-2 border-brand/40 pl-6">
              <p className="tai-prose text-base italic leading-relaxed text-muted-foreground md:text-lg">
                {volunteerNote.body}
              </p>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
