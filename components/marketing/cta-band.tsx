import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/marketing/reveal'

interface CtaBandProps {
  title?: string
  description?: string
  primary?: { href: string; label: string }
  secondary?: { href: string; label: string }
}

/** Full-width volunteer / conversion CTA band. */
export function CtaBand({
  title = 'Put your skills where they change a life',
  description = 'Become a campus volunteer and bring applied AI to a classroom that has never had access. No prior teaching experience required.',
  primary = { href: '/join', label: 'Join the movement' },
  secondary = { href: '/contact', label: 'Partner with us' },
}: CtaBandProps) {
  return (
    <section className="cv-auto section-padding">
      <div className="container-wide">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4c0519] via-[#881337] to-[#4c0519] border border-rose-400/20 px-6 py-14 text-center text-white shadow-soft-lg md:px-12 md:py-20">
            <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid opacity-20" />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[#be123c]/30 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-20 -bottom-20 size-72 rounded-full bg-[#e11d48]/20 blur-3xl"
            />
            <div className="relative mx-auto max-w-4xl">
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-balance md:text-5xl lg:text-6xl">{title}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-pretty text-rose-100/95 text-lg md:text-xl leading-relaxed">{description}</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="group h-13 px-8 text-base w-full bg-white text-[#881337] hover:bg-slate-100 sm:w-auto font-bold rounded-full shadow-lg shadow-rose-950/30">
                  <Link href={primary.href}>
                    {primary.label}
                    <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-13 px-8 text-base w-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto rounded-full"
                >
                  <Link href={secondary.href}>{secondary.label}</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
