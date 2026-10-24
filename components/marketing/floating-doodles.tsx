'use client'

import React, { useEffect, useRef, useState, type CSSProperties } from 'react'
import { usePathname } from 'next/navigation'

/**
 * The hand-drawn doodle icons from the site's original floating background
 * layer, brought back at the founding team's request (they specifically
 * preferred these over a plain unicode-emoji layer) and recolored to the new
 * warm editorial palette (crimson / terracotta / saffron / forest) instead of
 * the old maroon/orange/teal brand colors.
 */
export function RobotDoodle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M 50 30 L 50 15" />
      <circle cx="50" cy="12" r="4" fill="currentColor" className="opacity-30" />
      <path d="M 25 30 C 40 28, 60 32, 75 30 C 78 45, 76 60, 75 75 C 60 77, 40 73, 25 75 C 22 60, 24 45, 25 30 Z" />
      <circle cx="38" cy="48" r="3.5" fill="currentColor" />
      <circle cx="62" cy="48" r="3.5" fill="currentColor" />
      <path d="M 38 62 C 45 66, 55 66, 62 62" />
      <path d="M 25 45 C 20 45, 20 55, 25 55" />
      <path d="M 75 45 C 80 45, 80 55, 75 55" />
    </svg>
  )
}

export function RocketDoodle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M 50 15 C 65 30, 65 60, 60 75 C 50 78, 50 78, 40 75 C 35 60, 35 30, 50 15 Z" />
      <path d="M 43 32 C 50 34, 57 32, 57 32" />
      <path d="M 40 68 L 28 78 C 28 70, 32 62, 38 60" />
      <path d="M 60 68 L 72 78 C 72 70, 68 62, 62 60" />
      <circle cx="50" cy="48" r="6" />
      <path d="M 45 78 C 42 85, 48 92, 50 95 C 52 92, 58 85, 55 78" />
      <path d="M 48 78 L 47 88" />
      <path d="M 52 78 L 53 88" />
    </svg>
  )
}

export function LightbulbDoodle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M 35 60 C 25 50, 25 30, 50 20 C 75 30, 75 50, 65 60 C 62 68, 62 70, 60 75 L 40 75 C 38 70, 38 68, 35 60 Z" />
      <path d="M 40 75 C 45 77, 55 77, 60 75" />
      <path d="M 42 79 C 46 81, 54 81, 58 79" />
      <path d="M 45 83 C 48 85, 52 85, 55 83" />
      <circle cx="50" cy="38" r="3" fill="currentColor" />
      <circle cx="40" cy="48" r="3" fill="currentColor" />
      <circle cx="60" cy="48" r="3" fill="currentColor" />
      <path d="M 50 38 L 40 48 M 50 38 L 60 48 M 40 48 L 50 56 M 60 48 L 50 56" />
      <path d="M 50 56 L 50 68" />
      <path d="M 50 12 L 50 6" />
      <path d="M 23 28 L 18 24" />
      <path d="M 77 28 L 82 24" />
    </svg>
  )
}

export function OpenBookDoodle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M 50 35 L 50 75" strokeWidth={2} />
      <path d="M 50 35 C 40 30, 25 32, 15 38 L 15 72 C 25 66, 40 64, 50 69 Z" />
      <path d="M 15 38 C 25 32, 40 30, 50 35" />
      <path d="M 50 35 C 60 30, 75 32, 85 38 L 85 72 C 75 66, 60 64, 50 69 Z" />
      <path d="M 15 72 L 15 75 C 25 69, 40 67, 50 72 C 60 67, 75 69, 85 75 L 85 72" />
      <path d="M 35 22 L 41 22 M 38 19 L 38 25" strokeWidth={1.2} />
      <path d="M 60 20 L 66 26 M 66 20 L 60 26" strokeWidth={1.2} />
    </svg>
  )
}

export function GraduationCapDoodle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M 50 25 L 85 37 L 50 49 L 15 37 Z" />
      <path d="M 50 28 L 80 37 L 50 46 L 20 37 Z" strokeWidth={1} strokeDasharray="2 2" />
      <path d="M 30 43 L 30 55 C 30 65, 70 65, 70 55 L 70 43" />
      <path d="M 50 37 L 78 45 L 80 58" />
      <circle cx="80" cy="60" r="2" fill="currentColor" />
    </svg>
  )
}

