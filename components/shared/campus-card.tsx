import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, GraduationCap, MapPin, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PublicCampusCard } from '@/types/database'

/**
 * CampusCard (PRD §12.3) — used on the public /campuses grid and admin overview.
 * Shows campus name, university, live reach metrics, and the lead.
 */
export function CampusCard({ campus, className }: { campus: PublicCampusCard; className?: string }) {
  return (
    <Link
      href={`/campuses/${campus.slug}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        className,
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {campus.hero_image_url ? (
          <Image
            src={campus.hero_image_url}
            alt={`${campus.name} campus`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <Image
            src="/hero_classroom_learning.png"
            alt={`${campus.name} campus`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-card/80 text-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="size-4" aria-hidden />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold">{campus.name}</h3>
        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{campus.university_name}</p>
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" aria-hidden /> {campus.city}, {campus.state}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
          <Stat icon={GraduationCap} value={campus.schools_reached} label="Schools" />
          <Stat icon={Users} value={campus.students_impacted} label="Students" />
          <Stat value={campus.sessions_completed} label="Sessions" />
        </div>
      </div>
    </Link>
  )
}

function Stat({ icon: Icon, value, label }: { icon?: typeof MapPin; value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-lg font-bold tabular-nums">{value.toLocaleString('en-IN')}</p>
      <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        {Icon && <Icon className="size-3" aria-hidden />} {label}
      </p>
    </div>
  )
}
