'use client'

import { useLayoutEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * The hero's signature element: a two-ring ink-stamp mark, like the
 * "verified" stamp a real session report gets once it's checked — this
 * org's own workflow already has a literal `verified` session status, so the
 * motif isn't decoration borrowed from elsewhere, it's what this org actually
 * does. Fails open (settled/visible by default); JS only adds a brief
 * "pressing down" flourish — an oversized, rotated, faded starting state that
 * settles to its final mark, via a plain CSS transition, not GSAP/rAF.
 */
export function StampBadge({ className, tone = 'crimson' }: { className?: string; tone?: 'crimson' | 'light' }) {
  const reduce = useReducedMotion()
  const [ready, setReady] = useState(true)
  const ringColor = tone === 'light' ? 'var(--tai-linen)' : 'var(--tai-crimson)'

  useLayoutEffect(() => {
    if (reduce) return
    setReady(false)
    const t = setTimeout(() => setReady(true), 650)
    return () => clearTimeout(t)
  }, [reduce])

  return (
    <div
      aria-hidden
      className={`pointer-events-none select-none ${className ?? ''}`}
      style={{
        transform: ready ? 'rotate(-9deg) scale(1)' : 'rotate(-24deg) scale(1.4)',
        opacity: ready ? 1 : 0,
        transition: reduce ? 'none' : 'transform 0.65s cubic-bezier(0.34, 1.45, 0.64, 1), opacity 0.35s ease',
      }}
    >
      <div className="grid size-[96px] place-items-center rounded-full border-[1.5px]" style={{ borderColor: `color-mix(in srgb, ${ringColor} 70%, transparent)` }}>
        <div className="grid size-[78px] place-items-center rounded-full border" style={{ borderColor: `color-mix(in srgb, ${ringColor} 45%, transparent)` }}>
          <span
            className="text-center font-mono text-[8.5px] font-semibold uppercase leading-tight tracking-[0.16em]"
            style={{ color: `color-mix(in srgb, ${ringColor} 85%, transparent)` }}
          >
            Verified
            <br />
            session
          </span>
        </div>
      </div>
    </div>
  )
}
