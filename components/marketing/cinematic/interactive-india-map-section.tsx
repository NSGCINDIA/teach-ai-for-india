'use client'

import { useState } from 'react'
import { MapPin, Navigation, School, Sparkles, Building2 } from 'lucide-react'
import {
  INDIA_VIEWBOX,
  INDIA_MUTED_PATH,
  TELANGANA_PATH,
  ANDHRA_PRADESH_PATH,
} from '@/components/marketing/india-map-paths'
import { cn } from '@/lib/utils'

interface LocationHub {
  id: string
  name: string
  state: 'Telangana' | 'Andhra Pradesh'
  x: number // svg coordinate
  y: number // svg coordinate
  schoolsReached: string
  studentsAddressed: string
  campusChapter: string
  notableSchool: string
}

const LOCATION_HUBS: LocationHub[] = [
  {
    id: 'nandakramaguda',
    name: 'Nandakramaguda & Financial District',
    state: 'Telangana',
    x: 216,
    y: 375,
    schoolsReached: '3 Schools',
    studentsAddressed: '380+ Students',
    campusChapter: 'NIAT Central',
    notableSchool: 'MPPS Nandakramaguda (The Genesis Classroom)',
  },
  {
    id: 'bachupally',
    name: 'Bachupally & Miyapur Hub',
    state: 'Telangana',
    x: 211,
    y: 368,
    schoolsReached: '4 Schools',
    studentsAddressed: '420+ Students',
    campusChapter: 'NIAT KKH Chapter',
    notableSchool: 'ZPHS Bachupally High School',
  },
  {
    id: 'rangareddy',
    name: 'Rangareddy Rural Hub',
    state: 'Telangana',
    x: 228,
    y: 378,
    schoolsReached: '2 Schools',
    studentsAddressed: '240+ Students',
    campusChapter: 'NIAT Aurora Chapter',
    notableSchool: 'Zilla Parishad High School',
  },
  {
    id: 'chevella',
    name: 'Chevella & Moinabad Belt',
    state: 'Telangana',
    x: 203,
    y: 382,
    schoolsReached: '3 Schools',
    studentsAddressed: '290+ Students',
    campusChapter: 'NIAT Chevella Chapter',
    notableSchool: 'MPPS Chevella Rural High School',
  },
  {
    id: 'vijayawada',
    name: 'Vijayawada & Krishna District',
    state: 'Andhra Pradesh',
    x: 265,
    y: 405,
    schoolsReached: '3 Schools',
    studentsAddressed: '260+ Students',
    campusChapter: 'NIAT AP East Hub',
    notableSchool: 'ZPHS Penamaluru & Vijayawada Municipal Schools',
  },
  {
    id: 'guntur',
    name: 'Guntur & Amaravati Hub',
    state: 'Andhra Pradesh',
    x: 254,
    y: 420,
    schoolsReached: '2 Schools',
    studentsAddressed: '160+ Students',
    campusChapter: 'NIAT Guntur Chapter',
    notableSchool: 'Zilla Parishad High School, Mangalagiri',
  },
  {
    id: 'vizag',
    name: 'Visakhapatnam Coastal Hub',
    state: 'Andhra Pradesh',
    x: 322,
    y: 360,
    schoolsReached: '2 Schools',
    studentsAddressed: '180+ Students',
    campusChapter: 'NIAT Vizag Coastal',
    notableSchool: 'ZPHS Anandapuram & Bheemunipatnam',
  },
]

