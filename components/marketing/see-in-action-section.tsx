'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'
import { landingContent } from '@/app/(public)/content'

export function SeeInActionSection() {
  const content = landingContent.seeInAction
  const reel = content.videoReel

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const totalDuration = reel.durationSec || 45

  const currentChapter =
    reel.chapters.find((c) => currentTime >= c.startSec && currentTime < c.endSec) || reel.chapters[0]

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, totalDuration])

  return (
    <section id="see-in-action" className="tai-section relative overflow-hidden bg-background py-16 md:py-24">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 border-b border-foreground/15 pb-6 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.2em] text-brand">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex size-2.5 rounded-full bg-red-600"></span>
                </span>
                {content.eyebrow}
                <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
                  N&deg; 07
                </span>
              </div>

              <h2 className="tai-text-display mt-3 font-display text-foreground">
                {content.title}
              </h2>
            </div>
            <p className="max-w-xl text-base text-muted-foreground leading-relaxed md:text-lg">
              {content.subtitle}
            </p>
          </div>
        </Reveal>

        {/* 1. DOCUMENTARY VIDEO REEL SLOT */}
        <Reveal delay={0.15}>
          <div className="relative mt-10 overflow-hidden rounded-3xl border border-foreground/20 bg-black shadow-2xl">
            <div className="relative aspect-[16/10] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
              <Image
                src={currentChapter.image}
                alt={currentChapter.title}
                fill
                priority
                sizes="100vw"
                className="object-cover transition-all duration-700 filter"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/30" />

              {/* Top HUD */}
              <div className="absolute left-4 right-4 top-4 flex items-center justify-between text-white md:left-8 md:top-8 md:right-8">
                <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 font-mono text-xs font-bold backdrop-blur-md">
                  <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                  <span>FIELD DOCUMENTARY · LIVE CLASSROOM FEED</span>
                </div>

                <div className="font-mono text-xs font-semibold tracking-wider text-white/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                  {String(Math.floor(currentTime / 60)).padStart(2, '0')}:
                  {String(currentTime % 60).padStart(2, '0')} / 00:{totalDuration}
                </div>
              </div>

              {/* Center Play Button Overlay */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="group absolute inset-0 m-auto flex size-20 items-center justify-center rounded-full bg-brand/90 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 hover:bg-brand"
                  aria-label="Play 45-second documentary"
                >
                  <Play className="ml-1 size-8 fill-white" />
                </button>
              )}

              {/* Bottom Caption & Chapter Meta */}
              <div className="absolute bottom-16 left-4 right-4 text-white md:bottom-20 md:left-8 md:right-8">
                <div className="max-w-2xl">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                    {currentChapter.location}
                  </span>

                  <h3 className="mt-1.5 font-display text-2xl font-bold leading-tight sm:text-3xl md:text-4xl text-white">
                    {currentChapter.overlay}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-white/85 sm:text-sm md:text-base">
                    {currentChapter.description}
                  </p>

                  {currentChapter.quote && (
                    <p className="mt-2 font-display text-sm italic text-amber-200 md:text-lg">
                      {currentChapter.quote}
                    </p>
                  )}
                </div>
              </div>

              {/* Timeline Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-3 backdrop-blur-md md:p-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex size-9 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentTime(0)
                      setIsPlaying(true)
                    }}
                    className="flex size-9 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                    aria-label="Restart"
                  >
                    <RotateCcw className="size-4" />
                  </button>

                  {/* Scrubber */}
                  <div
                    className="relative h-2 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/20"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const pos = (e.clientX - rect.left) / rect.width
                      setCurrentTime(Math.floor(pos * totalDuration))
                    }}
                  >
                    <div
                      className="h-full bg-brand transition-all duration-300"
                      style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                    />
                  </div>

                  <span className="font-mono text-xs text-white/70">
                    {currentTime}s / {totalDuration}s
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* 2. REAL CLASSROOM MOMENTS GALLERY */}
        <div className="mt-16">
          <Reveal>
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                Classroom Moments Gallery
              </h3>
              <span className="font-mono text-xs text-muted-foreground">
                6 Verified Session Records
              </span>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.galleryMoments.map((item, idx) => (
              <Reveal key={item.id} delay={idx * 0.08}>
                <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    <Image
                      src={item.url}
                      alt={item.caption}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-2.5 left-2.5 rounded-full bg-black/60 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-white backdrop-blur-xs">
                      {item.tag}
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="font-display text-sm font-bold text-foreground">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {item.caption}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
