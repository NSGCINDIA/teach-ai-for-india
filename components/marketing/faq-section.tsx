'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'
import { landingContent } from '@/app/(public)/content'

export function FaqSection() {
  const content = landingContent.faq
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section id="faq" className="tai-section relative overflow-hidden bg-background py-16 md:py-24">
      <div className="tai-container px-5 md:px-8 max-w-4xl mx-auto">
        <Reveal>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand bg-brand/10 px-3.5 py-1.5 rounded-full border border-brand/20">
              <HelpCircle className="size-3.5" />
              <span>{content.eyebrow}</span>
            </div>

            <h2 className="mt-4 font-sans text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              {content.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg max-w-2xl mx-auto font-sans">
              {content.subtitle}
            </p>
          </div>
        </Reveal>

        {/* 5 Core Questions Accordion */}
        <div className="mt-12 space-y-4">
          {content.items.map((item, idx) => {
            const isOpen = openIndex === idx
            return (
              <Reveal key={item.id} delay={idx * 0.06}>
                <div
                  className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                    isOpen
                      ? 'border-brand/40 bg-card shadow-sm'
                      : 'border-border bg-card/60 hover:border-border/80'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between p-5 text-left transition-colors sm:p-6"
                  >
                    <span className="font-sans text-base font-semibold text-foreground sm:text-lg pr-4 tracking-normal">
                      {item.question}
                    </span>
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition-transform duration-200 ${
                        isOpen ? 'rotate-180 bg-brand text-white' : ''
                      }`}
                    >
                      <ChevronDown className="size-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-border/60 px-5 pb-6 pt-4 sm:px-6">
                      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              </Reveal>
            )
          })}
        </div>

        {/* Link to Full FAQ */}
        <Reveal delay={0.35}>
          <div className="mt-10 text-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
            >
              Have a different question? Explore all Frequently Asked Questions <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
