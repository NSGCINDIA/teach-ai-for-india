import { MaskHeading } from '@/components/marketing/mask-heading'
import { Reveal } from '@/components/marketing/reveal'
import type { OriginStoryIntro } from '@/app/(public)/content'

/** Section 1 — the page's own h1. Deliberately no photo: contrast before section 2's image. */
export function OriginIntro({ content }: { content: OriginStoryIntro }) {
  return (
    <section className="tai-section-lg bg-background">
      <div className="tai-container px-5 md:px-8">
        <p className="tai-eyebrow text-brand">{content.eyebrow}</p>
        <MaskHeading
          as="h1"
          immediate
          lines={[content.headline]}
          className="tai-text-display-xl mt-5 font-display text-foreground"
        />
        <Reveal delay={0.15}>
          <p className="tai-prose ml-auto mt-10 border-l border-[var(--tai-crimson)]/30 pl-6 text-base leading-relaxed text-muted-foreground md:text-lg">
            {content.body}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
