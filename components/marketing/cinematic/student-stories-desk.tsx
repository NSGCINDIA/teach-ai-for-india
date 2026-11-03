'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BookOpen, Sparkles, Quote, MapPin, School, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StudentDossier {
  id: string
  name: string
  school: string
  grade: string
  location: string
  quote: string
  firstPrompt: string
  outcome: string
  photoUrl: string
  badge: string
}

const DOSSIERS: StudentDossier[] = [
  {
    id: 'priya',
    name: 'Priya K.',
    grade: 'Class 8th',
    school: 'MPPS Nandakramaguda',
    location: 'Telangana',
    quote:
      'I thought computers were only for typing names or playing pre-installed pinball. Today, I described a story about our village pond in Telugu, and the AI answered back and helped me write a whole poem.',
    firstPrompt: '“Ooru cheruvu gurinchi oka chinna katha rayi...” (Write a short story about the village pond)',
    outcome: 'Wrote an original 3-stanza environmental poem; presented to class.',
    photoUrl:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177864/IMG-20260406-WA0007_3_hboy0k.jpg',
    badge: 'Creative Storytelling',
  },
  {
    id: 'suresh',
    name: 'Suresh M.',
    grade: 'Class 9th',
    school: 'ZPHS Bachupally',
    location: 'Telangana',
    quote:
      'My brother said AI is only for software engineers in big glass buildings in Hitec City. When the NIAT brother sat next to me and showed me how prompts work, I felt like I was holding the steering wheel of the future.',
    firstPrompt: '“Explain how an airplane wing produces lift using simple cricket ball examples”',
    outcome: 'Built a 5-card illustrated science quiz for Class 6th students.',
    photoUrl:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177867/IMG_20260324_121056961_prkzll.jpg',
    badge: 'Science & Logic',
  },
  {
    id: 'ananya',
    name: 'Ananya R.',
    grade: 'Class 7th',
    school: 'Zilla Parishad High School',
    location: 'Telangana',
    quote:
      'The best moment was when we generated a picture of our school building floating among space stars. Everyone in the bench was laughing and cheering. We realized we can invent anything.',
    firstPrompt: '“A red-brick Indian school in space orbiting Jupiter with friendly robot teachers”',
    outcome: 'Digital artwork printed and framed on the school notice board.',
    photoUrl:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177877/DJI_20260711131020_0287_D_rvh8gg.jpg',
    badge: 'Digital Art',
  },
]

export function StudentStoriesDesk() {
  const [activeDossierId, setActiveDossierId] = useState('priya')
  const activeDossier = DOSSIERS.find((d) => d.id === activeDossierId) || DOSSIERS[0]

  return (
    <section
      id="scene-stories"
      aria-label="Student Stories: Tactile Classroom Dossiers"
      className="relative w-full py-24 sm:py-32 bg-[#FAF8F5] text-[#1B1B1B] overflow-hidden border-b border-[#E2DDD5]"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#9E2A2B]/10 border border-[#9E2A2B]/20 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold">
            <Quote className="size-3.5 text-[#9E2A2B]" />
            Classroom Voices
          </span>
          <h2 className="mt-5 font-display text-4xl sm:text-6xl font-bold tracking-tight text-[#1B1B1B]">
            Stories from the Benches
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#555] font-serif max-w-2xl mx-auto">
            Real notebook reflections from government school students who sat at the keyboard and
            experienced the joy of communicating with artificial intelligence.
          </p>
        </div>

        {/* ─── TACTILE NOTEBOOK / DESK DOSSIER DISPLAY ───────────────────────── */}
        <div className="mt-14 sm:mt-18 bg-white rounded-3xl border-2 border-[#E2DDD5] shadow-2xl p-6 sm:p-10 relative overflow-hidden">
          {/* Lined notebook header margin line */}
          <div className="absolute top-0 inset-x-0 h-3 bg-[#9E2A2B]" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-3">
            {/* Left Photo Polaroid with Tape (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden border-4 border-white shadow-xl rotate-[-1.5deg] group hover:rotate-0 transition-transform duration-300">
                <Image
                  src={activeDossier.photoUrl}
                  alt={activeDossier.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="font-mono text-[11px] uppercase tracking-wider bg-[#9E2A2B] px-2 py-0.5 rounded text-white font-bold">
                    {activeDossier.badge}
                  </span>
                  <div className="font-display text-lg font-bold mt-1">
                    {activeDossier.name} · {activeDossier.grade}
                  </div>
                </div>
              </div>

              {/* Selector Tabs Underneath */}
              <div className="mt-6 flex items-center justify-center gap-2">
                {DOSSIERS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setActiveDossierId(d.id)}
                    className={cn(
                      'px-4 py-1.5 rounded-full font-mono text-xs transition-all cursor-pointer border',
                      activeDossierId === d.id
                        ? 'bg-[#9E2A2B] text-white border-[#9E2A2B] font-bold shadow-md'
                        : 'bg-[#FAF8F5] text-[#555] border-[#E2DDD5] hover:border-[#9E2A2B]'
                    )}
                  >
                    {d.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Handwritten Notebook Page (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#777] pb-3 border-b border-[#ECE8E1]">
                  <span className="flex items-center gap-1.5 text-[#9E2A2B] font-semibold">
                    <School className="size-3.5" />
                    {activeDossier.school}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {activeDossier.location}
                  </span>
                </div>

                <div className="mt-5 relative">
                  <Quote className="size-10 text-[#9E2A2B]/20 absolute -top-3 -left-3 pointer-events-none" />
                  <p className="font-serif text-xl sm:text-2xl text-[#1B1B1B] italic leading-relaxed pl-6">
                    &ldquo;{activeDossier.quote}&rdquo;
                  </p>
                </div>

                {/* The First Prompt Section */}
                <div className="mt-6 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DC]">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#9E2A2B] font-bold block mb-1">
                    First Recorded Prompt:
                  </span>
                  <p className="font-mono text-xs sm:text-sm text-[#333] italic">
                    {activeDossier.firstPrompt}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs font-mono text-[#666]">
                  <span className="font-bold text-emerald-700">Artifact Created:</span>
                  <span>{activeDossier.outcome}</span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[#ECE8E1] flex items-center justify-between font-mono text-xs text-[#888]">
                <span>Verified Classroom Entry</span>
                <span className="text-[#9E2A2B] font-semibold">Pass It Forward ✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
