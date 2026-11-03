'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GraduationCap, School, Building, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Pathway {
  id: string
  doorTag: string
  title: string
  targetAudience: string
  description: string
  actionLabel: string
  actionHref: string
  perks: string[]
  icon: typeof GraduationCap
  accentColor: string
}

const PATHWAYS: Pathway[] = [
  {
    id: 'teach',
    doorTag: 'PATHWAY 01',
    title: 'BECOME A MENTOR',
    targetAudience: 'For College & Engineering Students',
    description:
      'Join an active NIAT campus chapter or launch one at your university. Receive complete pedagogical training, slide decks, and lesson plans to teach in local schools.',
    actionLabel: 'Apply as Student Mentor',
    actionHref: '/join',
    perks: [
      'Official NIAT × TAI Leadership Certificate',
      'Curated AI teaching toolkit & Telugu/English slides',
      'Real ground-level teaching experience before graduating',
    ],
    icon: GraduationCap,
    accentColor: '#9E2A2B',
  },
  {
    id: 'school',
    doorTag: 'PATHWAY 02',
    title: 'HOST IN YOUR SCHOOL',
    targetAudience: 'For Headmasters & Educators',
    description:
      'Invite Teach AI for India to your government high school or Mandal Parishad school. Our student volunteers bring all hardware, workbooks, and guidance at zero cost to the school.',
    actionLabel: 'Request a School Workshop',
    actionHref: '/contact?role=school',
    perks: [
      '100% Free: No fees or financial commitment required',
      'Curriculum tailored to Classes 6th through 10th',
      'Leave-behind printed AI prompt playbooks for teachers',
    ],
    icon: School,
    accentColor: '#2D5A27',
  },
  {
    id: 'partner',
    doorTag: 'PATHWAY 03',
    title: 'PARTNER OR SPONSOR',
    targetAudience: 'For CSR & Industry Leaders',
    description:
      'Support the expansion of Teach AI for India to 100+ schools. Fund hardware kits, student workbooks, travel stipends, and localized curriculum translations.',
    actionLabel: 'Explore Institutional Partnership',
    actionHref: '/contact?role=partner',
    perks: [
      'Verified classroom impact reporting & student metrics',
      'Direct hardware / device kit attribution',
      'Employee volunteer engagement opportunities',
    ],
    icon: Building,
    accentColor: '#E09F3E',
  },
]

export function ThreePathwaysSection() {
  const [selectedPathId, setSelectedPathId] = useState('teach')

  return (
    <section
      id="scene-pathways"
      aria-label="Get Involved: Three Classroom Pathways"
      className="relative w-full py-24 sm:py-32 bg-[#0C120E] text-white overflow-hidden border-b border-white/10"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-950/60 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-amber-300 backdrop-blur-md">
            <Sparkles className="size-3.5 text-amber-400" />
            Choose Your Pathway
          </span>
          <h2 className="mt-5 font-display text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            Choose Your Door into the Movement
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/75 font-serif max-w-2xl mx-auto">
            Whether you are a student ready to teach, a headmaster eager to open your classroom doors,
            or a partner looking to sponsor learning kits — there is an open door for you.
          </p>
        </div>

        {/* ─── THREE SPATIAL DOORWAY CARDS ─────────────────────────────────── */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PATHWAYS.map((path) => {
            const Icon = path.icon
            const isSelected = selectedPathId === path.id

            return (
              <div
                key={path.id}
                onClick={() => setSelectedPathId(path.id)}
                className={cn(
                  'flex flex-col justify-between rounded-3xl p-8 border-2 transition-all duration-300 cursor-pointer shadow-xl relative overflow-hidden',
                  isSelected
                    ? 'bg-gradient-to-b from-white/15 to-white/5 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.2)] -translate-y-2'
                    : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs uppercase tracking-widest text-amber-300 font-bold">
                      {path.doorTag}
                    </span>
                    <div
                      className="size-11 rounded-xl flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: path.accentColor }}
                    >
                      <Icon className="size-5" />
                    </div>
                  </div>

                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {path.title}
                  </h3>
                  <span className="font-mono text-xs text-white/60 block mt-1 uppercase tracking-wider">
                    {path.targetAudience}
                  </span>

                  <p className="mt-4 text-sm text-white/80 leading-relaxed font-sans">
                    {path.description}
                  </p>

                  <div className="mt-6 pt-5 border-t border-white/10 space-y-2.5">
                    {path.perks.map((p, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-white/90">
                        <CheckCircle2 className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <Link
                    href={path.actionHref}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black transition-all hover:bg-amber-400 hover:shadow-lg text-sm"
                  >
                    <span>{path.actionLabel}</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
