'use client'

import React, { useEffect, useState } from 'react'

// ==========================================
// Hand-Drawn SVG Doodle Components
// ==========================================

function RobotDoodle(props: React.SVGProps<SVGSVGElement>) {
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

function RocketDoodle(props: React.SVGProps<SVGSVGElement>) {
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

function LightbulbDoodle(props: React.SVGProps<SVGSVGElement>) {
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

function OpenBookDoodle(props: React.SVGProps<SVGSVGElement>) {
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

function GraduationCapDoodle(props: React.SVGProps<SVGSVGElement>) {
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

function AtomDoodle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M 50 10 C 80 20, 80 80, 50 90 C 20 80, 20 20, 50 10 Z" transform="rotate(30 50 50)" />
      <path d="M 50 10 C 80 20, 80 80, 50 90 C 20 80, 20 20, 50 10 Z" transform="rotate(150 50 50)" />
      <circle cx="50" cy="50" r="6" fill="currentColor" className="opacity-60" />
      <path d="M 46 48 C 48 45, 52 45, 54 48 C 55 51, 52 55, 49 53 Z" strokeWidth={1} />
    </svg>
  )
}

function SparklesDoodle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M 50 15 L 53 35 L 75 38 L 55 45 L 60 65 L 50 50 L 40 65 L 45 45 L 25 38 L 47 35 Z" fill="currentColor" className="opacity-20" />
      <path d="M 80 60 L 82 66 L 88 68 L 82 70 L 80 76 L 78 70 L 72 68 L 78 66 Z" />
      <path d="M 20 20 L 21 24 L 25 25 L 21 26 L 20 30 L 19 26 L 15 25 L 19 24 Z" />
    </svg>
  )
}

function NeuralNodeDoodle(props: React.SVGProps<SVGSVGElement>) {
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

function BlackboardDoodle(props: React.SVGProps<SVGSVGElement>) {
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

function GlobeDoodle(props: React.SVGProps<SVGSVGElement>) {
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

function CodeBracesDoodle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M 35 20 C 25 20, 28 40, 20 45 C 28 50, 25 70, 35 70" />
      <path d="M 65 20 C 75 20, 72 40, 80 45 C 72 50, 75 70, 65 70" />
      <path d="M 45 42 L 58 55 L 52 57 L 57 66 L 53 68 L 48 59 L 43 61 Z" fill="currentColor" />
    </svg>
  )
}

function BrainGearDoodle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M 50 25 C 35 25, 25 35, 25 48 C 25 55, 30 62, 38 65 C 38 72, 45 78, 53 78 C 65 78, 72 70, 75 62 C 82 58, 85 50, 81 40 C 78 30, 68 25, 50 25 Z" />
      <path d="M 45 35 C 40 38, 38 45, 42 50 C 45 55, 52 50, 50 45" />
      <path d="M 55 35 C 60 38, 62 45, 58 50 C 55 55, 48 50, 50 45" strokeDasharray="2 2" />
      <path d="M 33 48 C 36 52, 44 52, 46 58" />
      <path d="M 67 48 C 64 52, 56 52, 54 58" />
      <circle cx="50" cy="62" r="5" />
      <path d="M 50 54 L 50 56 M 50 68 L 50 70 M 42 62 L 44 62 M 56 62 L 58 62" />
    </svg>
  )
}

// ==========================================
// Main Background Component
// ==========================================

