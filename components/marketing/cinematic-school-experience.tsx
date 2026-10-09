'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import {
  ChevronDown,
  Sparkles,
  School,
} from 'lucide-react'

export function CinematicSchoolExperience() {
  const containerRef = useRef<HTMLDivElement>(null)

  const [progress, setProgress] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Target and current progress for smooth 60fps lerping
  const targetProgressRef = useRef(0)
  const currentProgressRef = useRef(0)
  const rafIdRef = useRef<number | null>(null)

  // ─── Track Mouse for Subtle Parallax ───────────────────────────────────────
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 16
    const y = (e.clientY / window.innerHeight - 0.5) * 16
    setMousePos({ x, y })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  // ─── Smooth 2-Scroll Progress Tracking (Lerped 60fps) ─────────────────────
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const totalScrollable = containerRef.current.offsetHeight - window.innerHeight
      if (totalScrollable <= 0) return

      const currentScroll = Math.max(0, -rect.top)
      const rawProgress = Math.min(1, Math.max(0, currentScroll / totalScrollable))
      targetProgressRef.current = rawProgress
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    const animate = () => {
      const diff = targetProgressRef.current - currentProgressRef.current
      if (Math.abs(diff) > 0.001) {
        currentProgressRef.current += diff * 0.16
        setProgress(currentProgressRef.current)
      } else if (currentProgressRef.current !== targetProgressRef.current) {
        currentProgressRef.current = targetProgressRef.current
        setProgress(currentProgressRef.current)
      }
      rafIdRef.current = requestAnimationFrame(animate)
    }

    rafIdRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
    }
  }, [])





  // Direct skip to website content
  const skipToWebsite = () => {
    if (!containerRef.current) return
    const targetY = containerRef.current.offsetTop + containerRef.current.offsetHeight
    window.scrollTo({ top: targetY, behavior: 'smooth' })
  }

  // ─── Mathematical Transitions for the 2 Scrolls ────────────────────────────
  // SCROLL 1: GOV SCHOOL EXTERIOR (0.0 to ~0.5)
  const exteriorOpacity = useMemo(() => {
    if (progress <= 0.40) return 1
    if (progress <= 0.55) return 1 - (progress - 0.40) / 0.15
    return 0
  }, [progress])
  const exteriorScale = 1 + progress * 0.42
  const exteriorY = -progress * 35

  // SCROLL 2: CLASSROOM SEEN FROM BACK/CENTER (0.40 to 1.0)
  const classroomOpacity = useMemo(() => {
    if (progress < 0.40) return 0
    if (progress <= 0.55) return (progress - 0.40) / 0.15
    return 1
  }, [progress])

  // Camera Zoom-Through Flight: As progress approaches 1.0, camera glides down the aisle into the board
  const flyProgress = useMemo(() => Math.max(0, (progress - 0.72) / 0.28), [progress])
  const classroomScale = 1.02 + Math.pow(flyProgress, 2) * 1.55 // Accelerating zoom right into TEACH AI INDIA
  const classroomY = -flyProgress * 65 // Centers directly on the board
  const boardGlowOpacity = Math.min(1, flyProgress * 1.6)

  return (
    <div
      ref={containerRef}
      id="cinematic-hero"
      className="relative w-full h-[230vh] bg-black text-white"
    >
      {/* ─── STICKY VIEWPORT STAGE (Pinned 100vh) ────────────────────────── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden select-none">
        {/* ─── SCROLL 1: GOV SCHOOL EXTERIOR ────────────────────────────── */}
        <div
          className="absolute inset-0 transition-opacity duration-300 will-change-transform"
          style={{
            opacity: exteriorOpacity,
            pointerEvents: exteriorOpacity > 0.05 ? 'auto' : 'none',
          }}
        >
          <div
            className="relative h-full w-full"
            style={{
              transform: `scale(${exteriorScale}) translateY(${exteriorY}px) translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`,
              transition: 'transform 0.05s linear',
            }}
          >
            <Image
              src="/images/cinematic/gov_school_exterior.jpg"
              alt="Authentic Indian government school building (Zilla Parishad High School) on a sunny morning"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center filter brightness-[0.93] contrast-[1.04]"
            />
            {/* Cinematic Vignette & Warm Sunlight Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
            <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-radial from-amber-400/25 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Scroll 1 Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 md:p-16 z-20 pointer-events-none">
            <div className="pt-6 sm:pt-8 flex items-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-white/90 backdrop-blur-md">
                <School className="size-3.5 text-amber-400" />
                Government Schools · Telangana &amp; Andhra Pradesh
              </span>
            </div>

            <div className="max-w-3xl pb-8 sm:pb-12">
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05] drop-shadow-xl">
                Enter the classroom.
                <span className="block italic text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-amber-100">
                  Change the future.
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-base sm:text-lg text-white/85 leading-relaxed drop-shadow-md">
                NIAT students bringing hands-on, applied AI literacy to government school classrooms.
                Learning becomes meaningful when passed forward.
              </p>

              <div className="mt-8 flex items-center gap-2 text-xs font-mono tracking-widest text-white/75 uppercase">
                <span>Scroll down to step inside the classroom ↓</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── SCROLL 2: CLASSROOM FROM BACK/CENTER (TEACH AI INDIA ON BOARD) ── */}
        <div
          className="absolute inset-0 transition-opacity duration-300 will-change-transform"
          style={{
            opacity: classroomOpacity,
            pointerEvents: classroomOpacity > 0.05 ? 'auto' : 'none',
          }}
        >
          <div
            className="relative h-full w-full origin-center"
            style={{
              transform: `scale(${classroomScale}) translateY(${classroomY}px) translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
              transition: 'transform 0.05s linear',
            }}
          >
            <Image
              src="/images/cinematic/classroom_teach_ai_india.jpg"
              alt="Classroom seen from the back center with wooden benches, sunlight rays, students facing front, and green chalkboard with TEACH AI INDIA"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center filter brightness-[0.95] contrast-[1.03]"
            />
            {/* Cinematic subtle contrast vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/35" />

            {/* Glowing Golden Chalk Portal Burst on Zoom-Through */}
            <div
              className="pointer-events-none absolute inset-0 bg-radial from-amber-300/40 via-rose-500/20 to-black/70 mix-blend-screen transition-opacity duration-300"
              style={{ opacity: boardGlowOpacity }}
            />
          </div>

          {/* Scroll 2 Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 md:p-16 z-20 pointer-events-none">
            <div className="pt-6 sm:pt-8 flex items-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/70 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-200 backdrop-blur-md">
                <Sparkles className="size-3.5 text-emerald-400 animate-pulse" />
                Live Classroom · Morning Session
              </span>
            </div>

            <div className="max-w-2xl pb-8 sm:pb-12">
              <span className="inline-block rounded-md bg-amber-400/20 border border-amber-400/40 px-2.5 py-0.5 font-mono text-xs font-bold uppercase tracking-[0.25em] text-amber-300 backdrop-blur-xs">
                On the Board: TEACH AI INDIA
              </span>

              <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-white leading-tight drop-shadow-xl">
                Every classroom can become a doorway to the future.
              </h2>

              <p className="mt-3 text-sm sm:text-base text-white/90 leading-relaxed drop-shadow-md">
                Rows of wooden desks, morning sunlight streaming through open windows, and students
                eagerly discovering artificial intelligence for the very first time.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 pointer-events-auto">
                <button
                  type="button"
                  onClick={skipToWebsite}
                  className="group inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-xl transition-all hover:scale-105 hover:bg-brand-deep cursor-pointer"
                >
                  <span>Enter the Movement</span>
                  <ChevronDown className="size-4.5 transition-transform group-hover:translate-y-1" />
                </button>
                <span className="text-xs font-mono text-white/70">
                  Scroll once more to open the full story ↓
                </span>
              </div>
            </div>
          </div>
        </div>




      </div>
    </div>
  )
}
