'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import Image from 'next/image'
import { Sparkles, ArrowDown } from 'lucide-react'

export function ChalkboardSignatureMoment() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const totalScrollable = containerRef.current.offsetHeight - window.innerHeight
      if (totalScrollable <= 0) return

      const currentScroll = Math.max(0, -rect.top)
      const p = Math.min(1, Math.max(0, currentScroll / totalScrollable))
      setScrollProgress(p)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Chalk writing progression stages:
  // 0.0 - 0.35: Writes "TEACH AI"
  // 0.35 - 0.70: Writes "FOR INDIA"
  // 0.70 - 1.00: Writes subtitle: "Empowering the next generation with AI."

  const teachAiLen = Math.min(1, Math.max(0, scrollProgress / 0.35))
  const forIndiaLen = Math.min(1, Math.max(0, (scrollProgress - 0.35) / 0.35))
  const subtitleLen = Math.min(1, Math.max(0, (scrollProgress - 0.70) / 0.30))

  const teachAiText = "TEACH AI"
  const forIndiaText = "FOR INDIA"
  const subtitleText = "Empowering the next generation with AI."

  const visibleTeachAi = teachAiText.slice(0, Math.round(teachAiLen * teachAiText.length))
  const visibleForIndia = forIndiaText.slice(0, Math.round(forIndiaLen * forIndiaText.length))
  const visibleSubtitle = subtitleText.slice(0, Math.round(subtitleLen * subtitleText.length))

  // Camera zoom into board
  const boardScale = 1.0 + scrollProgress * 0.08

  return (
    <section
      ref={containerRef}
      id="scene-chalkboard"
      aria-label="Signature Blackboard Moment"
      className="relative w-full h-[280vh] bg-[#0c140e] text-white overflow-hidden"
    >
      {/* ─── STICKY BOARD VIEWPORT ───────────────────────────────────────── */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center p-4 sm:p-8 md:p-10 pt-16 sm:pt-20 pb-8 overflow-hidden">
        {/* Ambient Blurred Classroom Backdrop from Scene 3 for 100% Visual Continuity */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <Image
            src="/images/cinematic/classroom_teach_ai_india.jpg"
            alt="Ambient classroom background"
            fill
            sizes="100vw"
            className="object-cover filter blur-md scale-105"
          />
        </div>

        {/* Ambient Warm Classroom Lighting Behind Board */}
        <div className="absolute inset-0 bg-radial from-amber-500/15 via-[#0b1b11]/85 to-[#070e09] pointer-events-none" />

        {/* ─── AUTHENTIC CHALKBOARD FRAME ─────────────────────────────────── */}
        <div
          className="relative w-full max-w-5xl max-h-[82vh] aspect-[16/10] sm:aspect-[16/9] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_80px_rgba(34,197,94,0.1)] border-[12px] sm:border-[16px] border-[#4a2e18] transition-transform duration-100 ease-out flex flex-col justify-between overflow-hidden"
          style={{
            transform: `scale(${boardScale})`,
            boxShadow: 'inset 0 0 80px rgba(0,0,0,0.85), 0 20px 50px rgba(0,0,0,0.9)',
          }}
        >
          {/* Slate Green Background Texture with Subtle Chalk Dust */}
          <div className="absolute inset-0 bg-[#163625] bg-radial from-[#1e4832] via-[#153423] to-[#0f2419]">
            {/* Subtle vintage chalk smudge overlay */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.4) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.3) 0%, transparent 50%)',
              }}
            />
          </div>

          {/* Top Board Meta: Date, Topic Header in Chalk */}
          <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 pt-5 sm:pt-7 font-mono text-[11px] sm:text-xs text-white/60 tracking-wider">
            <span className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-emerald-400/80 animate-ping" />
              <span>DATE: TODAY</span>
            </span>
            <span className="uppercase tracking-[0.2em] text-amber-300/80 font-semibold">
              SUBJECT: ARTIFICIAL INTELLIGENCE · CLASSROOM 101
            </span>
          </div>

          {/* Center Signature Chalk Stroke Writing */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-8 my-auto">
            {/* Eyebrow chalk stamp */}
            <span className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-3 py-1 font-mono text-[11px] sm:text-xs uppercase tracking-[0.25em] text-amber-200/90 backdrop-blur-xs mb-4">
              <Sparkles className="size-3 text-amber-300" />
              Written on the board
            </span>

            {/* Main Signature Heading: TEACH AI FOR INDIA */}
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white/95 leading-[1.05] drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]">
              <span className="inline-block transition-all duration-75 relative">
                {visibleTeachAi}
                {teachAiLen < 1 && (
                  <span className="inline-block w-2.5 sm:w-4 h-8 sm:h-14 bg-white/90 animate-pulse ml-1 align-baseline shadow-[0_0_10px_white]" />
                )}
              </span>
              <br />
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-rose-200">
                {visibleForIndia}
                {teachAiLen >= 1 && forIndiaLen < 1 && (
                  <span className="inline-block w-2.5 sm:w-4 h-8 sm:h-14 bg-amber-300/90 animate-pulse ml-1 align-baseline shadow-[0_0_10px_amber]" />
                )}
              </span>
            </h2>

            {/* Subtitle Chalk Stroke */}
            <div className="mt-5 sm:mt-7 min-h-[2rem]">
              <p className="font-mono text-sm sm:text-lg md:text-xl text-emerald-100/85 tracking-wide drop-shadow-sm font-medium">
                {visibleSubtitle}
                {forIndiaLen >= 1 && subtitleLen < 1 && (
                  <span className="inline-block w-2 h-4 sm:h-5 bg-emerald-200 animate-pulse ml-1 align-baseline" />
                )}
              </p>
            </div>
          </div>

          {/* Bottom Chalkboard Ledge with Chalk Pieces & Duster */}
          <div className="relative z-10 bg-[#3d2513] border-t-2 border-[#2b190c] px-6 sm:px-10 py-2.5 sm:py-3 flex items-center justify-between text-xs text-amber-200/60 font-mono shadow-inner">
            <div className="flex items-center gap-3">
              {/* White chalk stick */}
              <div className="w-10 sm:w-14 h-2.5 sm:h-3 rounded-full bg-slate-100 shadow-md border border-slate-300 rotate-2" />
              {/* Yellow chalk stick */}
              <div className="w-8 sm:w-10 h-2.5 sm:h-3 rounded-full bg-amber-300 shadow-md border border-amber-400 -rotate-3" />
              {/* Wooden blackboard duster */}
              <div className="w-14 sm:w-20 h-4 sm:h-5 rounded bg-[#6a4224] border border-[#4a2e18] shadow text-[9px] text-center text-amber-100/50 hidden sm:block">
                DUSTER
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-white/70">
              <ArrowDown className="size-3 animate-bounce text-amber-400" />
              <span>Scroll to open the mission dossier ↓</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
