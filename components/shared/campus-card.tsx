import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, GraduationCap, MapPin, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PublicCampusCard } from '@/types/database'

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
            src={getFallbackImage(campus.slug)}
            alt={`Teach AI for India volunteers and students at ${campus.name}`}
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
