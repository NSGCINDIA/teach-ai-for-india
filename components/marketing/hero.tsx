import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MaskHeading } from '@/components/marketing/mask-heading'
import { HeroPhotoSequence, type HeroMoment } from '@/components/marketing/hero-photo-sequence'
import { landingContent, type HeroContent, type LandingHeroContent } from '@/app/(public)/content'

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
export function Hero({ content }: { content?: Partial<LandingHeroContent & HeroContent> }) {
  const c = { ...landingContent.hero, ...content }

  return (
    <section className="relative -mt-16 overflow-hidden bg-background pt-20 pb-12 md:pb-16 lg:pb-20">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-4 border-b border-foreground/15 pb-4 pt-8">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground sm:text-sm">
            {c.eyebrow}
          </span>
          <span className="shrink-0 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground/70 sm:text-sm">
            N&deg; 01
          </span>
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7 lg:-mt-6">
            {/* Learning Cycle Badge */}
            <div className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3.5 py-1 font-mono text-xs font-semibold text-brand">
              {c.coreCycle ? (
                c.coreCycle.map((step, idx) => (
                  <span key={step} className="inline-flex items-center gap-2">
                    <span>{step}</span>
                    {idx < c.coreCycle.length - 1 && <span className="text-brand/40">→</span>}
                  </span>
                ))
              ) : (
                <span>Learn → Teach → Build → Lead → Pass It On</span>
              )}
            </div>

            <MaskHeading
              as="h1"
              immediate
              delay={0.25}
              className="tai-text-display-xl font-display leading-[0.95] text-foreground"
              lines={c.headline.split('\n').filter(Boolean)}
            />

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {c.subheadline}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={c.primaryCta?.href || '#see-in-action'}
                className="group inline-flex h-13 items-center gap-2 rounded-xl border border-brand bg-brand px-7 text-base font-semibold text-white transition-colors hover:bg-brand-deep shadow-sm"
              >
                {c.primaryCta?.label || 'See Teach AI in Action'}
                <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
              <Link
                href={c.secondaryCta?.href || '#who-are-the-students'}
                className="group inline-flex h-13 items-center gap-2 rounded-xl border border-foreground/30 px-7 text-base font-semibold text-foreground transition-colors hover:bg-muted"
              >
                {c.secondaryCta?.label || 'Meet the Students'}
                <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </div>

            {c.primaryCta?.microcopy && (
              <p className="mt-3 text-xs text-muted-foreground font-mono">
                {c.primaryCta.microcopy}
              </p>
            )}

            <div className="mt-10 border-t border-foreground/15 pt-4">
              <p className="font-mono text-sm uppercase tracking-[0.12em] text-muted-foreground font-medium">
                {c.proofLine}
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
