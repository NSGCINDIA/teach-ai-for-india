'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, BarChart3, Users, GraduationCap, MapPin, CheckCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { HeroContent } from '@/app/(public)/content'

export function Hero({ content }: { content: HeroContent }) {
  // Words to cycle through in the main heading
  const words = ["applied AI literacy", "hands-on coding", "prompt engineering", "creative technology"]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [words.length])

  // Mouse tilt tracking for 3D card effect
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [glowX, setGlowX] = useState(0)
  const [glowY, setGlowY] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Perspective calculation
    const rotX = -(y - centerY) / 16
    const rotY = (x - centerX) / 16
    setRotateX(rotX)
    setRotateY(rotY)

    // Glow position
    const glowPctX = (x / rect.width) * 100
    const glowPctY = (y / rect.height) * 100
    setGlowX(glowPctX)
    setGlowY(glowPctY)
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotateX(0)
    setRotateY(0)
  }

  const item = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 20 } },
  }

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  }

  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden py-16 lg:py-24 bg-transparent">
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

      {/* Cybernetic ambient light blobs */}
      <motion.div
        aria-hidden
        animate={{
          scale: [1, 1.12, 1],
          x: [0, 25, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute -top-40 left-1/4 size-[40rem] rounded-full bg-gradient-to-br from-cyan-500/18 via-blue-600/12 to-transparent blur-[130px] dark:from-cyan-500/10 dark:via-blue-600/6"
      />
      <motion.div
        aria-hidden
        animate={{
          scale: [1.1, 0.95, 1.1],
          x: [0, -25, 0],
          y: [0, 25, 0],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute bottom-0 right-1/4 size-[35rem] rounded-full bg-gradient-to-br from-indigo-600/20 via-sky-500/10 to-transparent dark:from-indigo-600/10 dark:via-sky-500/5 blur-[130px]"
      />

      <div className="container-wide relative px-5 md:px-8 lg:px-12 z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-center">
          
          {/* ── LEFT COLUMN: Text Copy, Teaser Capsule, Trust Badges ── */}
          <motion.div
            className="lg:col-span-7 flex flex-col items-start text-left"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {content.eyebrow && (
              <motion.div variants={item}>
                <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 dark:bg-brand/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-brand shadow-soft backdrop-blur-md">
                  <Sparkles className="size-3.5 animate-pulse text-brand" />
                  {content.eyebrow}
                </span>
              </motion.div>
            )}

            <motion.h1
              variants={item}
              className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl xl:text-7.5xl text-foreground"
            >
              Building India's first <br />
              student-led <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-orange to-brand-teal">
                AI education movement
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed min-h-[56px]"
            >
              We bring{' '}
              <span className="text-foreground font-semibold inline-block min-w-[170px] text-left">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={words[index]}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="inline-block text-brand dark:text-primary font-bold border-b border-brand/20 dark:border-primary/20 pb-0.5"
                  >
                    {words[index]}
                  </motion.span>
                </AnimatePresence>
              </span>{' '}
              to government school classrooms across Telangana & Andhra Pradesh—run entirely by college student volunteers.
            </motion.p>

            {/* Email Capsule with Shifting Gradient Border Beam */}
            <motion.div variants={item} className="mt-8 w-full max-w-md relative group">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-brand via-brand-orange to-brand-teal opacity-30 blur group-hover:opacity-75 transition duration-500" />
              
              <div className="relative p-1.5 w-full bg-background dark:bg-card/90 backdrop-blur-md rounded-full border border-border/80 flex items-center justify-between shadow-soft-lg transition-all duration-300">
                <input
                  type="email"
                  placeholder="Enter your email to volunteer..."
                  className="bg-transparent pl-5 pr-2 py-2.5 text-sm w-full outline-none border-none text-foreground placeholder:text-muted-foreground/75 font-medium"
                />
                <Button asChild size="sm" className="bg-brand text-white hover:bg-brand/90 rounded-full px-6 py-2.5 whitespace-nowrap font-bold shadow-md transition-all active:scale-95">
                  <Link href="/join">Apply Now</Link>
                </Button>
              </div>
            </motion.div>

            {/* Floating Trust Indicators */}
            <motion.div
              variants={item}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-bold text-muted-foreground/80 uppercase tracking-wider cursor-default"
            >
              <div className="flex items-center gap-1.5 hover:text-brand transition-colors">
                <CheckCircle className="size-4.5 text-brand" />
                <span>100% Student Led</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-brand-orange transition-colors">
                <CheckCircle className="size-4.5 text-brand-orange" />
                <span>Telangana & AP</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-brand-teal transition-colors">
                <CheckCircle className="size-4.5 text-brand-teal" />
                <span>9 Campuses</span>
              </div>
            </motion.div>

            <motion.div
              variants={item}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Button asChild size="lg" className="bg-brand text-white hover:bg-brand/90 rounded-full px-7 shadow-lg shadow-brand/20 transition-all hover:translate-y-[-2px] active:translate-y-0">
                <Link href="/impact">
                  <BarChart3 className="size-4 mr-2" aria-hidden />
                  See our impact
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="group rounded-full px-7 hover:bg-muted/50 transition-all hover:translate-y-[-2px] active:translate-y-0">
                <Link href="/join">
                  Join the movement
                  <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* ── RIGHT COLUMN: Browser Mockup with 3D Hover/Tilt + Interactive Glow Spotlight ── */}
          <motion.div
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
                transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
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
                    background: `radial-gradient(circle 200px at ${glowX}% ${glowY}%, color-mix(in srgb, var(--brand-teal) 15%, transparent), transparent)`,
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
            <motion.div
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
            </motion.div>

            {/* FLOATING CARD 2: 5,000+ Impacted */}
            <motion.div
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
            </motion.div>

            {/* FLOATING CARD 3: 9 Active Campuses */}
            <motion.div
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
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  )
}

