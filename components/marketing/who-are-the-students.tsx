import Image from 'next/image'
import { GraduationCap, MapPin, Sparkles } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'
import { landingContent } from '@/app/(public)/content'

export function WhoAreTheStudentsSection() {
  const content = landingContent.whoAreTheStudents

  return (
    <section id="who-are-the-students" className="tai-section relative overflow-hidden bg-background py-16 md:py-24">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <Reveal>
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="tai-eyebrow text-brand">{content.eyebrow}</span>
              <span className="rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-brand">
                N&deg; 03
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

        {/* Student Profiles Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.profiles.map((profile, idx) => (
            <Reveal key={profile.id} delay={idx * 0.08} className="h-full">
              <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md">
                <div>
                  {/* Photo & Badge slot */}
                  <div className="relative mb-5 aspect-[16/10] w-full overflow-hidden rounded-xl border border-border/80 bg-muted">
                    <Image
                      src={profile.photoUrl}
                      alt={profile.photoSlot}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 right-2.5 rounded-full bg-black/60 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-white backdrop-blur-xs">
                      [REAL PHOTO]
                    </div>
                  </div>

                  {/* Header info */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground">
                        {profile.name}
                      </h3>
                      <p className="text-xs font-semibold text-brand">
                        {profile.role}
                      </p>
                    </div>
                  </div>

                  {/* Campus & Focus tags */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground/80">
                      <MapPin className="size-3 text-brand" />
                      {profile.campus}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-brand/5 px-2 py-0.5 text-[11px] font-medium text-brand">
                      <GraduationCap className="size-3" />
                      {profile.studyFocus}
                    </span>
                  </div>

                  {/* Bio & Classroom Work */}
                  <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                    {profile.story}
                  </p>
                </div>

                {/* Direct Quote */}
                <div className="mt-5 border-t border-border/60 pt-3">
                  <p className="text-xs italic text-foreground/90 font-serif">
                    {profile.quote}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
