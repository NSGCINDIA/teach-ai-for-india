import Image from 'next/image'
import { MapPin, Quote, Sparkles } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'
import { landingContent } from '@/app/(public)/content'

export function StoriesFromTheFieldSection() {
  const content = landingContent.storiesFromTheField

  return (
    <section id="field-stories" className="tai-section relative overflow-hidden bg-card/25 border-t border-b border-border/80 py-16 md:py-24">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <Reveal>
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.2em] text-brand">
              <span>{content.eyebrow}</span>
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
                N&deg; 10
              </span>
            </div>

            <h2 className="tai-text-display mt-3 font-display text-foreground">
              {content.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {content.subtitle}
            </p>
          </div>
        </Reveal>

        {/* 3 Story Cards */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {content.stories.map((story, idx) => (
            <Reveal key={story.id} delay={idx * 0.1} className="h-full">
              <div className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md">
                <div>
                  {/* Image slot */}
                  <div className="relative mb-5 aspect-[16/10] w-full overflow-hidden rounded-xl border border-border/80 bg-muted">
                    <Image
                      src={story.photoUrl}
                      alt={story.photoSlot}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 right-2.5 rounded-full bg-black/60 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-white backdrop-blur-xs">
                      [REAL PHOTO]
                    </div>
                  </div>

                  {/* School & Tag */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <MapPin className="size-3.5 text-brand shrink-0" />
                    <span>{story.school}</span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-2 font-display text-xl font-bold text-foreground">
                    {story.title}
                  </h3>

                  {/* Pull Quote */}
                  <div className="my-4 rounded-xl border-l-3 border-brand bg-brand/5 p-3.5">
                    <p className="font-serif text-sm font-bold italic text-brand">
                      {story.quote}
                    </p>
                  </div>

                  {/* Narrative Body */}
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {story.narrative}
                  </p>
                </div>

                {/* Speaker Attribution */}
                <div className="mt-6 border-t border-border/60 pt-3">
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {story.speaker}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    Verified Classroom Record
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