export function AtomDoodle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M 50 10 C 80 20, 80 80, 50 90 C 20 80, 20 20, 50 10 Z" transform="rotate(30 50 50)" />
      <path d="M 50 10 C 80 20, 80 80, 50 90 C 20 80, 20 20, 50 10 Z" transform="rotate(150 50 50)" />
      <circle cx="50" cy="50" r="6" fill="currentColor" className="opacity-60" />
      <path d="M 46 48 C 48 45, 52 45, 54 48 C 55 51, 52 55, 49 53 Z" strokeWidth={1} />
    </svg>
  )
}

export function SparklesDoodle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M 50 15 L 53 35 L 75 38 L 55 45 L 60 65 L 50 50 L 40 65 L 45 45 L 25 38 L 47 35 Z" fill="currentColor" className="opacity-20" />
      <path d="M 80 60 L 82 66 L 88 68 L 82 70 L 80 76 L 78 70 L 72 68 L 78 66 Z" />
      <path d="M 20 20 L 21 24 L 25 25 L 21 26 L 20 30 L 19 26 L 15 25 L 19 24 Z" />
    </svg>
  )
}

export function NeuralNodeDoodle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="30" cy="50" r="5" fill="currentColor" className="opacity-40" />
      <circle cx="55" cy="30" r="4" fill="currentColor" className="opacity-40" />
      <circle cx="50" cy="70" r="6" fill="currentColor" className="opacity-40" />
      <circle cx="75" cy="45" r="4" fill="currentColor" className="opacity-40" />
      <path d="M 36 47 L 49 33" strokeDasharray="3 3" />
      <path d="M 36 53 L 44 64" strokeDasharray="3 3" />
      <path d="M 54 35 L 71 42" strokeDasharray="3 3" />
      <path d="M 50 63 L 71 48" strokeDasharray="3 3" />
      <path d="M 52 35 L 50 63" strokeDasharray="3 3" />
    </svg>
  )
}

export function BlackboardDoodle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M 15 80 L 85 80" />
      <path d="M 20 15 L 20 85" />
      <path d="M 81 77 L 85 80 L 81 83" />
      <path d="M 17 19 L 20 15 L 23 19" />
      <path d="M 20 70 Q 35 30, 50 50 T 80 30" strokeWidth={2} />
      <path d="M 60 60 L 68 60 M 64 56 L 64 64" strokeWidth={1.2} />
      <path d="M 72 60 L 78 60" strokeWidth={1.2} />
      <path d="M 52 18 L 62 18 L 56 24 L 62 30 L 52 30" strokeWidth={1.2} />
    </svg>
  )
}

export function GlobeDoodle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="50" cy="50" r="32" />
      <path d="M 18 50 C 30 58, 70 58, 82 50" />
      <path d="M 19 42 C 30 32, 70 32, 81 42" />
      <path d="M 50 18 C 40 30, 40 70, 50 82" />
      <path d="M 50 18 C 60 30, 60 70, 50 82" />
      <path d="M 50 82 L 50 92 M 35 92 L 65 92" strokeWidth={2} />
      <path d="M 78 38 C 84 52, 72 76, 50 82" />
    </svg>
  )
}

function depth(px: number): CSSProperties {
  return {
    transform: `translate3d(calc(var(--bg-x, 0) * ${px}px), calc(var(--bg-y, 0) * ${px}px), 0)`,
  }
}

/**
 * Site-wide ambient background — ten hand-drawn classroom doodles drifting
 * gently in the outer gutters.
 *
 * Guaranteed text safety:
 * - Positioned strictly in the outer side gutters (left/right gutters outside max-w-6xl).
 * - Hidden on narrower screens (< 1280px / xl) so they NEVER overlap reading text or paragraphs.
 * - Layered at z-[2] (below main's relative z-10) with pointer-events-none select-none.
 * - On the homepage, activates when reaching "Our Mission" and persists all the way down to the footer.
 */
