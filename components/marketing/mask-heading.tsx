'use client'

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'

interface MaskHeadingProps {
  /** Each entry renders as one clipped line. */
  lines: ReactNode[]
  as?: 'h1' | 'h2' | 'h3'
  className?: string
  lineClassName?: string
  /** Plays on a timer right after mount instead of waiting for scroll (use for the hero — its entrance is timed, not scroll-triggered). */
  immediate?: boolean
  /** Delay in seconds before the reveal starts. */
  delay?: number
}

/**
 * Editorial line-mask headline reveal: each line sits in an overflow-hidden
 * box and rises from below into place, staggered.
 *
 * Fails open by design: the server-rendered/no-JS state is fully visible
 * text (`ready` starts `true`). `useLayoutEffect` flips it to hidden just
 * before the browser paints (so there's no visible flash), then a plain
 * `setTimeout` flips it back to revealed and a CSS `transition` does the
 * actual animation. Nothing here depends on `requestAnimationFrame` ticking —
 * a first pass at this used GSAP tweens driven by rAF, which a backgrounded
 * or otherwise-throttled tab can suspend indefinitely, leaving the heading
 * permanently invisible. `setTimeout` still fires (just less often) in a
 * throttled tab, and once the `transition` is set off, the CSS engine finishes
 * it on the compositor without any further JS involvement.
 */
export function MaskHeading({
  lines,
  as: Tag = 'h2',
  className,
  lineClassName,
  immediate = false,
  delay = 0,
}: MaskHeadingProps) {
  const containerRef = useRef<HTMLHeadingElement>(null)
  const reduce = useReducedMotion()
  const [ready, setReady] = useState(true)

  useLayoutEffect(() => {
    if (reduce) return

    setReady(false)

    if (immediate) {
      const t = setTimeout(() => setReady(true), delay * 1000)
      return () => clearTimeout(t)
    }

    const el = containerRef.current
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
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduce, immediate, delay])

  return (
    <Tag ref={containerRef} className={className}>
      {lines.map((line, i) => (
        <span key={i} className={`tai-mask block${lineClassName ? ` ${lineClassName}` : ''}`}>
          <span
            className="tai-mask-line"
            style={{
              transform: ready ? 'translateY(0%)' : 'translateY(100%)',
              transition: reduce ? 'none' : `transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.12}s`,
            }}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  )
}
