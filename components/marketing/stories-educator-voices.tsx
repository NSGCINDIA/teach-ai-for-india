'use client'

import { Quote, School } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface EducatorQuote {
  quote: string
  name: string
  role: string
  school: string
  location: string
}

const EDUCATORS: EducatorQuote[] = [
  {
    quote:
      'The students showed strong interest and picked things up quickly. With proper teaching, they have clear potential to grow and perform well.',
    name: 'Balaji',
    role: 'Principal',
    school: 'ZPH High School Sontyam',
    location: 'Visakhapatnam District',
  },
  {
    quote:
      'All the volunteers did a solid job delivering the sessions clearly and effectively. The students were fully engaged and genuinely enjoyed the learning experience.',
    name: 'Srinivas',
    role: 'Principal',
    school: 'ZPH High School Pendurthi',
    location: 'Visakhapatnam District',
  },
  {
    quote:
      'The sessions were very interactive and our students were eager to participate in all the hands-on AI exercises.',
    name: 'Pushpa Latha',
    role: 'Principal',
    school: 'ZPHS Agiripalli',
    location: 'Krishna District',
  },
]

export function StoriesEducatorVoices() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-16 md:py-24">
      <div className="container-wide px-5 md:px-8 lg:px-16">
        <Reveal>
          <div className="max-w-3xl">
            <span className="section-label text-brand">Partner Testimonials</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl text-balance">
              Teachers see the difference too.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
              School leaders and headmasters observe firsthand how students respond when complex
              digital technologies are made approachable, interactive, and bilingual.
            </p>
          </div>
        </Reveal>

        {/* 3 Educator Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {EDUCATORS.map((educator, idx) => (
            <Reveal key={educator.name} delay={idx * 0.08} className="h-full">
              <figure className="group flex h-full flex-col justify-between rounded-2xl border border-border/80 bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-soft-lg">
                <div>
                  <Quote className="size-8 text-brand/25" aria-hidden />
                  <blockquote className="mt-4 font-medium text-foreground text-base leading-relaxed">
                    &quot;{educator.quote}&quot;
                  </blockquote>
                </div>

                <figcaption className="mt-8 border-t border-border/60 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="grid size-9 place-items-center rounded-lg bg-brand/10 text-brand">
                      <School className="size-4.5" />
                    </div>
                    <div>
                      <span className="block font-display text-base font-bold text-foreground">
                        {educator.name}
                      </span>
                      <span className="block text-xs font-semibold text-brand">
                        {educator.role}, {educator.school}
                      </span>
                    </div>
                  </div>
                  <span className="mt-2 block text-[11px] text-muted-foreground">
                    {educator.location}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
