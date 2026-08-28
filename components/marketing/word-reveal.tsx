'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * Word-by-word reveal, staggered as the section scrolls into view — used
 * once per page, for the single dark "statement" section (The Tension /
 * The Invitation). Reads like the text is being spoken, and forces a slower
 * read of the one sentence the page most wants remembered.
 *
 * Fails open: starts fully visible (`ready = true`) so the no-JS/SSR state is
 * the complete sentence, not a wall of dimmed words. `useLayoutEffect` dims it
 * pre-paint, then an `IntersectionObserver` restores it via a staggered CSS
 * transition once the section scrolls into view — no GSAP/ScrollTrigger, so
 * nothing here depends on requestAnimationFrame still ticking in a throttled
 * background tab.
 */
export function WordReveal({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
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
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduce])

  const words = text.split(' ')

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            opacity: ready ? 1 : 0.15,
            transition: reduce ? 'none' : `opacity 0.4s ease ${i * 0.045}s`,
          }}
        >
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  )
}