export function FloatingDoodles() {
  const [mounted, setMounted] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [inScope, setInScope] = useState(!isHome)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (!isHome) {
      setInScope(true)
      return
    }

    // On the homepage, activate doodles strictly starting from "Our Mission" (#scene-mission) down to footer
    const handleScroll = () => {
      const missionEl = document.getElementById('scene-mission')
      if (missionEl) {
        const rect = missionEl.getBoundingClientRect()
        // When mission section enters the viewport or has already been passed
        setInScope(rect.top <= window.innerHeight * 0.8)
      } else {
        // Fallback: entrance is approx 200vh
        setInScope(window.scrollY >= window.innerHeight * 1.2)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mounted, isHome, pathname])

  useEffect(() => {
    if (!mounted) return
    const root = rootRef.current
    if (!root) return

    if (
      !window.matchMedia('(pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let raf = 0

    const step = () => {
      currentX += (targetX - currentX) * 0.1
      currentY += (targetY - currentY) * 0.1
      root.style.setProperty('--bg-x', currentX.toFixed(4))
      root.style.setProperty('--bg-y', currentY.toFixed(4))
      raf =
        Math.abs(targetX - currentX) > 0.0005 || Math.abs(targetY - currentY) > 0.0005
          ? requestAnimationFrame(step)
          : 0
    }

    const handlePointerMove = (e: PointerEvent) => {
      targetX = e.clientX / window.innerWidth - 0.5
      targetY = e.clientY / window.innerHeight - 0.5
      if (!raf) raf = requestAnimationFrame(step)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [mounted])

  if (!mounted) {
    return null
  }

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={`deco-layer pointer-events-none fixed inset-0 z-[2] select-none overflow-hidden contain-layout contain-paint contain-style transition-opacity duration-700 ${
        inScope ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* ─── LEFT OUTER GUTTER (Strictly in the outer margin, outside text columns) ─── */}
      <div className="absolute top-[10%] left-3 xl:left-6 2xl:left-12 hidden xl:block" style={depth(-8)}>
        <div className="animate-float-slow">
          <RobotDoodle className="size-10 text-[#9E2A2B]/30 xl:size-12 2xl:size-14" />
        </div>
      </div>
      <div className="absolute top-[28%] left-2.5 xl:left-5 2xl:left-10 hidden xl:block" style={depth(-12)}>
        <div className="animate-float">
          <LightbulbDoodle className="size-10 text-[#E09F3E]/35 xl:size-12 2xl:size-14" />
        </div>
      </div>
      <div className="absolute top-[48%] left-3 xl:left-6 2xl:left-12 hidden xl:block" style={depth(-10)}>
        <div className="animate-float-slow">
          <OpenBookDoodle className="size-10 text-[#2D5A27]/30 xl:size-12 2xl:size-14" />
        </div>
      </div>
      <div className="absolute top-[68%] left-2.5 xl:left-5 2xl:left-10 hidden xl:block" style={depth(-7)}>
        <div className="animate-float">
          <NeuralNodeDoodle className="size-10 text-[#1D3557]/30 xl:size-12 2xl:size-14" />
        </div>
      </div>
      <div className="absolute top-[86%] left-3 xl:left-6 2xl:left-12 hidden xl:block" style={depth(-9)}>
        <div className="animate-float-slow">
          <GraduationCapDoodle className="size-10 text-[#9E2A2B]/30 xl:size-12 2xl:size-14" />
        </div>
      </div>

      {/* ─── RIGHT OUTER GUTTER (Strictly in the outer margin, outside text columns) ─── */}
      <div className="absolute top-[14%] right-3 xl:right-6 2xl:right-12 hidden xl:block" style={depth(-6)}>
        <div className="animate-spin-slow">
          <RocketDoodle className="size-10 text-[#E09F3E]/35 xl:size-12 2xl:size-14" />
        </div>
      </div>
      <div className="absolute top-[34%] right-2.5 xl:right-5 2xl:right-10 hidden xl:block" style={depth(-14)}>
        <div className="animate-pulse-slow">
          <AtomDoodle className="size-10 text-[#2D5A27]/30 xl:size-12 2xl:size-14" />
        </div>
      </div>
      <div className="absolute top-[54%] right-3 xl:right-6 2xl:right-12 hidden xl:block" style={depth(-11)}>
        <div className="animate-float-slow">
          <SparklesDoodle className="size-8 text-[#E09F3E]/40 xl:size-10 2xl:size-12" />
        </div>
      </div>
      <div className="absolute top-[72%] right-2.5 xl:right-5 2xl:right-10 hidden xl:block" style={depth(-8)}>
        <div className="animate-float">
          <BlackboardDoodle className="size-10 text-[#9E2A2B]/30 xl:size-12 2xl:size-14" />
        </div>
      </div>
      <div className="absolute top-[88%] right-3 xl:right-6 2xl:right-12 hidden xl:block" style={depth(-7)}>
        <div className="animate-float-slow">
          <GlobeDoodle className="size-10 text-[#1D3557]/30 xl:size-12 2xl:size-14" />
        </div>
      </div>
    </div>
  )
}
