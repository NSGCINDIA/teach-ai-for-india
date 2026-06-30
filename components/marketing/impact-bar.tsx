'use client'

import { Building2, GraduationCap, MapPin, PlayCircle, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AnimatedCounter } from '@/components/shared/animated-counter'
import type { PublicImpactStats } from '@/types/database'

interface StatDef {
  key: keyof PublicImpactStats
  label: string
  icon: LucideIcon
}

const STATS: StatDef[] = [
  { key: 'schools_reached', label: 'Schools reached', icon: GraduationCap },
  { key: 'students_impacted', label: 'Students impacted', icon: Users },
  { key: 'sessions_completed', label: 'Sessions delivered', icon: PlayCircle },
  { key: 'active_campuses', label: 'Active campuses', icon: Building2 },
  { key: 'states_count', label: 'States covered', icon: MapPin },
]

/** Animated impact bar — count-up of the live program metrics (PRD §7.1). */
export function ImpactBar({ stats }: { stats: PublicImpactStats }) {
  return (
    <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-soft sm:grid-cols-3 lg:grid-cols-5">
      {STATS.map(({ key, label, icon: Icon }) => (
        <li key={key} className="flex flex-col items-center gap-2 bg-card px-4 py-8 text-center">
          <span className="grid size-10 place-items-center rounded-xl bg-accent text-brand">
            <Icon className="size-5" aria-hidden />
          </span>
          <AnimatedCounter
            value={stats[key]}
            className="font-display text-3xl font-extrabold tabular-nums md:text-4xl"
          />
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </li>
      ))}
    </ul>
  )
}