export function InteractiveIndiaMapSection() {
  const [activeHubId, setActiveHubId] = useState<string>('nandakramaguda')
  const activeHub = LOCATION_HUBS.find((h) => h.id === activeHubId) || LOCATION_HUBS[0]

  return (
    <section
      id="scene-india-map"
      aria-label="Interactive Map: From One Classroom to Across India"
      className="relative w-full py-24 sm:py-32 bg-[#FAF8F5] text-[#1B1B1B] overflow-hidden border-b border-[#E2DDD5]"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#9E2A2B]/20 bg-[#9E2A2B]/10 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold">
            <Navigation className="size-3.5 text-[#9E2A2B]" />
            National Movement
          </span>
          <h2 className="mt-5 font-display text-4xl sm:text-6xl font-bold tracking-tight text-[#1B1B1B] leading-tight">
            From One Classroom to Across India
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#555] font-serif max-w-2xl mx-auto">
            What started in a single room at MPPS Nandakramaguda has expanded into a student-led
            network across Telangana and Andhra Pradesh, with new campus chapters expanding monthly.
          </p>
        </div>

        {/* ─── MAP & HUB INTERACTION STAGE ─────────────────────────────────── */}
        <div className="mt-14 sm:mt-18 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: SVG Map (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E2DDD5] p-5 sm:p-8 relative shadow-lg overflow-hidden flex flex-col items-center">
            {/* Subtle warm ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-[#E09F3E]/10 via-[#9E2A2B]/5 to-transparent blur-[80px] rounded-full pointer-events-none" />

            {/* Map title bar */}
            <div className="w-full flex items-center justify-between text-xs font-mono pb-3 border-b border-[#EAE6DE]">
              <span className="flex items-center gap-2 text-[#9E2A2B] font-semibold uppercase tracking-wider">
                <span className="size-2 rounded-full bg-[#9E2A2B] animate-pulse" />
                <span>Active Regional Clusters</span>
              </span>
              <span className="text-[#777]">Telangana &amp; Andhra Pradesh</span>
            </div>

            {/* SVG India Map */}
            <div className="relative w-full max-w-[480px] aspect-square py-4">
              <svg
                viewBox={INDIA_VIEWBOX}
                className="w-full h-full drop-shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
              >
                {/* Muted Rest of India Path (Parchment Sand) */}
                <path
                  d={INDIA_MUTED_PATH}
                  fill="#ECE7DF"
                  stroke="#DDD5C7"
                  strokeWidth="1"
                  className="transition-colors duration-300"
                />

                {/* Telangana Active State Path (TAI Crimson/Maroon) */}
                <path
                  d={TELANGANA_PATH}
                  fill="#9E2A2B"
                  stroke="#7D1F20"
                  strokeWidth="1.8"
                  className="transition-all duration-300 hover:fill-[#B33233] cursor-pointer drop-shadow-sm"
                />

                {/* Andhra Pradesh Active State Path (Warm Saffron Gold) */}
                <path
                  d={ANDHRA_PRADESH_PATH}
                  fill="#E09F3E"
                  stroke="#C4852B"
                  strokeWidth="1.8"
                  className="transition-all duration-300 hover:fill-[#EAB055] cursor-pointer drop-shadow-sm"
                />

                {/* Connection lines from Origin Hub (Nandakramaguda) to other hubs */}
                {LOCATION_HUBS.map((hub) => {
                  if (hub.id === 'nandakramaguda') return null
                  const origin = LOCATION_HUBS[0]
                  return (
                    <line
                      key={`line-${hub.id}`}
                      x1={origin.x}
                      y1={origin.y}
                      x2={hub.x}
                      y2={hub.y}
                      stroke="#9E2A2B"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                      opacity="0.35"
                    />
                  )
                })}

                {/* Interactive Location Hub Pins */}
                {LOCATION_HUBS.map((hub) => {
                  const isSelected = activeHubId === hub.id
                  return (
                    <g
                      key={hub.id}
                      onClick={() => setActiveHubId(hub.id)}
                      className="cursor-pointer group"
                    >
                      {/* Outer pulse */}
                      <circle
                        cx={hub.x}
                        cy={hub.y}
                        r={isSelected ? 10 : 6}
                        fill={isSelected ? 'rgba(158, 42, 43, 0.15)' : 'none'}
                        stroke={isSelected ? '#9E2A2B' : '#E09F3E'}
                        strokeWidth="1.8"
                        opacity={isSelected ? 0.9 : 0.7}
                        className={isSelected ? 'animate-ping' : ''}
                      />
                      {/* Center pin */}
                      <circle
                        cx={hub.x}
                        cy={hub.y}
                        r={isSelected ? 5 : 3.5}
                        fill={isSelected ? '#9E2A2B' : '#E09F3E'}
                        stroke="#FFFFFF"
                        strokeWidth="1"
                        className="transition-all duration-200 group-hover:scale-125 drop-shadow-xs"
                      />
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Bottom Legend */}
            <div className="w-full pt-3 border-t border-[#EAE6DE] flex flex-wrap items-center justify-between text-[11px] font-mono text-[#666]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded bg-[#9E2A2B]" /> Telangana Chapter
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded bg-[#E09F3E]" /> Andhra Pradesh Chapter
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[#E09F3E] border border-white" /> School Hubs
                </span>
              </div>
              <span className="text-[#9E2A2B] font-semibold">Click pin to inspect</span>
            </div>
          </div>

          {/* Right: Hub Spotlight Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="bg-white border border-[#E2DDD5] rounded-3xl p-6 sm:p-8 shadow-xl relative">
              <div className="flex items-center justify-between text-xs font-mono pb-3 border-b border-[#EAE6DE]">
                <span className="text-[#9E2A2B] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {activeHub.state}
                </span>
                <span className="text-[#777]">{activeHub.campusChapter}</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B1B1B] mt-4 leading-snug">
                {activeHub.name}
              </h3>

              <div className="mt-4 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#9E2A2B] block mb-1 font-bold">
                  Primary Partner School:
                </span>
                <p className="text-sm font-sans font-medium text-[#222]">
                  {activeHub.notableSchool}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1]">
                  <span className="text-xs font-mono text-[#777] uppercase block font-semibold">Reach</span>
                  <span className="font-sans text-2xl font-bold text-[#9E2A2B] mt-1 block">
                    {activeHub.studentsAddressed}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1]">
                  <span className="text-xs font-mono text-[#777] uppercase block font-semibold">Institutions</span>
                  <span className="font-sans text-2xl font-bold text-[#2D5A27] mt-1 block">
                    {activeHub.schoolsReached}
                  </span>
                </div>
              </div>

              <p className="mt-6 text-xs sm:text-sm text-[#555] font-sans leading-relaxed">
                Autonomous student volunteers from local engineering campuses coordinate directly with
                school administrations for weekly workshops, providing curriculum workbooks and
                hardware access.
              </p>
            </div>

            {/* Quick Location Pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              {LOCATION_HUBS.map((hub) => (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => setActiveHubId(hub.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full font-mono text-xs transition-colors cursor-pointer border',
                    activeHubId === hub.id
                      ? 'bg-[#9E2A2B] text-white border-[#9E2A2B] font-bold shadow-xs'
                      : 'bg-white text-[#555] border-[#E2DDD5] hover:border-[#9E2A2B]/40 hover:text-[#1B1B1B]'
                  )}
                >
                  {hub.name.split('&')[0].trim()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
