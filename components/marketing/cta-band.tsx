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
    <section className="section-padding">
      <div className="container-wide">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-14 text-center text-white shadow-soft-lg md:px-12 md:py-20">
            <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid opacity-20" />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-brand-teal/30 blur-3xl"
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-balance md:text-4xl">{title}</h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-white/85 md:text-lg">{description}</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="group w-full bg-white text-brand hover:bg-white/90 sm:w-auto">
                  <Link href={primary.href}>
                    {primary.label}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
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
