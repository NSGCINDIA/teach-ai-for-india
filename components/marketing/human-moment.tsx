import { Reveal } from '@/components/marketing/reveal'
import { WordReveal } from '@/components/marketing/word-reveal'
import { PhotoReveal } from '@/components/marketing/photo-reveal'
import type { HumanMoment as HumanMomentContent } from '@/app/(public)/content'

interface HumanMomentProps {
  content: HumanMomentContent
  photo: { src: string; alt: string }
}

/**
 * Section 4 — the emotional center. The photo settles in on its own, then as
 * the reader keeps scrolling the quote reveals separately below it — a plain
 * scroll transition between two independently-triggered moments, not a
 * text-over-photo overlay (that treatment already belongs to `Evidence` on
 * the homepage, which uses this same real quote).
 */
export function HumanMoment({ content, photo }: HumanMomentProps) {
  return (
    <section className="tai-section-lg bg-background">
      <div className="tai-container px-5 md:px-8">
        <Reveal className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{content.leadIn}</p>
        </Reveal>

        <div className="mt-10">
          <PhotoReveal src={photo.src} alt={photo.alt} aspectClassName="aspect-[3/2]" className="mx-auto max-w-3xl rounded-xl" />
        </div>

        <div className="mt-14 text-center">
          <WordReveal
            text={`“${content.quote}”`}
            className="font-display italic text-[clamp(2rem,6vw,4.5rem)] leading-[1.05] text-foreground"
          />
          <Reveal delay={0.2}>
            <p className="mt-6 text-sm text-muted-foreground">{content.attribution}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-[var(--tai-crimson)]">{content.tag}</p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="tai-prose mx-auto mt-8 text-base leading-relaxed text-muted-foreground">{content.afterNote}</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
