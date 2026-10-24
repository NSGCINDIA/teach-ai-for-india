import { MaskHeading } from '@/components/marketing/mask-heading'
import { Reveal } from '@/components/marketing/reveal'
import { PhotoReveal } from '@/components/marketing/photo-reveal'
import type { FirstClassroom as FirstClassroomContent } from '@/app/(public)/content'

interface FirstClassroomProps {
  content: FirstClassroomContent
  mainPhoto: { src: string; alt: string }
  insetPhoto: { src: string; alt: string }
}

/** Section 3 — the first pilot session, told with short paragraphs, pull quotes, and rich whitespace. */
export function FirstClassroom({ content, mainPhoto, insetPhoto }: FirstClassroomProps) {
  return (
    <section className="tai-section bg-background py-16 md:py-24">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <p className="tai-eyebrow text-brand">{content.eyebrow}</p>
        <MaskHeading as="h2" lines={[content.headline]} className="tai-text-display mt-4 max-w-4xl font-display text-foreground" />

        <Reveal delay={0.1}>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-card px-4 py-1.5 font-mono text-xs sm:text-sm font-semibold text-muted-foreground">
            {content.metaLine}
          </div>
        </Reveal>

        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6 space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            <p>
              Our first pilot was MPPS Nandakramaguda, a government school a short distance from our NIAT campus. About 150 students showed up.
            </p>
            <p>
              We had one hour and fifteen minutes, a few shared tablets, and one simple goal: show them what AI actually is in practice.
            </p>
            <div className="my-4 border-l-2 border-brand pl-4">
              <p className="font-display text-lg italic text-foreground md:text-xl">
                &ldquo;We expected to introduce something unfamiliar. Instead, we found students eager to create.&rdquo;
              </p>
            </div>
            <p>
              They already knew AI existed — they had seen videos and chatbots. What they had never experienced was holding the device, writing a prompt, and seeing their own ideas appear on screen.
            </p>
          </div>

          <div className="lg:col-span-6 relative">
            <PhotoReveal src={mainPhoto.src} alt={mainPhoto.alt} aspectClassName="aspect-[16/10]" className="w-full rounded-2xl shadow-md" />
            <div className="absolute -bottom-8 -left-6 hidden w-[45%] md:block">
              <PhotoReveal
                src={insetPhoto.src}
                alt={insetPhoto.alt}
                aspectClassName="aspect-[4/5]"
                className="rounded-xl border-4 border-background shadow-2xl"
              />
            </div>
          </div>
        </div>

        <div className="hidden md:block md:h-12" aria-hidden />
      </div>
    </section>
  )
}
