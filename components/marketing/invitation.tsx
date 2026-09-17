import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MaskHeading } from '@/components/marketing/mask-heading'

/** "The Invitation" — the page's final dark section. One CTA per page, tailored copy — never the same banner repeated on every route. */
export function Invitation() {
  return (
    <section className="bg-[var(--tai-deep)] px-5 py-14 text-center text-[var(--tai-linen)] md:px-8 md:py-20">
      <div className="max-w-4xl mx-auto">
        <MaskHeading
          as="h2"
          className="tai-text-display font-display"
          lines={['Help us take the next AI classroom', 'to a student who needs it.']}
        />
        <p className="mt-6 text-lg leading-relaxed text-white/75 md:text-xl max-w-2xl mx-auto">
          Every session gives a government school student their first opportunity to build with AI. Join as an institutional partner or fund a classroom today.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="#fund-a-classroom"
            className="group inline-flex h-13 items-center gap-2 rounded-xl bg-brand px-8 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-deep shadow-md"
          >
            Fund a Classroom
            <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
          <Link
            href="/contact?intent=partner"
            className="inline-flex h-13 items-center rounded-xl border border-white/25 px-8 text-base font-semibold text-white transition-colors hover:bg-white/10"
          >
            Partner With Us
          </Link>
        </div>
        <p className="mt-6 text-sm uppercase tracking-wider text-white/50">We reply within 24 hours.</p>
      </div>
    </section>
  )
}
