import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

/** Registers GSAP plugins exactly once, client-side only. */
export function ensureGsapRegistered() {
  if (registered || typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)
  registered = true
}

export { gsap, ScrollTrigger }
