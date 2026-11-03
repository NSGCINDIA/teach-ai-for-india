'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Chapter {
  id: string
  label: string
  sublabel: string
}

const CHAPTERS: Chapter[] = [
  { id: 'scene-entrance', label: 'ENTER', sublabel: 'School' },
  { id: 'scene-chalkboard', label: 'CHALKBOARD', sublabel: 'Signature' },
  { id: 'scene-mission', label: 'MISSION', sublabel: 'Purpose' },
  { id: 'scene-why-ai', label: 'WHY AI', sublabel: 'Student' },
  { id: 'scene-programs', label: 'PROGRAMS', sublabel: 'Doors' },
  { id: 'scene-pedagogy', label: 'PEDAGOGY', sublabel: 'How We Teach' },
  { id: 'scene-impact', label: 'IMPACT', sublabel: '1,842+ Reached' },
  { id: 'scene-india-map', label: 'INDIA', sublabel: 'Movement' },
  { id: 'scene-stories', label: 'STORIES', sublabel: 'Voices' },
  { id: 'scene-gallery', label: 'NOTICE BOARD', sublabel: 'Classroom' },
  { id: 'scene-pathways', label: 'GET INVOLVED', sublabel: 'Paths' },
  { id: 'scene-sunset', label: 'THE FUTURE', sublabel: 'Next Step' },
]

export function StoryProgressRail() {
  const [activeChapter, setActiveChapter] = useState('scene-entrance')
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0
      setScrollProgress(progress)

      // Only show the rail after the initial viewport scroll has started
      setIsVisible(scrollY > 250)

      // Find current active section
      for (let i = CHAPTERS.length - 1; i >= 0; i--) {
        const el = document.getElementById(CHAPTERS[i].id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= window.innerHeight * 0.45) {
            setActiveChapter(CHAPTERS[i].id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (!isVisible) return null

  return (
    <aside
      aria-label="Story Chapter Progress"
      className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-end gap-2 pointer-events-auto select-none transition-opacity duration-500"
    >
      {/* Subtle vertical indicator bar */}
      <div className="relative flex flex-col items-end gap-3.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 px-3 py-4 shadow-2xl">
        {CHAPTERS.map((c, i) => {
          const isActive = activeChapter === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => scrollTo(c.id)}
              className="group relative flex items-center justify-end gap-2.5 py-0.5 cursor-pointer focus:outline-none"
              title={`${c.label} · ${c.sublabel}`}
            >
              {/* Tooltip on hover */}
              <span
                className={cn(
                  'pointer-events-none absolute right-7 top-1/2 -translate-y-1/2 whitespace-nowrap rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider backdrop-blur-md transition-all duration-200',
                  isActive
                    ? 'opacity-100 bg-amber-400 text-black font-bold scale-100'
                    : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 bg-black/80 text-white/90 border border-white/10'
                )}
              >
                {c.label} · <span className="opacity-75">{c.sublabel}</span>
              </span>

              {/* Progress Pip */}
              <div
                className={cn(
                  'rounded-full transition-all duration-300',
                  isActive
                    ? 'w-6 h-1.5 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                    : 'size-1.5 bg-white/35 group-hover:bg-white/80 group-hover:scale-125'
                )}
              />
            </button>
          )
        })}
      </div>

      {/* Percentage ticker */}
      <span className="font-mono text-[9px] uppercase tracking-widest text-white/50 pr-1">
        {Math.round(scrollProgress * 100)}%
      </span>
    </aside>
  )
}
