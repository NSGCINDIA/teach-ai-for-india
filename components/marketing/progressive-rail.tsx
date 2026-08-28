'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * The vertical "drawing" line behind the operating-loop steps.
 *
 * Fails open: the settled default is a fully-drawn bar (`height: 100%`), so a
 * stalled/throttled JS environment leaves a complete rail rather than one
 * stuck at 0%. `useLayoutEffect` sets it to 0% pre-paint, then an
 * `IntersectionObserver` triggers a plain CSS transition back to 100% once
 * the loop scrolls into view — no GSAP/ScrollTrigger scrub.
 */
export function ProgressiveRail({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [ready, setReady] = useState(true)

  useLayoutEffect(() => {
    if (reduce) return
    setReady(false)

    const el = wrapRef.current
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
      { threshold: 0.1 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduce])

  return (
    <div ref={wrapRef} className={cn('absolute top-0 bottom-0 w-px bg-border', className)} aria-hidden>
      <div
        className="w-px bg-[var(--tai-crimson)]"
        style={{
          height: ready ? '100%' : '0%',
          transition: reduce ? 'none' : 'height 1.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </div>
  )
}
