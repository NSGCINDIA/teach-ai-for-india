'use client'

import { useEffect, type ReactNode } from 'react'
import Lenis from 'lenis'
import { ensureGsapRegistered, gsap, ScrollTrigger } from '@/lib/gsap'

/**
 * Drives the whole public site's scroll through Lenis for inertia/smoothing,
 * and keeps GSAP ScrollTrigger's measurements in lockstep with it (Lenis moves
 * the scroll position outside the browser's native scroll event timing, so
 * ScrollTrigger needs to be told to re-check on every Lenis tick — the
 * integration pattern from Lenis' own GSAP docs).
 *
 * Skipped entirely under prefers-reduced-motion: native scrolling with the
 * (equally native) scroll-triggered reveals in each section is fully usable
 * without this.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    ensureGsapRegistered()

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const onTick = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    // Ensure ScrollTrigger recalculates after fonts/images load
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 800)

    return () => {
      clearTimeout(refreshTimer)
      lenis.destroy()
      gsap.ticker.remove(onTick)
    }
  }, [])

  return <>{children}</>
}
