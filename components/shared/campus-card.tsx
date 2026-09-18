import Link from 'next/link'
import { ArrowUpRight, GraduationCap, MapPin, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PublicCampusCard } from '@/types/database'
import { ImageWithFallback } from './image-with-fallback'

const FALLBACK_IMAGES = [
  'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_600/v1784177876/DJI_20260711124202_0244_D_zgvqzo.jpg', // Team with students outdoor
  'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_600/v1784177877/DJI_20260711131020_0287_D_rvh8gg.jpg', // Team selfie with students classroom
  'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_600/v1784177864/WhatsApp_Image_2026-04-18_at_15.25.48_2_qd8mq3.jpg', // Classroom interaction
  'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_600/v1784178443/motion_photo_8450246088682134754_gtddpq.jpg', // Classroom work setup
  'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_600/v1784177911/DJI_20260711132101_0313_D_a48glv.jpg', // Group photo students playground
  'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_600/v1784177864/IMG-20260406-WA0007_3_hboy0k.jpg', // Group photo students certified
  'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_600/v1784177867/IMG_20260324_121056961_prkzll.jpg', // Group photo students classroom
]

function getFallbackImage(slug: string): string {
  const map: Record<string, number> = {
    'niat-kkh': 0,
    'niat-cdu': 1,
    'niat-chevella': 2,
    'niat-aurora': 3,
    'niat-mrv': 4,
    'niat-ciet': 5,
    'niat-nsrit': 6,
    'niat-nri': 2,
    'niat-annamacharya': 4,
  }
  const index = map[slug] !== undefined ? map[slug] : 0
  return FALLBACK_IMAGES[index]
}

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
      <div className="relative overflow-hidden bg-muted">
        <ImageWithFallback
          src={campus.hero_image_url || getFallbackImage(campus.slug)}
          alt={`Teach AI for India volunteers and students at ${campus.name}`}
          aspectRatio="16:9"
          className="transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        
        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active Chapter
          </span>
          <div className="grid size-8 place-items-center rounded-full bg-card/85 text-foreground backdrop-blur shadow-sm transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <ArrowUpRight className="size-4" aria-hidden />
          </div>
        </div>

        {/* State Tag at bottom of image */}
        <div className="absolute bottom-2.5 left-3 z-10">
          <span className="inline-flex items-center gap-1 rounded-md bg-card/90 dark:bg-card/75 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur-md border border-border/40">
            {campus.state}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground group-hover:text-brand transition-colors">
            {campus.name}
          </h3>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{campus.university_name}</p>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 text-brand shrink-0" aria-hidden /> {campus.city}, {campus.state}
          </p>
        </div>

        {campus.lead_name && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Lead:</span> {campus.lead_name}
          </div>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4">
          <Stat icon={GraduationCap} value={campus.schools_reached} label="Schools" />
          <Stat icon={Users} value={campus.students_impacted} label="Students" />
          <Stat value={campus.sessions_completed} label="Sessions" />
        </div>

        {/* Action button bar */}
        <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-3.5 text-xs font-semibold text-brand">
          <span className="text-[11px] font-medium text-muted-foreground">NIAT student team</span>
          <span className="inline-flex items-center gap-1 font-bold group-hover:translate-x-0.5 transition-transform">
            Explore Campus →
          </span>
        </div>
      </div>
    </Link>
  )
}

function Stat({ icon: Icon, value, label }: { icon?: typeof MapPin; value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-xl font-bold tabular-nums text-foreground">{value.toLocaleString('en-IN')}</p>
      <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
        {Icon && <Icon className="size-3.5" aria-hidden />} {label}
      </p>
    </div>
  )
}
