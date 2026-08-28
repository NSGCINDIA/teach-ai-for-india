import { MaskHeading } from '@/components/marketing/mask-heading'
import type { WhatWeBelieve as WhatWeBelieveContent } from '@/app/(public)/content'

/**
 * Section 5 — visually dominant, but kept on the light palette. The homepage
 * already reserves exactly two dark sections (Tension, Invitation) for
 * dramatic contrast; a third here would blunt that rhythm. Dominance instead
 * comes from oversized type, the crimson statement, and generous whitespace.
 */
export function WhatWeBelieve({ content }: { content: WhatWeBelieveContent }) {
  return (
    <section className="tai-section-lg bg-[var(--tai-clay)]/30">
      <div className="tai-container px-5 text-center md:px-8">
        <MaskHeading as="h2" lines={[content.notLine]} className="tai-text-h2 font-display text-muted-foreground" />
        <div className="mx-auto my-8 h-px w-16 bg-[var(--tai-crimson)]" aria-hidden />
        <MaskHeading
          as="h3"
          lines={[content.believeLine]}
          className="tai-text-display mx-auto max-w-3xl font-display text-[var(--tai-crimson)]"
        />
      </div>
    </section>
  )
}
