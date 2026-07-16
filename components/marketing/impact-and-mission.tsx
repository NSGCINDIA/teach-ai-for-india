'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, MapPin, Users, GraduationCap, PlayCircle, Building2, Landmark, CheckCircle } from 'lucide-react'
import { AnimatedCounter } from '@/components/shared/animated-counter'
import { SectionHeading } from '@/components/shared/section-heading'
import { Reveal } from '@/components/marketing/reveal'
import type { PublicImpactStats } from '@/types/database'
import type { MissionContent } from '@/app/(public)/content'

interface CampusHotspot {
  id: string
  name: string
  fullName: string
  city: string
  state: string
  volunteers: number
  schools: number
  x: number // SVG X coordinate
  y: number // SVG Y coordinate
}

const CAMPUSES: CampusHotspot[] = [
  { id: 'niat-kkh', name: 'NIAT × KKH', fullName: 'NIAT × KKH Campus', city: 'Hyderabad', state: 'Telangana', volunteers: 95, schools: 10, x: 238, y: 185 },
  { id: 'niat-cdu', name: 'NIAT × CDU', fullName: 'NIAT × Chaitanya (CDU)', city: 'Hyderabad', state: 'Telangana', volunteers: 88, schools: 10, x: 232, y: 192 },
  { id: 'niat-aurora', name: 'NIAT × Aurora', fullName: 'NIAT × Aurora Deemed University', city: 'Hyderabad', state: 'Telangana', volunteers: 74, schools: 8, x: 244, y: 182 },
  { id: 'niat-chevella', name: 'NIAT × Chevella', fullName: 'NIAT × Chevella Campus', city: 'Chevella', state: 'Telangana', volunteers: 52, schools: 6, x: 246, y: 196 },
  { id: 'niat-nsrit', name: 'NIAT × NSRIT', fullName: 'Nadimpalli Satyanarayana Raju Institute of Tech', city: 'Visakhapatnam', state: 'Andhra Pradesh', volunteers: 60, schools: 6, x: 270, y: 172 },
]

