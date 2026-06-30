import { MapPin } from 'lucide-react'
import { CampusCard } from '@/components/shared/campus-card'
import { EmptyState } from '@/components/shared/states'
import { Reveal } from '@/components/marketing/reveal'
import type { PublicCampusCard } from '@/types/database'

interface CampusGridProps {
  campuses: PublicCampusCard[]
  /** Copy shown when no campuses are live yet. */
  emptyTitle?: string
  emptyDescription?: string
}

/** Responsive campus card grid with a graceful empty state. */
export function CampusGrid({
  campuses,
  emptyTitle = 'Campuses launching soon',
  emptyDescription = 'Our first campus teams are forming now. Check back shortly — or join to help start one.',
}: CampusGridProps) {
  if (campuses.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title={emptyTitle}
        description={emptyDescription}
        action={{ label: 'Join the movement', href: '/join' }}
      />
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {campuses.map((campus, i) => (
        <Reveal key={campus.id} delay={(i % 3) * 0.08}>
          <CampusCard campus={campus} className="h-full" />
        </Reveal>
      ))}
    </div>
  )
}
