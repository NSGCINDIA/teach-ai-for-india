'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface HeroMoment {
  src: string
  alt: string
  title: string
  subtitle: string
}

/**
 * The hero's visual centerpiece: real session photos slow-crossfading with a
 * gentle zoom, captioned per-frame ("Fig. 01 — ..."), with small dot
 * indicators. Fails open — the first photo renders fully visible with no JS
 * dependency; the rotation is a progressive enhancement, not a requirement.
 * Auto-advances, pausing on hover/focus (same convention as `Voices`).
 */
export function HeroPhotoSequence({
  moments,
  aspectClassName = 'aspect-[4/5] lg:aspect-[16/12]',
  className,
}: {
  moments: HeroMoment[]
  aspectClassName?: string
  className?: string
}) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce || paused || moments.length <= 1) return
    const t = setInterval(() => setIndex((i) => (i + 1) % moments.length), 4500)
    return () => clearInterval(t)
  }, [reduce, paused, moments.length])

  const active = moments[index]

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className={cn('relative overflow-hidden', aspectClassName, className)}>
        {moments.map((m, i) => (
          <div
            key={m.src}
            aria-hidden={i !== index}
            className="absolute inset-0"
            style={{ opacity: i === index ? 1 : 0, transition: reduce ? 'none' : 'opacity 1s ease' }}
          >
            <Image
              src={m.src}
              alt={m.alt}
              fill
              priority={i === 0}
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
              style={{
                transform: i === index && !reduce ? 'scale(1.06)' : 'scale(1)',
                transition: reduce ? 'none' : 'transform 5s linear',
              }}
            />
          </div>
        ))}

        {moments.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/35 px-2 py-1.5 backdrop-blur-sm">
            {moments.map((m, i) => (
              <button
                key={m.src}
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1} of ${moments.length}`}
                aria-current={i === index}
                className={cn('size-1.5 rounded-full transition-colors', i === index ? 'bg-white' : 'bg-white/45 hover:bg-white/70')}
              />
            ))}
          </div>
        )}
      </div>

      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
        Fig. {String(index + 1).padStart(2, '0')} — {active.title}, {active.subtitle}
      </p>
    </div>
  )
}