export function Background3D() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse positions (-0.5 to 0.5)
      const x = (e.clientX / window.innerWidth) - 0.5
      const y = (e.clientY / window.innerHeight) - 0.5
      setMouse({ x, y })
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden bg-background">
      
      {/* Dynamic ambient color gradients reacting to mouse depth offsets */}
      <div 
        className="absolute top-[-15%] left-[-15%] size-[60%] rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-600/8 blur-[120px] opacity-80"
        style={{
          transform: `translate3d(${mouse.x * -5}px, ${mouse.y * -5}px, 0)`,
          transition: 'transform 0.7s ease-out',
        }}
      />
      <div 
        className="absolute bottom-[-15%] right-[-15%] size-[65%] rounded-full bg-gradient-to-br from-indigo-600/8 to-sky-500/6 blur-[140px] opacity-80"
        style={{
          transform: `translate3d(${mouse.x * -4}px, ${mouse.y * -4}px, 0)`,
          transition: 'transform 0.7s ease-out',
        }}
      />

      {/* Science & AI Doodles Layer - transparent floating items */}
      <div className="absolute inset-0 z-0 opacity-[0.22] dark:opacity-[0.25]">
        
        {/* 1. Robot Face (Top Left) */}
        <div 
          className="absolute top-[8%] left-[4%]"
          style={{
            transform: `translate3d(${mouse.x * -8}px, ${mouse.y * -8}px, 0)`,
            transition: 'transform 0.6s ease-out',
          }}
        >
          <div className="animate-float-slow">
            <RobotDoodle className="size-10 sm:size-14 md:size-18 lg:size-22 text-brand dark:text-cyan-400/80" />
          </div>
        </div>

        {/* 2. Rocket (Top Left-Center) */}
        <div 
          className="absolute top-[25%] left-[15%] md:left-[12%]"
          style={{
            transform: `translate3d(${mouse.x * -12}px, ${mouse.y * -12}px, 0)`,
            transition: 'transform 0.6s ease-out',
          }}
        >
          <div className="animate-float">
            <RocketDoodle className="size-10 sm:size-12 md:size-16 text-brand-orange dark:text-amber-400/80" />
          </div>
        </div>

        {/* 3. Lightbulb with Brain filament (Middle Left) */}
        <div 
          className="absolute top-[48%] left-[3%] md:left-[6%]"
          style={{
            transform: `translate3d(${mouse.x * -10}px, ${mouse.y * -10}px, 0)`,
            transition: 'transform 0.6s ease-out',
          }}
        >
          <div className="animate-float-slow">
            <LightbulbDoodle className="size-12 sm:size-16 md:size-20 text-brand-orange dark:text-amber-400/80" />
          </div>
        </div>

        {/* 4. Open Book with Math floating (Bottom Left-Center) */}
        <div 
          className="absolute bottom-[22%] left-[14%] md:left-[10%]"
          style={{
            transform: `translate3d(${mouse.x * -7}px, ${mouse.y * -7}px, 0)`,
            transition: 'transform 0.6s ease-out',
          }}
        >
          <div className="animate-float">
            <OpenBookDoodle className="size-10 sm:size-12 md:size-16 text-brand dark:text-blue-400/80" />
          </div>
        </div>

        {/* 5. Graduation Cap (Bottom Left) */}
        <div 
          className="absolute bottom-[8%] left-[4%] md:left-[5%]"
          style={{
            transform: `translate3d(${mouse.x * -9}px, ${mouse.y * -9}px, 0)`,
            transition: 'transform 0.6s ease-out',
          }}
        >
          <div className="animate-float-slow">
            <GraduationCapDoodle className="size-10 sm:size-14 md:size-18 lg:size-22 text-brand-teal dark:text-emerald-400/80" />
          </div>
        </div>

        {/* 6. Atom (Top Right) */}
        <div 
          className="absolute top-[10%] right-[4%]"
          style={{
            transform: `translate3d(${mouse.x * -6}px, ${mouse.y * -6}px, 0)`,
            transition: 'transform 0.6s ease-out',
          }}
        >
          <div className="animate-spin-slow">
            <AtomDoodle className="size-12 sm:size-16 md:size-20 lg:size-24 text-brand-teal dark:text-cyan-400/80" />
          </div>
        </div>

        {/* 7. Sparkles / Stars (Top Right-Center) */}
        <div 
          className="absolute top-[28%] right-[16%] md:right-[12%]"
          style={{
            transform: `translate3d(${mouse.x * -14}px, ${mouse.y * -14}px, 0)`,
            transition: 'transform 0.6s ease-out',
          }}
        >
          <div className="animate-pulse-slow">
            <SparklesDoodle className="size-8 sm:size-12 md:size-14 text-brand-teal dark:text-yellow-400/85" />
          </div>
        </div>

        {/* 8. Neural Node Network (Middle Right) */}
        <div 
          className="absolute top-[50%] right-[3%] md:right-[6%]"
          style={{
            transform: `translate3d(${mouse.x * -11}px, ${mouse.y * -11}px, 0)`,
            transition: 'transform 0.6s ease-out',
          }}
        >
          <div className="animate-float-slow">
            <NeuralNodeDoodle className="size-12 sm:size-16 md:size-20 text-brand-teal dark:text-cyan-300/80" />
          </div>
        </div>

        {/* 9. Blackboard Math Graph (Bottom Right-Center) */}
        <div 
          className="absolute bottom-[25%] right-[15%] md:right-[10%]"
          style={{
            transform: `translate3d(${mouse.x * -8}px, ${mouse.y * -8}px, 0)`,
            transition: 'transform 0.6s ease-out',
          }}
        >
          <div className="animate-float">
            <BlackboardDoodle className="size-10 sm:size-12 md:size-16 text-brand-orange dark:text-amber-400/80" />
          </div>
        </div>

        {/* 10. Globe on Stand (Bottom Right) */}
        <div 
          className="absolute bottom-[8%] right-[4%] md:right-[5%]"
          style={{
            transform: `translate3d(${mouse.x * -7}px, ${mouse.y * -7}px, 0)`,
            transition: 'transform 0.6s ease-out',
          }}
        >
          <div className="animate-float-slow">
            <GlobeDoodle className="size-10 sm:size-14 md:size-18 lg:size-22 text-brand-teal dark:text-emerald-400/80" />
          </div>
        </div>

        {/* 11. Code Curly Braces & Cursor (Top Center) */}
        <div 
          className="absolute top-[6%] left-[45%] lg:left-[48%] hidden lg:block"
          style={{
            transform: `translate3d(${mouse.x * -15}px, ${mouse.y * -15}px, 0)`,
            transition: 'transform 0.6s ease-out',
          }}
        >
          <div className="animate-float">
            <CodeBracesDoodle className="size-10 sm:size-12 md:size-16 text-brand dark:text-blue-400/80" />
          </div>
        </div>

        {/* 12. Brain Profile with Gear (Middle Center-Right) */}
        <div 
          className="absolute top-[38%] right-[30%] lg:right-[26%] hidden lg:block"
          style={{
            transform: `translate3d(${mouse.x * -5}px, ${mouse.y * -5}px, 0)`,
            transition: 'transform 0.6s ease-out',
          }}
        >
          <div className="animate-pulse-slow">
            <BrainGearDoodle className="size-10 sm:size-14 md:size-18 text-brand dark:text-indigo-400/80" />
          </div>
        </div>

      </div>

    </div>
  )
}

