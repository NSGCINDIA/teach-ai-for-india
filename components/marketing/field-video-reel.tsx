'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Pause, RotateCcw, ArrowRight, Volume2, VolumeX, Maximize2, Radio } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface Chapter {
  startSec: number
  endSec: number
  rangeLabel: string
  title: string
  location: string
  image: string
  overlayTitle: string
  subtitle: string
  quote?: string
}

const CHAPTERS: Chapter[] = [
  {
    startSec: 0,
    endSec: 5,
    rangeLabel: '00:00 – 00:05',
    title: 'Government School',
    location: 'ZPHS Bachupally, Medchal-Malkajgiri',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1400/v1784177864/WhatsApp_Image_2026-04-18_at_14.46.43_vtswq0.jpg',
    overlayTitle: '08:45 AM · The Morning Classroom',
    subtitle: 'High school students in regional Telangana. Limited digital access; zero prior hands-on exposure to AI tools.',
  },
  {
    startSec: 5,
    endSec: 10,
    rangeLabel: '00:05 – 00:10',
    title: 'NIAT Volunteers Arriving',
    location: 'Campus Lead & Volunteer Squad',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1400/v1784177876/DJI_20260711124202_0244_D_zgvqzo.jpg',
    overlayTitle: '09:15 AM · The Setup',
    subtitle: 'Four NIAT engineering students carrying tablets, offline workbooks, and mobile hotspots into the government school compound.',
  },
  {
    startSec: 10,
    endSec: 20,
    rangeLabel: '00:10 – 00:20',
    title: 'Students Using AI',
    location: 'Hands-on Prompt Workshop',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1400/v1784177864/IMG-20260406-WA0007_3_hboy0k.jpg',
    overlayTitle: '09:40 AM · First Prompts',
    subtitle: 'No lectures. Students take the tablet in pairs, formulating their first prompt in Telugu and watching language translate into action.',
  },
  {
    startSec: 20,
    endSec: 30,
    rangeLabel: '00:20 – 00:30',
    title: 'Students Reacting & Laughing',
    location: 'MPPS Nandakramaguda',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1400/v1784177867/IMG_20260324_121056961_prkzll.jpg',
    overlayTitle: '10:05 AM · The Breakthrough',
    subtitle: 'The artwork appears. The quiet room bursts into laughter, excitement, and hands waving to try the next idea.',
    quote: '"Anna, can it make a picture of Allu Arjun? Can it do Telugu cinema?"',
  },
  {
    startSec: 30,
    endSec: 40,
    rangeLabel: '00:30 – 00:40',
    title: 'Student Quote',
    location: 'After the Session',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1400/v1784177911/DJI_20260711132101_0313_D_a48glv.jpg',
    overlayTitle: '10:30 AM · The Realization',
    subtitle: 'Class has ended, but nobody wants to leave. They cluster around the college leads asking questions about engineering and AI careers.',
    quote: '"Anna, when are you coming again? Can we build something next time?"',
  },
  {
    startSec: 40,
    endSec: 45,
    rangeLabel: '00:40 – 00:45',
    title: 'The Next School',
    location: 'Expanding across 20+ Schools',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1400/v1784178443/IMG-20260410-WA0007_txyvjq.jpg',
    overlayTitle: 'Help us take this classroom to the next school.',
    subtitle: 'Hundreds of schools are waiting for their first session. University volunteer teams are ready to deploy.',
  },
]

