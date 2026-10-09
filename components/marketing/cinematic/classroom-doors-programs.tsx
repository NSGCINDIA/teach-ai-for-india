'use client'

import { useState } from 'react'
import { DoorOpen, Sparkles, Code2, Palette, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgramDoor {
  id: string
  roomNumber: string
  doorTitle: string
  subtitle: string
  badge: string
  gradeLevel: string
  doorColor: string
  highlights: string[]
  takeaway: string
  sessionCount: string
}

const DOORS: ProgramDoor[] = [
  {
    id: 'door-basics',
    roomNumber: 'ROOM 101',
    doorTitle: 'AI BASICS',
    subtitle: 'Demystifying Machine Intelligence',
    badge: 'Foundations & Safety',
    gradeLevel: 'Class 6th – 8th',
    doorColor: 'from-[#3A5A40] to-[#283618]',
    highlights: [
      'What is AI? Demystifying algorithms without jargon',
      'The Anatomy of a Great Prompt: Context, Role, Task',
      'AI Ethics & Safety: Identifying truth from hallucination',
      'First Hands-On: Talking to an AI model in local language',
    ],
    takeaway: 'Students lose their hesitation and gain conversational AI fluency.',
    sessionCount: '2 Intensive Sessions · 4 Hands-On Hours',
  },
  {
    id: 'door-creativity',
    roomNumber: 'ROOM 102',
    doorTitle: 'AI CREATIVITY',
    subtitle: 'Visual Art, Stories & Voice',
    badge: 'Generative Media',
    gradeLevel: 'Class 8th – 10th',
    doorColor: 'from-[#9E2A2B] to-[#540B0E]',
    highlights: [
      'Generative Image Prompting: Lighting, styles, perspectives',
      'Multilingual Story Creation: Folklore & comic scripting',
      'Voice & Music Exploration: Bringing village tales alive',
      'Digital Hallway Showcase: Printing original student canvases',
    ],
    takeaway: 'Children realize their imagination can be instantly materialized into digital assets.',
    sessionCount: '3 Hands-On Workshops · Portfolio Project',
  },
  {
    id: 'door-future',
    roomNumber: 'ROOM 103',
    doorTitle: 'AI FUTURE',
    subtitle: 'Code, Agents & Real-World Projects',
    badge: 'Applied Problem Solving',
    gradeLevel: 'Class 10th – 12th',
    doorColor: 'from-[#22223B] to-[#121221]',
    highlights: [
      'Code Generation & Debugging with AI Assistants',
      'Building Community Web Prototypes: Health & Agriculture',
      'Understanding Agentic Workflows & Tool Use',
      'Career Pathways: Engineering, Data, and Tech Opportunities',
    ],
    takeaway: 'Students graduate from users to creators capable of building for their communities.',
    sessionCount: '4-Week Project Cohort · Certificate Awarded',
  },
]

export function ClassroomDoorsPrograms() {
  const [openDoorId, setOpenDoorId] = useState<string>('door-basics')

  return (
    <section
      id="scene-programs"
      aria-label="Teach AI Programs: Three Classroom Doors"
      className="relative w-full py-24 sm:py-32 bg-[#FAF8F5] text-[#1B1B1B] overflow-hidden border-b border-[#E2DDD5]"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#9E2A2B]/10 border border-[#9E2A2B]/20 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold">
            <DoorOpen className="size-3.5 text-[#9E2A2B]" />
            Curriculum &amp; Programs
          </span>
          <h2 className="mt-5 font-display text-4xl sm:text-6xl font-bold tracking-tight text-[#1B1B1B]">
            Three Doors. Three Learning Horizons.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#555] font-serif max-w-2xl mx-auto">
            Step through each classroom door to discover how our curriculum evolves from fundamental
            digital curiosity to real-world software creation.
          </p>
        </div>

        {/* ─── THREE SPATIAL CLASSROOM DOORS ───────────────────────────────── */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 perspective-[1200px]">
          {DOORS.map((door) => {
            const isOpen = openDoorId === door.id

            return (
              <div
                key={door.id}
                onClick={() => setOpenDoorId(door.id)}
                className="group relative flex flex-col rounded-3xl bg-white border-2 transition-all duration-500 cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1.5"
                style={{
                  borderColor: isOpen ? '#9E2A2B' : '#E2DDD5',
                }}
              >
                {/* ─── WOODEN DOOR HEADER / ROOF FRAME ─────────────────────── */}
                <div className={`p-6 sm:p-7 bg-gradient-to-br ${door.doorColor} text-white relative`}>
                  {/* Brass Room Number Plaque */}
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-3 py-1 rounded bg-black/40 border border-amber-300/40 text-amber-200 font-mono text-xs font-bold tracking-widest uppercase shadow">
                      {door.roomNumber}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full">
                      {door.gradeLevel}
                    </span>
                  </div>

                  <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
                    {door.doorTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/85 font-serif italic mt-1">
                    {door.subtitle}
                  </p>

                  {/* Brass Door Handle Graphic */}
                  <div className="absolute right-5 bottom-4 flex items-center gap-1.5">
                    <div className="w-8 h-2 rounded-full bg-amber-300 shadow border border-amber-400" />
                    <div className="size-3.5 rounded-full bg-amber-400 shadow-md" />
                  </div>
                </div>

                {/* ─── INSIDE THE DOOR: CURRICULUM REVEAL ───────────────────── */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] uppercase tracking-wider font-semibold mb-4">
                      {door.badge}
                    </span>

                    <ul className="space-y-3 font-sans text-sm text-[#444]">
                      {door.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 className="size-4 text-[#9E2A2B] shrink-0 mt-0.5" />
                          <span className="leading-snug">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bottom Takeaway Note */}
                  <div className="mt-6 pt-5 border-t border-[#ECE8E1]">
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC]">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#9E2A2B] font-bold block mb-1">
                        Core Outcome:
                      </span>
                      <p className="text-xs text-[#555] font-serif italic leading-relaxed">
                        &ldquo;{door.takeaway}&rdquo;
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#777]">
                      <span>{door.sessionCount}</span>
                      <span className="text-[#9E2A2B] font-semibold group-hover:underline">
                        {isOpen ? 'Door Open ✓' : 'Click to Open →'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
