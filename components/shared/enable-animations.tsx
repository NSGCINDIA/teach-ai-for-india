'use client'

import { useEffect } from 'react'

/**
 * Releases the decorative animation loops (see `.deco-layer` in globals.css) by
 * putting `anim-ready` on <html> once the browser has nothing more urgent to do.
 *
 * Until then those animations sit paused at their first keyframe, so they don't
 * spend style-recalc and layout on every frame while React is hydrating. Nothing
 * about the page's appearance depends on this class — the worst case if it never
 * runs is a static background.
 */
export function EnableAnimations() {
  useEffect(() => {
    const release = () => document.documentElement.classList.add('anim-ready')

    // requestIdleCallback only reached Safari in 17.4, so keep a timer fallback.
    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(release, { timeout: 3000 })
      return () => window.cancelIdleCallback(handle)
    }
    const handle = window.setTimeout(release, 1200)
    return () => window.clearTimeout(handle)
  }, [])

  return null
}
