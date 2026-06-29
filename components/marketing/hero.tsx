'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { HeroContent } from '@/app/(public)/content'

/** Full-viewport home hero — headline, sub, and the two primary CTAs. */
export function Hero({ content }: { content: HeroContent }) {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
  }

  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden">
      {/* Background flourishes */}
      <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand/20 via-brand-teal/10 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 size-96 translate-x-1/3 translate-y-1/3 rounded-full bg-brand-orange/10 blur-3xl"
      />

      <div className="container-wide relative px-5 py-20 md:px-8 lg:px-16">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {content.eyebrow && (
            <motion.p
              variants={item}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground shadow-soft backdrop-blur"
            >
              <span className="size-1.5 rounded-full bg-brand-teal" aria-hidden />
              {content.eyebrow}
            </motion.p>
          )}

          <motion.h1
            variants={item}
            className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="text-gradient-brand">{content.headline}</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg md:text-xl"
          >
            {content.subheadline}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg" className="w-full bg-brand text-white hover:bg-brand/90 sm:w-auto">
              <Link href="/impact">
                <BarChart3 className="size-4" aria-hidden />
                See our impact
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="group w-full sm:w-auto">
              <Link href="/join">
                Join the movement
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
