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
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const onTick = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(onTick)
    }
  }, [])

  return <>{children}</>
}
