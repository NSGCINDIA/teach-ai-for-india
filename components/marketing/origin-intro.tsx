import { MaskHeading } from '@/components/marketing/mask-heading'
import { Reveal } from '@/components/marketing/reveal'
import type { OriginStoryIntro } from '@/app/(public)/content'

/** Section 1 — the page's own h1 with concise credibility statement. */
export function OriginIntro({ content }: { content: OriginStoryIntro }) {
  return (
    <section className="tai-section-lg bg-background pt-16 md:pt-24 pb-12 md:pb-16">
      <div className="tai-container px-5 md:px-8">
        <p className="tai-eyebrow text-brand">{content.eyebrow}</p>
        <MaskHeading
          as="h1"
          immediate
          lines={[content.headline]}
          className="tai-text-display-xl mt-5 font-display text-foreground"
        />

        {/* Concise Credibility Statement */}
        <p className="mt-4 font-mono text-sm uppercase tracking-wider text-brand font-semibold sm:text-base">
          A student-led initiative bringing practical AI education to government schools.
        </p>

        <Reveal delay={0.15}>
          <p className="tai-prose ml-auto mt-10 border-l-2 border-[var(--tai-crimson)]/40 pl-6 text-base leading-relaxed text-muted-foreground md:text-lg">
            {content.body}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
