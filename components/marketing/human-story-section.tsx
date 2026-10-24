import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'
import { landingContent } from '@/app/(public)/content'

export function HumanStorySection() {
  const content = landingContent.humanStory

  return (
    <section id="human-story" className="tai-section relative overflow-hidden bg-card/30 border-t border-b border-border/80 py-16 md:py-24">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-14">
          <div className="lg:col-span-7">
            <Reveal>
              <div className="flex items-center gap-2">
                <span className="tai-eyebrow text-brand">{content.eyebrow}</span>
                <span className="rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-brand">
                  N&deg; 02
                </span>
              </div>

              <h2 className="tai-text-display mt-4 font-display text-foreground leading-[1.08]">
                {content.title}
              </h2>
            </Reveal>

            {/* Progression Breadcrumb */}
            <Reveal delay={0.1}>
              <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {content.progression.map((step, idx) => (
                  <div key={step} className="flex items-center gap-2">
                    <span
                      className={
                        idx === content.progression.length - 1
                          ? 'rounded-md bg-brand/10 px-2 py-0.5 font-bold text-brand'
                          : 'text-foreground/80'
                      }
                    >
                      {step}
                    </span>
                    {idx < content.progression.length - 1 && (
                      <span aria-hidden className="text-muted-foreground/40">
                        →
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Student Story Narrative */}
            <div className="mt-8 space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              <Reveal delay={0.15}>
                <p className="font-medium text-foreground text-lg md:text-xl leading-snug">
                  {content.lead}
                </p>
              </Reveal>

              {content.paragraphs.map((p, i) => (
                <Reveal key={i} delay={0.2 + i * 0.05}>
                  <p>{p}</p>
                </Reveal>
              ))}
            </div>

            {/* Key Takeaway / Closing Quote */}
            <Reveal delay={0.35}>
              <div className="my-8 rounded-xl border-l-4 border-brand bg-background/80 p-5 shadow-xs">
                <p className="font-display text-xl font-bold italic text-foreground md:text-2xl">
                  &ldquo;{content.closingQuote}&rdquo;
                </p>
                <p className="mt-1 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  — The core principle behind Teach AI for India
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.4}>
              <div className="pt-2">
                <Link
                  href={content.cta.href}
                  className="group inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-7 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep"
                >
                  {content.cta.label}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={0.25}>
              <div className="group relative overflow-hidden rounded-2xl border border-foreground/15 bg-background shadow-md">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={content.photoSlot.url}
                    alt={content.photoSlot.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute top-4 right-4 rounded-full bg-black/60 px-3 py-1 font-mono text-[11px] font-medium text-white backdrop-blur-sm">
                    [REAL PHOTO]
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm font-medium leading-relaxed text-foreground">
                    {content.photoSlot.caption}
                  </p>
                  <p className="mt-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Peer Mentorship in Action · Telangana
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
