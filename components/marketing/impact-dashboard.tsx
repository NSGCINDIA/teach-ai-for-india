'use client'

import { useState, useMemo } from 'react'
import type { PublicCampusCard } from '@/types/database'
import { CampusCard } from '@/components/shared/campus-card'
import { formatNumber } from '@/lib/format'
import { Search, LayoutGrid, List, MapPin, Trophy, BarChart3, Users, Landmark, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImpactDashboardProps {
  campuses: PublicCampusCard[]
}

export function ImpactDashboard({ campuses }: ImpactDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedState, setSelectedState] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Extract unique states for the filter select
  const states = useMemo(() => {
    const s = new Set(campuses.map((c) => c.state).filter(Boolean))
    return Array.from(s).sort()
  }, [campuses])

  // Filter campuses based on search and selected state
  const filteredCampuses = useMemo(() => {
    return campuses.filter((campus) => {
      const matchesSearch =
        campus.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campus.university_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campus.city.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesState = selectedState === 'all' || campus.state === selectedState

      return matchesSearch && matchesState
    })
  }, [campuses, searchQuery, selectedState])

  // Sort campuses by students reached to find top performers for the leaderboard chart
  const leaderboard = useMemo(() => {
    return [...campuses]
      .sort((a, b) => b.students_impacted - a.students_impacted)
      .slice(0, 4)
  }, [campuses])

  const maxImpact = useMemo(() => {
    if (leaderboard.length === 0) return 1
    return Math.max(...leaderboard.map((c) => c.students_impacted), 1)
  }, [leaderboard])

  // Calculate state aggregate shares
  const stateMetrics = useMemo(() => {
    const stats: Record<string, { students: number; schools: number; campuses: number }> = {}
    campuses.forEach((c) => {
      const stateName = c.state || 'Other'
      if (!stats[stateName]) {
        stats[stateName] = { students: 0, schools: 0, campuses: 0 }
      }
      stats[stateName].students += c.students_impacted
      stats[stateName].schools += c.schools_reached
      stats[stateName].campuses += 1
    })
    return Object.entries(stats).map(([name, data]) => ({ name, ...data }))
  }, [campuses])

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      {/* Main Content Area */}
      <div className="space-y-6">
        
        {/* Dashboard Filter Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card/50 dark:bg-card/10 border border-border/80 p-4 rounded-2xl backdrop-blur-sm">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/75" />
            <input
              type="text"
              placeholder="Search by campus or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background dark:bg-card/45 pl-10 pr-4 py-2 text-sm rounded-xl border border-border/80 outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/20 transition-all text-foreground"
            />
          </div>

          <div className="flex items-center gap-3 justify-between sm:justify-start">
            {/* State Filter Select */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-background dark:bg-card/45 border border-border/80 rounded-xl px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-brand/40 transition-all"
            >
              <option value="all">All States</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Layout Toggler Buttons */}
            <div className="flex items-center bg-background/80 dark:bg-card/30 border border-border/80 rounded-xl p-0.5 shadow-inner">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-card text-brand shadow-sm border border-border/40'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-card text-brand shadow-sm border border-border/40'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Tabular Sheet View"
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Result Container */}
        <div className="min-h-[300px]">
          {filteredCampuses.length === 0 ? (
            <div className="border border-dashed border-border/80 rounded-3xl p-12 text-center flex flex-col items-center justify-center bg-card/10">
              <MapPin className="size-10 text-muted-foreground/60 mb-3 animate-bounce" />
              <h4 className="font-display font-bold text-base text-foreground">No campuses found</h4>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                We couldn't match "{searchQuery}" in our records. Try searching for city name or select a different state filter.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div
                  key="grid-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid gap-6 sm:grid-cols-2"
                >
                  {filteredCampuses.map((campus) => (
                    <motion.div
                      key={campus.id}
                      layout
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.25 }}
                    >
                      <CampusCard campus={campus} className="h-full" />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="table-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-x-auto rounded-2xl border border-border bg-card/45 backdrop-blur-sm shadow-soft"
                >
                  <table className="w-full min-w-[38rem] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/60 dark:bg-card/40 text-left">
                        <th scope="col" className="px-5 py-3 font-display font-bold text-foreground">Campus</th>
                        <th scope="col" className="px-5 py-3 font-display font-bold text-foreground">University</th>
                        <th scope="col" className="px-5 py-3 font-display font-bold text-foreground">Location</th>
                        <th scope="col" className="px-5 py-3 text-right font-display font-bold text-foreground">Schools</th>
                        <th scope="col" className="px-5 py-3 text-right font-display font-bold text-foreground">Students</th>
                        <th scope="col" className="px-5 py-3 text-right font-display font-bold text-foreground">Sessions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCampuses.map((c) => (
                        <tr key={c.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/40 dark:hover:bg-card/20">
                          <td className="px-5 py-3.5 font-bold text-foreground">{c.name}</td>
                          <td className="px-5 py-3.5 text-muted-foreground text-xs">{c.university_name}</td>
                          <td className="px-5 py-3.5 text-muted-foreground text-xs">{c.city}, {c.state}</td>
                          <td className="px-5 py-3.5 text-right tabular-nums font-medium text-foreground">{formatNumber(c.schools_reached)}</td>
                          <td className="px-5 py-3.5 text-right tabular-nums font-bold text-brand">{formatNumber(c.students_impacted)}</td>
                          <td className="px-5 py-3.5 text-right tabular-nums font-medium text-foreground">{formatNumber(c.sessions_completed)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Sidebar Analytics Area */}
      <div className="space-y-6">
        
        {/* Impact Chart Leaderboard Card */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/60 dark:bg-card/15 backdrop-blur-md p-6 shadow-soft-lg">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand to-brand-orange" />
          <h3 className="font-display font-extrabold text-base flex items-center gap-2 text-foreground">
            <Trophy className="size-4 text-brand-orange animate-pulse" />
            Top Chapters
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Leading technical college campuses by student reach.</p>
          
          <div className="mt-6 space-y-4">
            {leaderboard.map((campus) => {
              const pct = (campus.students_impacted / maxImpact) * 100
              return (
                <div key={campus.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span className="truncate max-w-[170px]" title={campus.name}>{campus.name}</span>
                    <span className="text-brand tabular-nums">{formatNumber(campus.students_impacted)} kids</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-brand to-brand-orange rounded-full"
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">{campus.university_name}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* State Distribution Card */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/60 dark:bg-card/15 backdrop-blur-md p-6 shadow-soft-lg">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-orange to-brand-teal" />
          <h3 className="font-display font-extrabold text-base flex items-center gap-2 text-foreground">
            <BarChart3 className="size-4 text-brand-teal" />
            Regional Impact
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Aggregated statistics mapping state metrics.</p>

          <div className="mt-5 space-y-4">
            {stateMetrics.map((state) => (
              <div key={state.name} className="p-4 rounded-xl border border-border/80 bg-background/50 dark:bg-card/20 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <MapPin className="size-3.5 text-brand" />
                    {state.name}
                  </div>
                  <span className="text-xs font-bold bg-brand-teal/15 text-brand-teal px-2 py-0.5 rounded-full">
                    {state.campuses} {state.campuses === 1 ? 'chapter' : 'chapters'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-center">
                  <div>
                    <div className="font-display font-extrabold text-sm tabular-nums text-foreground">{formatNumber(state.schools)}</div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5">Schools</div>
                  </div>
                  <div>
                    <div className="font-display font-extrabold text-sm tabular-nums text-brand">{formatNumber(state.students)}</div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5">Students</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
