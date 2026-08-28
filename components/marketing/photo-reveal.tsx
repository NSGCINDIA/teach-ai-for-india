'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PhotoRevealProps {
  src: string
  alt: string
  caption?: string
  aspectClassName?: string
  sizes?: string
  priority?: boolean
  className?: string
}

/**
 * Documentary photo with a subtle scale-in on scroll (1.03 → 1.00).
 *
 * Fails open like `MaskHeading`/`WordReveal`: the settled state (`scale(1)`,
 * full opacity) is the default, so a stalled or throttled JS environment
 * never leaves a photo stuck zoomed-in or dim. `useLayoutEffect` briefly sets
 * the "about to reveal" state pre-paint, then an `IntersectionObserver`
 * triggers a plain CSS transition back to settled — no GSAP, no rAF loop.
 */
export function PhotoReveal({
  src,
  alt,
  caption,
  aspectClassName = 'aspect-[4/3]',
  sizes = '(max-width: 1024px) 100vw, 50vw',
  priority = false,
  className,
}: PhotoRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [ready, setReady] = useState(true)

  useLayoutEffect(() => {
    if (reduce) return
    setReady(false)

    const el = ref.current
    if (!el) {
      setReady(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true)
          io.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduce])

  return (
    <div
      ref={ref}
      className={cn('relative overflow-hidden', aspectClassName, className)}
      style={{
        opacity: ready ? 1 : 0.85,
        transform: ready ? 'scale(1)' : 'scale(1.03)',
        transition: reduce ? 'none' : 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.9s ease',
      }}
    >
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      {caption && (
        <div className="absolute bottom-4 left-4 rounded-full bg-black/55 px-3.5 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm">
          {caption}
        </div>
      )}
    </div>
  )
}