export function ImpactAndMission({
  stats,
  mission,
}: {
  stats: PublicImpactStats
  mission: MissionContent
}) {
  const [activeCampus, setActiveCampus] = useState<CampusHotspot | null>(null)

  const getPillarColor = (iconName: string) => {
    if (iconName === 'Sparkles') return 'group-hover:border-brand-teal group-hover:shadow-brand-teal/10'
    if (iconName === 'MapPin') return 'group-hover:border-brand-orange group-hover:shadow-brand-orange/10'
    return 'group-hover:border-brand group-hover:shadow-brand/10'
  }

  const getPillarIconBg = (iconName: string) => {
    if (iconName === 'Sparkles') return 'bg-brand-teal/10 text-brand-teal group-hover:bg-brand-teal group-hover:text-white'
    if (iconName === 'MapPin') return 'bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange group-hover:text-white'
    return 'bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white'
  }

  return (
    <section className="section-padding relative overflow-hidden bg-transparent">
      {/* Dynamic inline styles for SVG beam and sonar animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dash-travel {
          to {
            stroke-dashoffset: -24;
          }
        }
        @keyframes sonar-wave {
          0% { r: 6px; opacity: 1; stroke-width: 3px; }
          50% { opacity: 0.5; }
          100% { r: 60px; opacity: 0; stroke-width: 1px; }
        }
        .animated-beam {
          stroke-dasharray: 8, 8;
          animation: dash-travel 1.4s linear infinite;
        }
      `}} />

      <div className="container-wide relative z-10">

        {/* Section Header */}
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brand mb-4">
              <Sparkles className="size-3.5 animate-pulse text-brand" /> Our Impact & Vision
            </span>
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl md:text-5xl tracking-tight text-foreground">
              Empowering Government Schools with AI
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed text-balance">
              We bootstrap college student volunteers to build AI labs and deliver hands-on coding and prompt-engineering workshops in regions with near-zero AI exposure.
            </p>
          </div>
        </Reveal>

        {/* 2-Column Split Hub */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">

          {/* ── LEFT SIDE: Pulsing SVG India Map ── */}
          <div className="lg:col-span-6 relative flex flex-col items-center">
            <Reveal className="w-full">
              <div className="relative w-full aspect-[4/3] rounded-3xl bg-card border border-border/80 p-6 shadow-soft backdrop-blur-sm overflow-hidden flex flex-col justify-between">

                {/* Map Title/Overlay */}
                <div className="z-10 text-left select-none">
                  <h4 className="font-display font-bold text-sm text-foreground">Active Campus Network</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Hover or tap on pulsing markers to inspect</p>
                </div>

                {/* SVG Visual Map */}
                <div className="absolute inset-0 flex items-center justify-center p-8 select-none">
                  <svg className="w-full h-full max-h-[250px]" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <clipPath id="map-clip">
                        <rect x="120" y="10" width="260" height="232" />
                      </clipPath>
                    </defs>

                    {/* SVG India Map image outline layer */}
                    <image
                      href="/india_map_outline.png"
                      x="120"
                      y="10"
                      width="260"
                      height="260"
                      clipPath="url(#map-clip)"
                      className="opacity-75 dark:invert dark:opacity-60 mix-blend-multiply dark:mix-blend-screen"
                    />

                    {/* State Callout label lines & indicators */}
                    <g className="opacity-60 dark:opacity-40">
                      {/* Telangana callout */}
                      <line x1="155" y1="195" x2="242" y2="190" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="text-muted-foreground" />
                      <circle cx="155" cy="195" r="1.5" className="fill-muted-foreground" />
                      <text x="100" y="198" className="font-sans text-[9px] font-bold tracking-wider fill-muted-foreground">Telangana</text>

                      {/* Andhra callout */}
                      <line x1="320" y1="210" x2="265" y2="190" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="text-muted-foreground" />
                      <circle cx="320" cy="210" r="1.5" className="fill-muted-foreground" />
                      <text x="325" y="213" className="font-sans text-[9px] font-bold tracking-wider fill-muted-foreground">Andhra Pradesh</text>
                    </g>

                    {/* Sonar waves originating from Hyderabad cluster */}
                    <circle cx="242" cy="190" r="8" fill="none" className="stroke-brand/30 dark:stroke-brand/20" style={{ animation: 'sonar-wave 3s cubic-bezier(0.1, 0.8, 0.3, 1) infinite' }} />
                    <circle cx="242" cy="190" r="8" fill="none" className="stroke-brand/20 dark:stroke-brand/10" style={{ animation: 'sonar-wave 3s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 1.5s' }} />

                    {/* Sonar waves originating from Visakhapatnam cluster */}
                    <circle cx="270" cy="172" r="8" fill="none" className="stroke-brand-teal/30 dark:stroke-brand-teal/20" style={{ animation: 'sonar-wave 3.5s cubic-bezier(0.1, 0.8, 0.3, 1) infinite' }} />

                    {/* Network Beams/Lines connecting Hyderabad and Visakhapatnam */}
                    <path
                      d="M 242,190 Q 255,165 270,172"
                      fill="none"
                      className="stroke-brand/40 dark:stroke-brand/30 stroke-1.5 animated-beam"
                    />

                    {/* Pulsing Hotspots */}
                    {CAMPUSES.map((c) => {
                      const isActive = activeCampus?.id === c.id
                      return (
                        <g
                          key={c.id}
                          className="cursor-pointer group/node"
                          onMouseEnter={() => setActiveCampus(c)}
                          onMouseLeave={() => setActiveCampus(null)}
                          onClick={() => setActiveCampus(isActive ? null : c)}
                        >
                          {/* Invisible larger hit target to make hover effortless */}
                          <circle
                            cx={c.x}
                            cy={c.y}
                            r={18}
                            fill="transparent"
                          />
                          {/* Pulsing outer aura */}
                          <circle
                            cx={c.x}
                            cy={c.y}
                            r={isActive ? 14 : 7}
                            className={`fill-brand/20 dark:fill-brand/35 transition-all duration-300 ${c.id === 'niat-nsrit' ? 'fill-brand-teal/25' : 'fill-brand-orange/25'
                              } ${!isActive && 'animate-ping'}`}
                          />
                          {/* Inner glowing core */}
                          <circle
                            cx={c.x}
                            cy={c.y}
                            r={isActive ? 5 : 3.5}
                            className={`transition-all duration-300 ${c.id === 'niat-nsrit' ? 'fill-brand-teal' : 'fill-brand-orange'
                              } group-hover/node:scale-125`}
                          />
                        </g>
                      )
                    })}
                  </svg>
                </div>

                {/* Floating Map Tooltip Modal */}
                <AnimatePresence>
                  {activeCampus && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-4 left-4 right-4 bg-background/95 dark:bg-card/95 border border-border/80 backdrop-blur-md p-4 rounded-2xl shadow-lg z-20 flex gap-3 text-left items-start"
                    >
                      <div className={`grid size-9 place-items-center rounded-xl shrink-0 ${activeCampus.id === 'niat-nsrit' ? 'bg-brand-teal/15 text-brand-teal' : 'bg-brand-orange/15 text-brand-orange'
                        }`}>
                        {activeCampus.id === 'niat-nsrit' ? <Landmark size={18} /> : <Building2 size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-display font-extrabold text-[14px] text-foreground truncate">{activeCampus.fullName}</h5>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">{activeCampus.city}, {activeCampus.state}</p>
                        <div className="mt-2.5 flex items-center gap-4 text-xs font-semibold">
                          <div className="flex items-center gap-1 text-brand">
                            <Users size={12} />
                            <span>{activeCampus.volunteers} Volunteers</span>
                          </div>
                          <div className="flex items-center gap-1 text-brand-teal">
                            <GraduationCap size={12} />
                            <span>{activeCampus.schools} Schools Served</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Map Bottom Legend */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-auto z-10 border-t border-border/40 pt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-brand-orange" />
                    <span>Telangana Core</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-brand-teal" />
                    <span>Coastal Andhra</span>
                  </div>
                </div>

              </div>
            </Reveal>
          </div>

          {/* ── RIGHT SIDE: Glassmorphic Mission Pillar Cards ── */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            {mission.items.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1}>
                <article
                  className={`group relative flex items-start gap-5 rounded-2xl border border-border bg-card/65 dark:bg-card/25 p-6 shadow-soft transition-all duration-300 hover:translate-y-[-2px] hover:shadow-soft-lg ${getPillarColor(
                    item.icon
                  )}`}
                >
                  {/* Left Column Icon */}
                  <span className={`grid size-12 place-items-center rounded-xl shrink-0 transition-colors duration-300 ${getPillarIconBg(
                    item.icon
                  )}`}>
                    {item.icon === 'Sparkles' && <Sparkles className="size-6" />}
                    {item.icon === 'MapPin' && <MapPin className="size-6" />}
                    {item.icon === 'Users' && <Users className="size-6" />}
                  </span>

                  {/* Right Column Content */}
                  <div className="text-left flex-1 min-w-0">
                    <h3 className="font-display text-lg font-extrabold text-foreground group-hover:text-brand transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

        </div>

        {/* ── BOTTOM HUB: Dynamic Glassmorphic Stats Grid ── */}
        <Reveal className="mt-20">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-5">
            
            {/* Stat 1: Schools Reached */}
            <div className="group relative flex flex-col items-center gap-3 bg-card/65 dark:bg-card/25 backdrop-blur border border-border/80 rounded-2xl p-6 shadow-soft hover:shadow-soft-lg hover:-translate-y-1.5 hover:border-brand/40 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <span className="grid size-12 place-items-center rounded-xl bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white transition-all duration-300 shadow-sm">
                <GraduationCap className="size-6" />
              </span>
              <AnimatedCounter
                value={stats.schools_reached}
                className="font-display text-3xl font-extrabold tabular-nums md:text-4.5xl text-foreground"
              />
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">Schools Reached</span>
            </div>

            {/* Stat 2: Students Impacted */}
            <div className="group relative flex flex-col items-center gap-3 bg-card/65 dark:bg-card/25 backdrop-blur border border-border/80 rounded-2xl p-6 shadow-soft hover:shadow-soft-lg hover:-translate-y-1.5 hover:border-brand-orange/40 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-brand-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <span className="grid size-12 place-items-center rounded-xl bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all duration-300 shadow-sm">
                <Users className="size-6" />
              </span>
              <AnimatedCounter
                value={stats.students_impacted}
                className="font-display text-3xl font-extrabold tabular-nums md:text-4.5xl text-foreground"
              />
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">Students Taught</span>
            </div>

            {/* Stat 3: Sessions Completed */}
            <div className="group relative flex flex-col items-center gap-3 bg-card/65 dark:bg-card/25 backdrop-blur border border-border/80 rounded-2xl p-6 shadow-soft hover:shadow-soft-lg hover:-translate-y-1.5 hover:border-brand-teal/40 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-brand-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <span className="grid size-12 place-items-center rounded-xl bg-brand-teal/10 text-brand-teal group-hover:bg-brand-teal group-hover:text-white transition-all duration-300 shadow-sm">
                <PlayCircle className="size-6" />
              </span>
              <AnimatedCounter
                value={stats.sessions_completed}
                className="font-display text-3xl font-extrabold tabular-nums md:text-4.5xl text-foreground"
              />
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">Hours Delivered</span>
            </div>

            {/* Stat 4: Active Campuses */}
            <div className="group relative flex flex-col items-center gap-3 bg-card/65 dark:bg-card/25 backdrop-blur border border-border/80 rounded-2xl p-6 shadow-soft hover:shadow-soft-lg hover:-translate-y-1.5 hover:border-brand/40 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <span className="grid size-12 place-items-center rounded-xl bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white transition-all duration-300 shadow-sm">
                <Building2 className="size-6" />
              </span>
              <AnimatedCounter
                value={stats.active_campuses}
                className="font-display text-3xl font-extrabold tabular-nums md:text-4.5xl text-foreground"
              />
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">Active Campuses</span>
            </div>

            {/* Stat 5: States Covered */}
            <div className="group relative flex flex-col items-center gap-3 bg-card/65 dark:bg-card/25 backdrop-blur border border-border/80 rounded-2xl p-6 shadow-soft hover:shadow-soft-lg hover:-translate-y-1.5 hover:border-brand-orange/40 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-brand-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <span className="grid size-12 place-items-center rounded-xl bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all duration-300 shadow-sm">
                <MapPin className="size-6" />
              </span>
              <AnimatedCounter
                value={stats.states_count}
                className="font-display text-3xl font-extrabold tabular-nums md:text-4.5xl text-foreground"
              />
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">States Covered</span>
            </div>

          </div>
        </Reveal>

      </div>
    </section>
  )
}