export function FieldVideoReel() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const totalDuration = 45

  const currentChapter =
    CHAPTERS.find((c) => currentTime >= c.startSec && currentTime < c.endSec) || CHAPTERS[0]

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
  }, [isPlaying])

  const handleSeek = (sec: number) => {
    setCurrentTime(sec)
  }

  return (
    <section id="field-reel" className="tai-section relative overflow-hidden bg-background">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-foreground/15 pb-6 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.2em] text-brand">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex size-2.5 rounded-full bg-red-600"></span>
              </span>
              Raw field documentary
            </div>
            <h2 className="tai-text-display mt-3 font-display text-foreground">
              See Teach AI in action
            </h2>
          </div>
          <p className="max-w-xl text-base text-muted-foreground leading-relaxed md:text-lg">
            Don&apos;t just take our word for it. See what happens inside the classroom.
          </p>
        </div>

        {/* Video Player Display */}
        <div className="relative mt-10 overflow-hidden rounded-3xl border border-foreground/20 bg-black shadow-2xl">
          {/* Main Visual Frame */}
          <div className="relative aspect-[16/10] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
            <Image
              src={currentChapter.image}
              alt={currentChapter.title}
              fill
              priority
              sizes="100vw"
              className="object-cover transition-all duration-700 filter"
            />

            {/* Cinematic overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/30" />

            {/* Top HUD (REC indicator, Timecode, Chapter) */}
            <div className="absolute left-4 right-4 top-4 flex items-center justify-between text-white md:left-8 md:top-8 md:right-8">
              <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 font-mono text-xs font-bold backdrop-blur-md">
                <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                <span>REC · DOCUMENTARY FEED</span>
              </div>

              <div className="font-mono text-xs font-semibold tracking-wider text-white/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                {String(Math.floor(currentTime / 60)).padStart(2, '0')}:
                {String(currentTime % 60).padStart(2, '0')} / 00:45
              </div>
            </div>

            {/* Center Play Button Overlay (when paused) */}
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
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--tai-saffron)]">
                  {currentChapter.rangeLabel} · {currentChapter.location}
                </span>

                <h3 className="mt-1.5 font-display text-2xl font-bold leading-tight sm:text-3xl md:text-4xl text-white">
                  {currentChapter.overlayTitle}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-white/80 sm:text-sm md:text-base">
                  {currentChapter.subtitle}
                </p>

                {currentChapter.quote && (
                  <p className="mt-2 font-display text-sm italic text-[var(--tai-saffron)] md:text-lg">
                    {currentChapter.quote}
                  </p>
                )}
              </div>
            </div>

            {/* Player Controls Bar */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/80 px-4 py-3 backdrop-blur-md md:px-8">
              {/* Scrub Line */}
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const percent = (e.clientX - rect.left) / rect.width
                  handleSeek(Math.floor(percent * totalDuration))
                }}
                className="relative mb-3 h-1.5 w-full cursor-pointer rounded-full bg-white/20 transition-all hover:h-2"
              >
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="size-4 fill-white" /> : <Play className="size-4 fill-white" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentTime(0)}
                    className="text-white/70 hover:text-white"
                    title="Restart from beginning"
                  >
                    <RotateCcw className="size-4" />
                  </button>

                  <span className="font-mono text-xs text-white/80">
                    Chapter: <strong className="text-white">{currentChapter.title}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="#fund"
                    className="hidden rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-deep sm:inline-flex items-center gap-1.5"
                  >
                    Help us take this to the next school
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Chapters Grid Below Player */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CHAPTERS.map((ch, idx) => {
            const isCurrent = currentTime >= ch.startSec && currentTime < ch.endSec
            return (
              <button
                key={idx}
                onClick={() => {
                  handleSeek(ch.startSec)
                  setIsPlaying(true)
                }}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                  isCurrent
                    ? 'border-brand bg-brand/10 text-brand ring-1 ring-brand/30'
                    : 'border-foreground/15 bg-card hover:border-foreground/30 hover:bg-muted text-muted-foreground'
                }`}
              >
                <span className="font-mono text-[10px] font-bold text-muted-foreground">
                  {ch.rangeLabel}
                </span>
                <span className="mt-1 text-xs font-bold text-foreground line-clamp-1">
                  {ch.title}
                </span>
              </button>
            )
          })}
        </div>

        {/* Bring Teach AI to Your School CTA */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-foreground/15 bg-card/60 p-6 sm:flex-row sm:px-8">
          <div>
            <h4 className="font-display text-xl font-bold text-foreground">
              Are you an educator, principal, or school leader?
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Every Teach AI session and curriculum kit is delivered completely free of cost to partner government schools.
            </p>
          </div>
          <Link
            href="/contact?intent=school"
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep"
          >
            Bring Teach AI to Your School
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
