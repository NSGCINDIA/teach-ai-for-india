import { SimpleHero } from '@/components/dashboard/dashboard-hero'
import { EmptyState } from '@/components/shared/states'
import { MapPin } from 'lucide-react'

// ─── Fallback ─────────────────────────────────────────────────────────────────
export function NoCampusOverview({ name, role }: { name: string; role: string }) {
  return (
    <div className="space-y-6 animate-fade-up">
      <SimpleHero
        greeting="Welcome"
        userName={name}
        role={role}
        description="You're in — we just need to get you linked to a campus before you can see your dashboard."
      />
      <EmptyState
        icon={MapPin}
        title="No campus assigned yet"
        description="Your account isn't linked to a campus. An admin will assign you shortly — reach out to your coordinator if this takes more than a day."
      />
    </div>
  )
}
