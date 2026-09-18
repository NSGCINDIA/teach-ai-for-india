'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { Sparkles, GraduationCap, School } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TestimonialsContent } from '@/app/(public)/content'

/**
 * "Voices from the ground" — Prioritizing authentic student voices from government
 * schools across Telangana and Andhra Pradesh, alongside verified partner school principals.
 */
export function Voices({ content }: { content: TestimonialsContent }) {
  const items = content.items
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduce = useReducedMotion()
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    if (paused || reduce || items.length <= 1) return
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % items.length), 6500)
    return () => clearInterval(timerRef.current)
  }, [paused, reduce, items.length])

  if (items.length === 0) return null
  const current = items[index]
  const isStudent = current.role.toLowerCase().includes('class') || current.role.toLowerCase().includes('student')

  return (
    <section
      id="voices"
      className="tai-section bg-[var(--tai-clay)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.2em] text-brand">
              <Sparkles className="size-4" />
              Authentic ground feedback
            </div>
            <h2 className="tai-text-display mt-3 max-w-4xl font-display text-foreground">
              What the classroom sounds like.
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Unfiltered feedback from the children building their first prompts with NIAT students and the headmasters who host us.
          </p>
        </div>

        <div className="tai-reading mx-auto mt-14 min-h-[260px] text-center">
          <AnimatePresence mode="wait">
            <m.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-foreground shadow-sm">
                {isStudent ? (
                  <>
                    <GraduationCap className="size-3.5 text-brand" />
                    <span>Real Student Voice</span>
                  </>
                ) : (
                  <>
                    <School className="size-3.5 text-brand" />
                    <span>School Leadership</span>
                  </>
                )}
              </div>

              <p className="font-display text-2xl italic leading-snug text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
                &ldquo;{current.quote}&rdquo;
              </p>

              <div className="mt-6 flex flex-col items-center">
                <span className="text-lg font-bold text-foreground">{current.name}</span>
                <span className="font-mono text-sm text-muted-foreground">{current.role}</span>
              </div>
            </m.div>
          </AnimatePresence>
        </div>

        {items.length > 1 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {items.map((t, i) => (
              <button
                key={`${t.name}-${i}`}
                onClick={() => setIndex(i)}
                aria-label={`Show testimonial from ${t.name}`}
                aria-current={i === index}
                className={cn(
                  'group flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all',
                  i === index
                    ? 'bg-brand text-white shadow-sm ring-2 ring-brand/30'
                    : 'bg-background/60 text-muted-foreground hover:bg-background hover:text-foreground'
                )}
              >
                <span>{t.name}</span>
                <span className="text-[10px] opacity-75 hidden sm:inline">({t.role.split(',')[0]})</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
