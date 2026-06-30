'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  durationMs?: number
  prefix?: string
  suffix?: string
  className?: string
  /** Format the running value (e.g. add thousands separators). */
  format?: (n: number) => string
}

const defaultFormat = (n: number) => Math.round(n).toLocaleString('en-IN')

/**
 * Animated count-up (PRD §7.1 impact bar). Runs once when scrolled into view,
 * entrance-only (no looping — PRD §12.4), and respects prefers-reduced-motion.
 */
export function AnimatedCounter({
  value,
  durationMs = 1600,
  prefix = '',
  suffix = '',
  className,
  format = defaultFormat,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setDisplay(value)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(value * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, durationMs, reduce])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {format(display)}
      {suffix}
    </span>
  )
}
