'use client'

import { useState, useMemo } from 'react'
import type { PublicCampusCard } from '@/types/database'
import { CampusCard } from '@/components/shared/campus-card'
import { Search, MapPin, Sparkles, GraduationCap, Users, Landmark, ZoomIn, ZoomOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CampusesDashboardProps {
  campuses: PublicCampusCard[]
}

const MAP_COORDS: Record<string, { x: number; y: number }> = {
  'griet': { x: 218, y: 185 },
  'cbit': { x: 212, y: 192 },
  'vnr-vjiet': { x: 224, y: 182 },
  'mgit': { x: 228, y: 188 },
  'cvr': { x: 226, y: 196 },
  'vasavi': { x: 220, y: 194 },
  'snist': { x: 216, y: 178 },
  'mvsr': { x: 210, y: 184 },
  'auce': { x: 258, y: 172 }
}

export function CampusesDashboard({ campuses }: CampusesDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedState, setSelectedState] = useState<'all' | 'Telangana' | 'Andhra Pradesh'>('all')
  const [hoveredCampusSlug, setHoveredCampusSlug] = useState<string | null>(null)
  const [selectedCampusSlug, setSelectedCampusSlug] = useState<string | null>(null)
  const [isZoomed, setIsZoomed] = useState(false)

  // Filter campuses based on search and selected state
  const filteredCampuses = useMemo(() => {
    return campuses.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.university_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesState = selectedState === 'all' || c.state === selectedState
      
      const matchesClick = !selectedCampusSlug || c.slug === selectedCampusSlug

      return matchesSearch && matchesState && matchesClick
    })
  }, [campuses, searchQuery, selectedState, selectedCampusSlug])

  // Get active campus details for hover tooltips
  const activeHoverDetails = useMemo(() => {
    if (!hoveredCampusSlug) return null
    return campuses.find((c) => c.slug === hoveredCampusSlug) || null
  }, [hoveredCampusSlug, campuses])

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
      
      {/* Left Column: Controls & Campus Grid */}
      <div className="space-y-6">
        
        {/* Controls Container */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card/60 dark:bg-card/10 border border-border p-4 rounded-2xl backdrop-blur-sm shadow-soft">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/75" />
            <input
              type="text"
              placeholder="Search by campus name or city..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSelectedCampusSlug(null) // Clear map node focus on search
              }}
              className="w-full bg-background dark:bg-card/45 pl-10 pr-4 py-2 text-sm rounded-xl border border-border outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/20 transition-all text-foreground"
            />
          </div>

          {/* State Tabs */}
          <div className="flex items-center gap-1.5 p-0.5 bg-muted dark:bg-card/30 border border-border/80 rounded-xl overflow-x-auto">
            {(['all', 'Telangana', 'Andhra Pradesh'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setSelectedState(st)
                  setSelectedCampusSlug(null) // Clear map node focus on filter
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedState === st
                    ? 'bg-card text-brand shadow-sm border border-border/30'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {st === 'all' ? 'All States' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic visual filters summary */}
        {selectedCampusSlug && (
          <div className="flex items-center justify-between bg-brand/5 border border-brand/20 px-4 py-2.5 rounded-xl text-xs">
            <span className="text-muted-foreground">
              Showing focused campus node from map selection.
            </span>
            <button
              onClick={() => setSelectedCampusSlug(null)}
              className="text-brand font-bold hover:text-brand-orange transition-colors"
            >
              Show all campuses
            </button>
          </div>
        )}

        {/* Campus Cards List */}
        <div className="min-h-[400px]">
          {filteredCampuses.length === 0 ? (
            <div className="border border-dashed border-border p-12 text-center rounded-3xl bg-card/15">
              <MapPin className="size-10 text-muted-foreground/60 mb-3 animate-bounce mx-auto" />
              <h4 className="font-display font-extrabold text-foreground text-base">No campuses match search</h4>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                No active volunteer teams matched your filters. Try search keywords or reset filter focus.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {filteredCampuses.map((campus) => {
                const isHovered = hoveredCampusSlug === campus.slug
                return (
                  <div
                    key={campus.id}
                    onMouseEnter={() => setHoveredCampusSlug(campus.slug)}
                    onMouseLeave={() => setHoveredCampusSlug(null)}
                    className="h-full"
                  >
                    <CampusCard
                      campus={campus}
                      className={`h-full transition-all duration-300 ${
                        isHovered
                          ? 'border-brand ring-2 ring-brand/10 scale-[1.02] shadow-soft-lg bg-card/90 dark:bg-card/25'
                          : ''
                      }`}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Interactive Sticky Map Sidebar */}
      <div className="relative">
        <div className="lg:sticky lg:top-24 bg-card/65 dark:bg-card/15 border border-border backdrop-blur-md rounded-3xl p-6 shadow-soft-lg flex flex-col justify-between overflow-hidden min-h-[440px]">
          
          <div className="border-b border-border pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand">Interactive Grid Explorer</span>
            <h4 className="font-display font-extrabold text-base mt-0.5 text-foreground">Active Campus Hotspots</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">Hover nodes to view stats, or click to isolate chapters.</p>
          </div>

          {/* SVG Map Container */}
          <div
            onClick={() => setIsZoomed(!isZoomed)}
            className={`relative flex items-center justify-center py-6 select-none aspect-[4/3] bg-muted/20 dark:bg-slate-900/10 rounded-2xl border border-border/40 mt-4 transition-all duration-300 ${
              isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
          >
            {/* Zoom Controls */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setIsZoomed(true)}
                className={`p-1.5 rounded-lg border border-border bg-card/90 dark:bg-zinc-900/90 text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-all ${
                  isZoomed ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'
                }`}
                disabled={isZoomed}
                title="Zoom In"
              >
                <ZoomIn className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className={`p-1.5 rounded-lg border border-border bg-card/90 dark:bg-zinc-900/90 text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-all ${
                  !isZoomed ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'
                }`}
                disabled={!isZoomed}
                title="Zoom Out"
              >
                <ZoomOut className="size-4" />
              </button>
            </div>

            <svg className="w-full h-full max-h-[250px]" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <clipPath id="campuses-map-clip">
                  <rect x="120" y="10" width="260" height="232" />
                </clipPath>
              </defs>

              <motion.g
                animate={{
                  scale: isZoomed ? 1.8 : 1,
                  x: isZoomed ? -184 : 0,
                  y: isZoomed ? -148 : 0,
                }}
                transition={{ type: 'spring', stiffness: 220, damping: 25 }}
              >
                {/* SVG India Map image outline layer */}
                <image
                  href="/india_map_outline.png"
                  x="120"
                  y="10"
                  width="260"
                  height="260"
                  clipPath="url(#campuses-map-clip)"
                  className="opacity-75 dark:invert dark:opacity-60 mix-blend-multiply dark:mix-blend-screen"
                />

                {/* State Callout label lines & indicators */}
                <g className="opacity-65 dark:opacity-40">
                  {/* Telangana callout */}
                  <line x1="155" y1="195" x2="242" y2="190" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="text-muted-foreground" />
                  <circle cx="155" cy="195" r="1.5" className="fill-muted-foreground" />
                  <text x="100" y="198" className="font-sans text-[9px] font-bold tracking-wider fill-muted-foreground">Telangana</text>

                  {/* Andhra callout */}
                  <line x1="320" y1="210" x2="265" y2="190" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="text-muted-foreground" />
                  <circle cx="320" cy="210" r="1.5" className="fill-muted-foreground" />
                  <text x="325" y="213" className="font-sans text-[9px] font-bold tracking-wider fill-muted-foreground">Andhra Pradesh</text>
                </g>

                {/* Connection Arcs (Hyderabad -> Visakhapatnam) */}
                <path
                  d="M 242,190 Q 255,165 270,172"
                  fill="none"
                  className="stroke-brand/20 dark:stroke-brand/10 stroke-1.5 dashed-beam"
                  strokeDasharray="4 4"
                />

                {/* Map Hotspots */}
                {campuses.map((c) => {
                  const coord = MAP_COORDS[c.slug] || { x: 242, y: 190 }
                  const isHovered = hoveredCampusSlug === c.slug
                  const isFocused = selectedCampusSlug === c.slug
                  
                  // Hide nodes if they don't match the selected state filter
                  const isNodeHidden = selectedState !== 'all' && c.state !== selectedState
                  if (isNodeHidden) return null

                  return (
                    <g
                      key={c.id}
                      className="cursor-pointer group/node"
                      onMouseEnter={() => setHoveredCampusSlug(c.slug)}
                      onMouseLeave={() => setHoveredCampusSlug(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedCampusSlug(isFocused ? null : c.slug)
                      }}
                    >
                      <circle cx={coord.x} cy={coord.y} r={16} fill="transparent" />
                      
                      {/* Ring aura */}
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r={isHovered || isFocused ? 14 : 7}
                        className={`transition-all duration-300 ${
                          c.slug === 'auce' ? 'fill-brand-teal/20' : 'fill-brand-orange/20'
                        } ${!isHovered && !isFocused && 'animate-pulse'}`}
                      />
                      
                      {/* Glowing core */}
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r={isHovered || isFocused ? 5.5 : 3.5}
                        className={`transition-all duration-300 ${
                          c.slug === 'auce' ? 'fill-brand-teal' : 'fill-brand-orange'
                        }`}
                      />
                    </g>
                  )
                })}
              </motion.g>
            </svg>

            {/* Hover Tooltip Overlay */}
            <AnimatePresence>
              {activeHoverDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-4 inset-x-4 bg-slate-950 dark:bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl text-xs space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-display font-extrabold text-slate-100">{activeHoverDetails.name}</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">{activeHoverDetails.university_name}</p>
                    </div>
                    <span className="text-[9px] font-bold text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {activeHoverDetails.state}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center text-[10px]">
                    <div>
                      <div className="font-bold text-slate-200">{activeHoverDetails.schools_reached}</div>
                      <div className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold mt-0.5">Schools</div>
                    </div>
                    <div>
                      <div className="font-bold text-brand-teal">{activeHoverDetails.students_impacted}</div>
                      <div className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold mt-0.5">Students</div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-200">{activeHoverDetails.sessions_completed}</div>
                      <div className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold mt-0.5">Sessions</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Lower footer info */}
          <div className="mt-4 pt-3 border-t border-border/80 text-[10px] text-muted-foreground flex justify-between items-center">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-brand-orange" /> Telangana Chapters
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-brand-teal" /> Andhra Chapters
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}
