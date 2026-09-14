import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MaskHeading } from '@/components/marketing/mask-heading'
import { Reveal } from '@/components/marketing/reveal'
import { PhotoReveal } from '@/components/marketing/photo-reveal'
import type { WhyWeContinue as WhyWeContinueContent } from '@/app/(public)/content'

interface WhyWeContinueProps {
  content: WhyWeContinueContent
  photo: { src: string; alt: string }
}

/** Section 7 — the closing note, plus a restrained CTA (the volunteer program is still being planned, so this reads as "register interest," not "join now"). */
export function WhyWeContinue({ content, photo }: WhyWeContinueProps) {
  return (
    <section className="tai-section-lg bg-background">
      <div className="tai-container px-5 md:px-8">
        <p className="tai-eyebrow text-brand">{content.eyebrow}</p>
        <MaskHeading as="h2" lines={[content.headline]} className="tai-text-display mt-4 max-w-4xl font-display text-foreground" />
        <Reveal delay={0.1}>
          <p className="mt-6 text-xl text-foreground font-medium">{content.body}</p>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="tai-reading mt-4 text-lg text-muted-foreground">
            {content.outcomes.map((o, i) => (
              <span key={o}>
                {o}
                {i < content.outcomes.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </p>
        </Reveal>

        <div className="mt-14">
          <PhotoReveal src={photo.src} alt={photo.alt} aspectClassName="aspect-[16/9]" className="rounded-xl" />
        </div>

        <Reveal delay={0.2}>
          <div className="mt-14 border-t border-border pt-10">
            <p className="tai-prose text-base leading-relaxed text-muted-foreground">{content.ctaNote}</p>
            <Link
              href="/join"
              className="group mt-5 inline-flex items-center gap-2 text-base font-semibold text-brand"
            >
              {content.ctaLabel}
              <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
