import Link from 'next/link'
import { ArrowRight, Sparkles, School, Handshake } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

export function ImpactWhatsNext() {
  return (
    <section className="tai-section bg-background py-16 md:py-24">
      <div className="tai-container px-5 md:px-8">
        {/* WHAT'S NEXT SECTION */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-brand">
            <Sparkles className="size-3.5" />
            The Road Ahead
          </div>
          <h2 className="tai-text-display mt-4 font-display text-foreground">
            More classrooms are ahead.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            Students across NIAT campuses are helping bring AI learning to more classrooms. We&apos;re continuing to work with schools and partners to expand this movement.
          </p>
        </div>

        {/* FINAL TWO-PATH CTA */}
        <div className="mt-14 max-w-4xl mx-auto rounded-3xl border border-foreground/15 bg-card/60 p-8 sm:p-12 shadow-sm">
          <div className="text-center">
            <h3 className="font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
              Help the next classroom experience AI.
            </h3>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base max-w-2xl mx-auto leading-relaxed">
              Whether you are a school, CSR team, foundation, or partner, you can join NIAT students in creating meaningful learning experiences for children across India.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact?intent=partner"
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand px-8 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep sm:w-auto"
            >
              Partner With Us &rarr;
            </Link>
            <Link
              href="/contact?intent=school"
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl border border-foreground/25 bg-background px-8 text-base font-semibold text-foreground transition-colors hover:bg-muted sm:w-auto"
            >
              Bring Teach AI to Your School &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
