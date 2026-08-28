import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MaskHeading } from '@/components/marketing/mask-heading'
import { HeroPhotoSequence, type HeroMoment } from '@/components/marketing/hero-photo-sequence'
import type { HeroContent } from '@/app/(public)/content'

const CLOUDINARY = 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1400'

const MOMENTS: HeroMoment[] = [
  {
    src: `${CLOUDINARY}/v1784177864/WhatsApp_Image_2026-04-18_at_14.46.43_vtswq0.jpg`,
    alt: 'A government school classroom at ZPHS Bachupally before a Teach AI for India session begins',
    title: 'ZPHS Bachupally',
    subtitle: 'Before the first prompt',
  },
  {
    src: `${CLOUDINARY}/v1784177867/IMG_20260324_121056961_prkzll.jpg`,
    alt: 'Students at MPPS Nandakramaguda during Teach AI for India’s first classroom session',
    title: 'MPPS Nandakramaguda',
    subtitle: 'Our first classroom',
  },
  {
    src: `${CLOUDINARY}/v1784177864/IMG-20260406-WA0007_3_hboy0k.jpg`,
    alt: 'A student writing an AI image prompt during a NIAT x Aurora session',
    title: 'NIAT × Aurora',
    subtitle: 'Learning to prompt',
  },
  {
    src: `${CLOUDINARY}/v1784177911/DJI_20260711132101_0313_D_a48glv.jpg`,
    alt: 'Students asking Teach AI for India volunteers questions after the session ended',
    title: 'MPPS Nandakramaguda',
    subtitle: 'After the session ended',
  },
]

/**
 * "Field Report" hero — built around this org's own real vocabulary (a
 * verified session record) rather than a generic NGO/SaaS split-hero. A
 * document header rule runs the width of the page; the headline breaks it;
 * the photograph rotates through real session moments (captioned per frame,
 * "Fig. 0N") instead of sitting static in a box; the one splash of color is
 * a hand-stamped "verified session" mark; verified figures run in monospace
 * like a tally, distinct from the serif story and sans body.
 */
export function Hero({ content }: { content: HeroContent }) {
  return (
    <section className="relative -mt-16 min-h-[92dvh] overflow-hidden bg-background pt-16">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-4 border-b border-foreground/15 pb-4 pt-8">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {content.eyebrow}
          </span>
          <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
            N&deg; 01
          </span>
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7 lg:-mt-6">
            <MaskHeading
              as="h1"
              immediate
              delay={0.25}
              className="tai-text-display-xl font-display leading-[0.95] text-foreground"
              lines={content.headline.split('\n').filter(Boolean)}
            />

            <p className="mt-6 max-w-[520px] text-base leading-relaxed text-muted-foreground md:text-lg">
              {content.subheadline}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/impact"
                className="group inline-flex h-12 items-center gap-2 border border-brand bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
              >
                See the movement
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
              <Link
                href="/join"
                className="group inline-flex h-12 items-center gap-2 border border-foreground/30 px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Join the movement
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </div>

            <div className="mt-12 border-t border-foreground/15 pt-4">
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                {content.proofLine}
              </p>
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <div className="border border-foreground/20 bg-background p-2">
              <HeroPhotoSequence moments={MOMENTS} aspectClassName="aspect-[4/5] lg:aspect-[16/12]" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-5 hidden flex-col items-center gap-2 md:right-8 lg:right-12 md:flex">
        <span
          aria-hidden
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
          style={{ writingMode: 'vertical-rl' }}
        >
          Scroll
        </span>
        <span aria-hidden className="tai-scroll-line h-10 w-px bg-[var(--tai-crimson)]/50" />
      </div>
    </section>
  )
}
