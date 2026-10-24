'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { School, ArrowDown } from 'lucide-react'

export function CinematicSchoolEntrance() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const targetProgressRef = useRef(0)
  const currentProgressRef = useRef(0)
  const rafIdRef = useRef<number | null>(null)

  // Gentle mouse parallax
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 12
    const y = (e.clientY / window.innerHeight - 0.5) * 12
    setMousePos({ x, y })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  // 60fps Lerped scroll progression across the 2-scroll entrance
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
      if (Math.abs(diff) > 0.0008) {
        currentProgressRef.current += diff * 0.14
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

  // ─── 2-Scene Direct Camera Flight: Exterior ➔ Classroom ────────────────────
  // Scene 1: School Exterior (0.00 – 0.55)
  const exteriorOpacity = useMemo(() => {
    if (progress <= 0.40) return 1
    if (progress <= 0.58) return 1 - (progress - 0.40) / 0.18
    return 0
  }, [progress])
  const exteriorScale = 1 + progress * 0.35
  const exteriorY = -progress * 25

  // Scene 2: Classroom (0.42 – 1.00)
  const classroomOpacity = useMemo(() => {
    if (progress < 0.42) return 0
    if (progress <= 0.60) return (progress - 0.42) / 0.18
    return 1
  }, [progress])
  const classroomLocalProgress = Math.max(0, Math.min(1, (progress - 0.45) / 0.55))
  const classroomScale = 1.0 + classroomLocalProgress * 0.18
  const classroomY = -classroomLocalProgress * 15

  return (
    <section
      ref={containerRef}
      id="scene-entrance"
      aria-label="Enter the School Experience"
      className="relative w-full h-[200vh] bg-black text-white"
    >
      {/* ─── PINNED 100VH VIEWPORT STAGE ─────────────────────────────────── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden select-none">
        {/* ─── SCENE 1: GOVERNMENT SCHOOL EXTERIOR ─────────────────────────── */}
        <div
          className="absolute inset-0 transition-opacity duration-300 will-change-transform"
          style={{
            opacity: exteriorOpacity,
            pointerEvents: exteriorOpacity > 0.1 ? 'auto' : 'none',
          }}
        >
          <div
            className="relative h-full w-full"
            style={{
              transform: `scale(${exteriorScale}) translateY(${exteriorY}px) translate(${mousePos.x * 0.35}px, ${mousePos.y * 0.35}px)`,
              transition: 'transform 0.05s linear',
            }}
          >
            <Image
              src="/images/cinematic/gov_school_exterior.jpg"
              alt="Authentic Indian government school building (Zilla Parishad High School) on a sunny morning"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center filter brightness-[0.94] contrast-[1.04]"
            />
            {/* Cinematic subtle Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/35" />
          </div>

          {/* Exterior Title Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 md:p-16 z-20 pointer-events-none">
            <div className="pt-6 sm:pt-8 flex items-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-white/90 backdrop-blur-md">
                <School className="size-3.5 text-amber-400" />
                Government Schools · Telangana &amp; Andhra Pradesh
              </span>
            </div>

            <div className="max-w-3xl pb-8 sm:pb-12">
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05] drop-shadow-2xl">
                Enter the school.
                <span className="block italic text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-amber-100">
                  Change the future.
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-base sm:text-lg text-white/85 leading-relaxed drop-shadow-md">
                NIAT students bringing hands-on, applied AI literacy to government school classrooms.
                Learning becomes meaningful when passed forward.
              </p>

              <div className="mt-8 flex items-center gap-2.5 text-xs font-mono tracking-widest text-white/75 uppercase">
                <ArrowDown className="size-3.5 animate-bounce text-amber-400" />
                <span>Scroll to enter the classroom ↓</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── SCENE 2: CLASSROOM WITH GREEN CHALKBOARD & STUDENTS ─────────── */}
        <div
          className="absolute inset-0 transition-opacity duration-300 will-change-transform"
          style={{
            opacity: classroomOpacity,
            pointerEvents: classroomOpacity > 0.1 ? 'auto' : 'none',
          }}
        >
          <div
            className="relative h-full w-full origin-center"
            style={{
              transform: `scale(${classroomScale}) translateY(${classroomY}px) translate(${mousePos.x * 0.25}px, ${mousePos.y * 0.25}px)`,
              transition: 'transform 0.05s linear',
            }}
          >
            <Image
              src="/images/cinematic/classroom_teach_ai_india.jpg"
              alt="Classroom seen from the back center with wooden benches, sunlight rays, students facing front, and green chalkboard with TEACH AI INDIA"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center filter brightness-[0.96] contrast-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/35" />
          </div>

          {/* Classroom Narration Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 md:p-16 z-20 pointer-events-none">
            <div className="pt-6 sm:pt-8 flex items-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/70 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-200 backdrop-blur-md">
                Inside The Classroom · Morning AI Session
              </span>
            </div>

            <div className="max-w-2xl pb-8 sm:pb-12">
              <span className="inline-block rounded-md bg-amber-400/20 border border-amber-400/40 px-2.5 py-0.5 font-mono text-xs font-bold uppercase tracking-[0.25em] text-amber-300 backdrop-blur-xs">
                Classroom in Action
              </span>

              <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-white leading-tight drop-shadow-xl">
                Every classroom can become a doorway to the future.
              </h2>

              <p className="mt-3 text-sm sm:text-base text-white/90 leading-relaxed drop-shadow-md">
                Rows of wooden desks, morning sunlight streaming through open windows, and students
                eagerly discovering artificial intelligence.
              </p>

              <div className="mt-6 flex items-center gap-3 text-xs font-mono text-amber-300 uppercase tracking-wider">
                <ArrowDown className="size-3.5 animate-bounce" />
                <span>Scroll to explore the movement ↓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
