import { MaskHeading } from '@/components/marketing/mask-heading'
import { Reveal } from '@/components/marketing/reveal'
import { PhotoReveal } from '@/components/marketing/photo-reveal'
import type { FirstClassroom as FirstClassroomContent } from '@/app/(public)/content'

interface FirstClassroomProps {
  content: FirstClassroomContent
  mainPhoto: { src: string; alt: string }
  insetPhoto: { src: string; alt: string }
}

/** Section 3 — the first pilot session, told as an experiment and a discovery. Main photo + an overlapping inset photo (desktop only). */
export function FirstClassroom({ content, mainPhoto, insetPhoto }: FirstClassroomProps) {
  return (
    <section className="tai-section bg-background">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <p className="tai-eyebrow text-brand">{content.eyebrow}</p>
        <MaskHeading as="h2" lines={[content.headline]} className="tai-text-display mt-4 max-w-4xl font-display text-foreground" />

        <Reveal delay={0.1}>
          <p className="mt-4 text-sm sm:text-base font-medium uppercase tracking-wide text-muted-foreground">{content.metaLine}</p>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="tai-reading mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">{content.body}</p>
        </Reveal>

        <div className="relative mt-14">
          <PhotoReveal src={mainPhoto.src} alt={mainPhoto.alt} aspectClassName="aspect-[16/9]" className="w-full rounded-xl" />
          <div className="absolute -bottom-10 left-6 hidden w-[38%] md:block lg:left-12">
            <PhotoReveal
              src={insetPhoto.src}
              alt={insetPhoto.alt}
              aspectClassName="aspect-[4/5]"
              className="rounded-xl border-4 border-[var(--tai-paper)] shadow-[0_20px_50px_-15px_rgba(28,25,23,0.4)]"
            />
          </div>
        </div>
        <div className="hidden md:block md:h-16 lg:h-20" aria-hidden />
      </div>
    </section>
  )
}
