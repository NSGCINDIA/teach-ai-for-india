'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { m, AnimatePresence } from 'framer-motion'
import { ArrowRight, BarChart3, Users, GraduationCap, MapPin, CheckCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { HeroContent } from '@/app/(public)/content'

const HERO_WORDS = ["applied AI literacy", "hands-on coding", "prompt engineering", "creative technology"] as const

export function Hero({ content }: { content: HeroContent }) {
  const [index, setIndex] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  // Rotate the headline word only while the hero is actually on screen and the
  // tab is in the foreground. Otherwise this ticks a re-render of the whole
  // hero every 3s for as long as the page is open, from the footer of a long
  // scroll or a background tab.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let timer: ReturnType<typeof setInterval> | undefined
    let onScreen = false

    const sync = () => {
      const shouldRun = onScreen && document.visibilityState === 'visible'
      if (shouldRun && !timer) {
        timer = setInterval(() => {
          setIndex((prev) => (prev + 1) % HERO_WORDS.length)
        }, 3000)
      } else if (!shouldRun && timer) {
        clearInterval(timer)
        timer = undefined
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      sync()
    })
    observer.observe(section)
    document.addEventListener('visibilitychange', sync)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
      if (timer) clearInterval(timer)
    }
  }, [])

  // Mouse tilt + spotlight for the 3D card. Both are written straight to the
  // card's own style as CSS variables inside a rAF, so dragging the pointer
  // across the mockup never re-renders this (large, motion-heavy) subtree.
  const cardRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef(0)
  const pendingRef = useRef<{ rotX: number; rotY: number; gx: number; gy: number } | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  const flush = useCallback(() => {
    frameRef.current = 0
    const card = cardRef.current
    const next = pendingRef.current
    if (!card || !next) return
    card.style.setProperty('--tilt-x', `${next.rotX.toFixed(2)}deg`)
    card.style.setProperty('--tilt-y', `${next.rotY.toFixed(2)}deg`)
    card.style.setProperty('--glow-x', `${next.gx.toFixed(2)}%`)
    card.style.setProperty('--glow-y', `${next.gy.toFixed(2)}%`)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current
      if (!card) return
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      pendingRef.current = {
        // Perspective calculation
        rotX: -(y - rect.height / 2) / 16,
        rotY: (x - rect.width / 2) / 16,
        // Glow position
        gx: (x / rect.width) * 100,
        gy: (y / rect.height) * 100,
      }
      if (!frameRef.current) frameRef.current = requestAnimationFrame(flush)
    },
    [flush],
  )

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    const card = cardRef.current
    if (card) {
      card.style.setProperty('--tilt-x', '0deg')
      card.style.setProperty('--tilt-y', '0deg')
    }
  }

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
  }, [])

  const item = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 20 } },
  }

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  }

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden py-16 lg:py-24 bg-transparent"
    >
      {/* Background dot grid flourish */}
      <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid opacity-30 dark:opacity-15" />
      
      {/* Structural layout grid lines */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

      {/* Futuristic digital wireframe overlays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <svg className="absolute top-0 right-0 w-1/2 h-full stroke-muted-foreground/10 opacity-20 dark:opacity-10" fill="none" viewBox="0 0 400 800">
          <path d="M0,80 L400,160 M0,240 L400,320 M0,480 L400,400 M0,640 L400,580" strokeWidth="1" />
          <path d="M120,0 L220,800 M280,0 L320,800" strokeWidth="1" />
        </svg>
      </div>

      {/* NIAT Multi-Tone Ambient Light Blobs (Maroon Red & Gold/Amber).
          Soft-stop radial gradients on a translate-only CSS keyframe. The
          previous pair animated `scale` on a `blur(130px)` layer, which makes
          the browser re-run the blur every frame for the life of the page —
          the most expensive thing on this route in Gecko and WebKit. Pure
          translate stays on the compositor and never repaints. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-64 left-[15%] size-[52rem] rounded-full animate-drift-a"
        style={{
          background:
            'radial-gradient(closest-side, rgba(136,19,55,0.09), rgba(255,178,24,0.06) 48%, transparent 72%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 right-[15%] size-[46rem] rounded-full animate-drift-b"
        style={{
          background:
            'radial-gradient(closest-side, rgba(255,178,24,0.075), rgba(136,19,55,0.05) 48%, transparent 72%)',
        }}
      />

      <div className="container-wide relative px-5 md:px-8 lg:px-12 z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-center">
          
          {/* ── LEFT COLUMN: Text Copy, Teaser Capsule, Trust Badges ── */}
          <m.div
            className="lg:col-span-7 flex flex-col items-start text-left"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {content.eyebrow && (
              <m.div variants={item}>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#881337]/30 bg-gradient-to-r from-[#881337]/10 via-[#ffb218]/15 to-transparent px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#881337] shadow-soft backdrop-blur-md dark:text-[#ffb218]">
                  <Sparkles className="size-3.5 animate-pulse text-[#881337] dark:text-[#ffb218]" />
                  {content.eyebrow}
                </span>
              </m.div>
            )}

            <m.h1
              variants={item}
              className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl xl:text-7.5xl text-foreground"
            >
              Building India's first <br />
              student-led <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#881337] via-[#be123c] to-[#ffb218]">
                AI education movement
              </span>
            </m.h1>

            <m.p
              variants={item}
              className="mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed min-h-[56px]"
            >
              We bring{' '}
              <span className="text-foreground font-semibold inline-block min-w-[170px] text-left">
                <AnimatePresence mode="wait">
                  <m.span
                    key={HERO_WORDS[index]}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="inline-block text-[#881337] dark:text-[#ffb218] font-bold border-b border-[#881337]/30 dark:border-[#ffb218]/30 pb-0.5"
                  >
                    {HERO_WORDS[index]}
                  </m.span>
                </AnimatePresence>
              </span>{' '}
              to government school classrooms across Telangana & Andhra Pradesh—run entirely by college student volunteers.
            </m.p>

            {/* Email Capsule with Shifting Gradient Border Beam */}
            <m.div variants={item} className="mt-8 w-full max-w-md relative group">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#881337] via-[#be123c] to-[#ffb218] opacity-30 blur group-hover:opacity-75 transition duration-500" />
              
              <div className="relative p-1.5 w-full bg-background dark:bg-card/90 backdrop-blur-md rounded-full border border-border/80 flex items-center justify-between shadow-soft-lg transition-all duration-300">
                <input
                  type="email"
                  placeholder="Enter your email to volunteer..."
                  className="bg-transparent pl-5 pr-2 py-2.5 text-sm w-full outline-none border-none text-foreground placeholder:text-muted-foreground/75 font-medium"
                />
                <Button asChild size="sm" className="bg-[#881337] text-white hover:bg-[#701a28] rounded-full px-6 py-2.5 whitespace-nowrap font-bold shadow-md shadow-rose-950/25 transition-all active:scale-95">
                  <Link href="/join">Apply Now</Link>
                </Button>
              </div>
            </m.div>

            {/* Floating Trust Indicators */}
            <m.div
              variants={item}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-bold text-muted-foreground/80 uppercase tracking-wider cursor-default"
            >
              <div className="flex items-center gap-1.5 hover:text-[#881337] transition-colors">
                <CheckCircle className="size-4.5 text-[#881337]" />
                <span>100% Student Led</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-[#ffb218] transition-colors">
                <CheckCircle className="size-4.5 text-[#ffb218]" />
                <span>Telangana & AP</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-[#16a34a] transition-colors">
                <CheckCircle className="size-4.5 text-[#16a34a]" />
                <span>9 Campuses</span>
              </div>
            </m.div>

            <m.div
              variants={item}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Button asChild size="lg" className="bg-[#881337] text-white hover:bg-[#701a28] rounded-full px-7 shadow-lg shadow-rose-950/25 transition-all hover:translate-y-[-2px] active:translate-y-0 font-bold">
                <Link href="/impact">
                  <BarChart3 className="size-4 mr-2" aria-hidden />
                  See our impact
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="group rounded-full px-7 border-slate-300 dark:border-slate-700 hover:bg-rose-50/50 dark:hover:bg-slate-900 hover:border-[#881337] transition-all hover:translate-y-[-2px] active:translate-y-0 font-semibold">
                <Link href="/join">
                  Join the movement
                  <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1 text-[#881337]" aria-hidden />
                </Link>
              </Button>
            </m.div>
          </m.div>

          {/* ── RIGHT COLUMN: Browser Mockup with 3D Hover/Tilt + Interactive Glow Spotlight ── */}
          <m.div
            className="lg:col-span-5 relative w-full flex items-center justify-center pt-8 lg:pt-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, type: 'spring', stiffness: 80 }}
          >
            {/* macOS Browser Mockup Wrapper with mouse tilt */}
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{
                transform:
                  'perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))',
                transformStyle: 'preserve-3d',
                transition: isHovered ? 'none' : 'transform 0.5s ease',
              }}
              className="relative w-full aspect-[4/3] rounded-2xl bg-card border border-border shadow-2xl overflow-hidden hover:shadow-soft-2xl transition-shadow group cursor-pointer duration-300 z-10"
            >
              {/* Spotlight overlay effect */}
              {isHovered && (
                <div
                  className="absolute pointer-events-none inset-0 z-30 transition-opacity duration-300 opacity-60"
                  style={{
                    background:
                      'radial-gradient(circle 200px at var(--glow-x, 50%) var(--glow-y, 50%), color-mix(in srgb, var(--brand-teal) 15%, transparent), transparent)',
                  }}
                />
              )}

              {/* macOS Header Bar */}
              <div className="flex items-center h-10 px-4 bg-muted/80 dark:bg-muted/30 border-b border-border select-none z-10 relative">
                {/* Control Dots */}
                <div className="flex gap-1.5 mr-6">
                  <div className="size-3 rounded-full bg-[#ff5f56]" />
                  <div className="size-3 rounded-full bg-[#ffbd2e]" />
                  <div className="size-3 rounded-full bg-[#27c93f]" />
                </div>
                {/* Simulated URL bar */}
                <div className="flex-1 max-w-[280px] h-6 bg-background rounded border border-border/80 text-[10px] text-muted-foreground/80 flex items-center justify-center font-mono">
                  teachaiforindia.org/schools
                </div>
              </div>

              {/* Classroom Photo Canvas */}
              <div className="relative w-full h-[calc(100%-2.5rem)] overflow-hidden bg-[#fafafa] z-0">
                <Image
                  src="https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1200/v1784177864/WhatsApp_Image_2026-04-18_at_14.46.43_vtswq0.jpg"
                  alt="Teach AI for India volunteers conducting a hands-on AI workshop in a government school classroom"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                
                {/* Interactive Status Indicator Overlay */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3.5 py-1.5 text-[11px] font-bold text-white flex items-center gap-2 shadow z-10">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-teal"></span>
                  </span>
                  Classroom Session Active
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/25 pointer-events-none" />
              </div>
            </div>

            {/* FLOATING CARD 1: 500+ Student Volunteers */}
            <m.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.08, zIndex: 50 }}
              className="absolute -top-4 -left-4 md:-left-8 bg-white/95 dark:bg-card/95 backdrop-blur-md border border-border/80 shadow-xl rounded-2xl p-4 flex items-center gap-3 hover:shadow-2xl transition-all duration-300 z-20 cursor-default select-none group/card"
            >
              <div className="grid size-10 place-items-center rounded-xl bg-brand-orange/15 text-brand-orange group-hover/card:bg-brand-orange group-hover/card:text-white transition-all duration-300">
                <Users className="size-5" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-[15px] font-extrabold text-foreground">500+ Volunteers</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Across Colleges</p>
              </div>
            </m.div>

            {/* FLOATING CARD 2: 5,000+ Impacted */}
            <m.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.08, zIndex: 50 }}
              className="absolute -bottom-6 right-2 bg-white/95 dark:bg-card/95 backdrop-blur-md border border-border/80 shadow-xl rounded-2xl p-4 flex items-center gap-3 hover:shadow-2xl transition-all duration-300 z-20 cursor-default select-none group/card"
            >
              <div className="grid size-10 place-items-center rounded-xl bg-brand-teal/15 text-brand-teal group-hover/card:bg-brand-teal group-hover/card:text-white transition-all duration-300">
                <GraduationCap className="size-5" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-[15px] font-extrabold text-foreground">5,000+ Students</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AI Literacy Enabled</p>
              </div>
            </m.div>

            {/* FLOATING CARD 3: 9 Active Campuses */}
            <m.div
              animate={{ x: [-8, 8, -8] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.08, zIndex: 50 }}
              className="absolute top-1/2 -right-4 lg:-right-8 -translate-y-1/2 bg-white/95 dark:bg-card/95 backdrop-blur-md border border-border/80 shadow-xl rounded-2xl p-3.5 flex items-center gap-2.5 hover:shadow-2xl transition-all duration-300 z-20 cursor-default select-none group/card"
            >
              <div className="grid size-9 place-items-center rounded-xl bg-brand/10 text-brand group-hover/card:bg-brand group-hover/card:text-white transition-all duration-300">
                <MapPin className="size-4.5" />
              </div>
              <div className="text-left leading-tight pr-1">
                <p className="text-[14px] font-extrabold text-foreground">9 Campuses</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">On the Ground</p>
              </div>
            </m.div>

          </m.div>

        </div>
      </div>
    </section>
  )
}

