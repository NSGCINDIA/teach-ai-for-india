import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MaskHeading } from '@/components/marketing/mask-heading'

/** "The Invitation" — the page's final dark section. One CTA per page, tailored copy — never the same banner repeated on every route. */
export function Invitation() {
  return (
    <section className="bg-[var(--tai-deep)] px-5 py-24 text-center text-[var(--tai-linen)] md:px-8 md:py-32">
      <div className="tai-prose mx-auto">
        <MaskHeading
          as="h2"
          className="tai-text-display font-display"
          lines={['There is another classroom waiting.']}
        />
        <p className="mt-6 text-base leading-relaxed text-white/60 md:text-lg">
          Become a campus volunteer and bring applied AI to a classroom that has never had access.
          No prior teaching experience required.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/join"
            className="group inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-7 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-deep"
          >
            Join the movement
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center rounded-xl border border-white/25 px-7 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Partner with us
          </Link>
        </div>
        <p className="mt-6 text-xs uppercase tracking-wider text-white/40">We reply within 24 hours.</p>
      </div>
    </section>
  )
}
