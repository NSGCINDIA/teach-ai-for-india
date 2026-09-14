'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { TestimonialsContent } from '@/app/(public)/content'

/**
 * "Voices from the ground" — one large-format quote at a time, sitting
 * directly on the surface with no card, auto-advancing on an interval that
 * pauses on hover/focus. Deliberately not a card grid: cards make every
 * testimonial section on the internet look the same.
 */
export function Voices({ content }: { content: TestimonialsContent }) {
  const items = content.items
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduce = useReducedMotion()
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    if (paused || reduce || items.length <= 1) return
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % items.length), 6000)
    return () => clearInterval(timerRef.current)
  }, [paused, reduce, items.length])

  if (items.length === 0) return null
  const current = items[index]

  return (
    <section
      className="tai-section bg-[var(--tai-clay)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <p className="tai-eyebrow text-brand">Voices</p>
        <h2 className="tai-text-display mt-4 max-w-4xl font-display text-foreground">
          What the movement sounds like on the ground.
        </h2>

        <div className="tai-reading mx-auto mt-16 min-h-[220px] text-center">
          <AnimatePresence mode="wait">
            <m.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              <p className="font-display text-3xl italic leading-snug text-foreground md:text-4xl lg:text-5xl">
                &ldquo;{current.quote}&rdquo;
              </p>
              <p className="mt-6 text-base text-muted-foreground">
                <span className="font-semibold text-foreground">{current.name}</span> — {current.role}
              </p>
            </m.div>
          </AnimatePresence>
        </div>

        {items.length > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {items.map((t, i) => (
              <button
                key={`${t.name}-${i}`}
                onClick={() => setIndex(i)}
                aria-label={`Show testimonial ${i + 1} of ${items.length}`}
                aria-current={i === index}
                className={cn('h-2 w-2 rounded-full transition-colors', i === index ? 'bg-brand' : 'bg-border')}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
