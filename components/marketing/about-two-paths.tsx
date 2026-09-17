import Link from 'next/link'
import { ArrowRight, GraduationCap, Handshake } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

export function AboutTwoPaths() {
  return (
    <section className="tai-section bg-[var(--tai-clay)]/25 border-t border-foreground/10 py-16 md:py-24">
      <div className="tai-container px-5 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="tai-eyebrow text-brand">Get Involved</p>
          <h2 className="tai-text-display mt-3 font-display text-foreground">
            Help us take the next step.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            Whether you want to bring your skills to a classroom or help us reach more students, there is a place for you in the movement.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {/* VOLUNTEER CARD */}
          <Reveal delay={0.1}>
            <div className="flex h-full flex-col justify-between rounded-2xl border border-foreground/15 bg-background p-8 transition-all hover:border-brand/40 hover:shadow-md">
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <GraduationCap className="size-6" />
                </div>
                <span className="mt-6 inline-block font-mono text-xs font-bold uppercase tracking-widest text-brand">
                  Volunteer
                </span>
                <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
                  Bring what you&apos;ve learned to a classroom.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Join a collegiate team or start a chapter on your campus. We provide sandbox environments, bilingual curriculum, and classroom safety coordination.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-foreground/10">
                <Link
                  href="/join"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-deep shadow-sm"
                >
                  Join as a Volunteer &rarr;
                </Link>
              </div>
            </div>
          </Reveal>

          {/* PARTNER CARD */}
          <Reveal delay={0.2}>
            <div className="flex h-full flex-col justify-between rounded-2xl border border-foreground/15 bg-background p-8 transition-all hover:border-brand/40 hover:shadow-md">
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Handshake className="size-6" />
                </div>
                <span className="mt-6 inline-block font-mono text-xs font-bold uppercase tracking-widest text-brand">
                  Partner
                </span>
                <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
                  Help us bring practical AI education to more schools.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Connect as a school principal, corporate CSR team, or philanthropic foundation to sponsor classrooms, fund learning kits, or adopt school programs.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-foreground/10">
                <Link
                  href="/contact?intent=partner"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-foreground/25 bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Partner With Us &rarr;
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
