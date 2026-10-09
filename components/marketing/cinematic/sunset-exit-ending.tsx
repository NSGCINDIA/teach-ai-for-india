'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, ArrowRight, HeartHandshake, Compass, Users } from 'lucide-react'

export function SunsetExitEnding() {
  return (
    <section
      id="scene-sunset"
      aria-label="The Emotional Ending: The Future is Taught"
      className="relative w-full min-h-screen bg-black text-white flex flex-col justify-between overflow-hidden"
    >
      {/* ─── FULL BLEED BACKGROUND: SUNSET SCHOOL EXTERIOR ────────────────── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/cinematic/sunset_school_exterior.jpg"
          alt="Indian government school at sunset with evening sky and students heading home"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.82] contrast-[1.05]"
        />
        {/* Cinematic Golden Hour Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
      </div>

      {/* ─── TOP HEADER OF FINAL SCENE ────────────────────────────────────── */}
      <div className="relative z-10 pt-16 sm:pt-24 px-5 sm:px-10 text-center max-w-4xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-black/60 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.25em] text-amber-300 backdrop-blur-md">
          <Sparkles className="size-3.5 text-amber-400" />
          The Future is Taught
        </span>
      </div>

      {/* ─── CENTER / BOTTOM CALL TO ACTION ───────────────────────────────── */}
      <div className="relative z-10 pb-20 sm:pb-28 px-5 sm:px-10 max-w-5xl mx-auto w-full text-center">
        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.05] drop-shadow-2xl">
          Help us bring AI education to{' '}
          <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-amber-100">
            more classrooms.
          </span>
        </h2>

        <p className="mt-5 text-base sm:text-xl text-white/85 max-w-2xl mx-auto font-serif leading-relaxed drop-shadow-md">
          Every session starts with an undergraduate student volunteering their weekend, and ends with
          forty rural children believing that technology belongs to them.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/contact?role=partner"
            className="group inline-flex h-14 items-center gap-3 rounded-2xl bg-[#9E2A2B] px-8 text-base font-semibold text-white shadow-2xl transition-all hover:scale-105 hover:bg-[#780000]"
          >
            <span>Partner With Us</span>
            <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/join"
            className="inline-flex h-14 items-center gap-2 rounded-2xl bg-white/15 px-8 text-base font-semibold text-white backdrop-blur-md border border-white/25 transition-all hover:bg-white/25 hover:scale-105"
          >
            <Users className="size-4.5 text-amber-300" />
            <span>Volunteer as a Student</span>
          </Link>

          <Link
            href="/about"
            className="inline-flex h-14 items-center gap-2 rounded-2xl bg-black/40 px-6 text-sm font-mono text-white/80 backdrop-blur-md border border-white/15 transition-all hover:text-white hover:border-white/40"
          >
            <span>Read Our Origin Story →</span>
          </Link>
        </div>

        {/* Bottom Institutional Attribution */}
        <div className="mt-14 pt-8 border-t border-white/15 flex flex-wrap items-center justify-between text-xs font-mono text-white/60">
          <span>A student-led initiative powered by NIAT students</span>
          <span className="text-amber-300">Teach AI for India · Since 2024</span>
        </div>
      </div>
    </section>
  )
}
