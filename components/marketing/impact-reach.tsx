import { MapPin, Users, Calendar, Award } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'
import type { PublicCampusCard } from '@/types/database'

interface SchoolLocationRecord {
  schoolName: string
  location: string
  campusChapter: string
  studentsReached: string
  sessionType: string
  dateLabel: string
}

const VERIFIED_LOCATIONS: SchoolLocationRecord[] = [
  {
    schoolName: 'ZPHS Bachupally',
    location: 'Medchal-Malkajgiri, Telangana',
    campusChapter: 'NIAT × KKH Chapter',
    studentsReached: '120+ Students',
    sessionType: 'Hands-on Prompt Engineering',
    dateLabel: 'Verified Session',
  },
  {
    schoolName: 'MPPS Nandakramaguda',
    location: 'Rangareddy District, Telangana',
    campusChapter: 'NIAT Genesis Team',
    studentsReached: '150+ Students',
    sessionType: 'First Applied AI Pilot',
    dateLabel: 'Foundational Session',
  },
  {
    schoolName: 'ZPH High School Sontyam',
    location: 'Visakhapatnam, Andhra Pradesh',
    campusChapter: 'NIAT × NSRIT Chapter',
    studentsReached: '110+ Students',
    sessionType: 'Generative AI & Tool Exploration',
    dateLabel: 'Verified Session',
  },
  {
    schoolName: 'ZPH High School Pendurthi',
    location: 'Visakhapatnam, Andhra Pradesh',
    campusChapter: 'NIAT × NSRIT Chapter',
    studentsReached: '135+ Students',
    sessionType: 'Interactive AI Prompt Studio',
    dateLabel: 'Verified Session',
  },
  {
    schoolName: 'ZPHS Agiripalli',
    location: 'Eluru / Krishna, Andhra Pradesh',
    campusChapter: 'NIAT × CIET Chapter',
    studentsReached: '140+ Students',
    sessionType: 'Creative Image & Text Models',
    dateLabel: 'Verified Session',
  },
  {
    schoolName: 'Government High School Chevella',
    location: 'Chevella, Telangana',
    campusChapter: 'NIAT × Chevella Chapter',
    studentsReached: '160+ Students',
    sessionType: 'Weekend AI Lab Workshop',
    dateLabel: 'Verified Session',
  },
]

export function ImpactReach({ campuses }: { campuses: PublicCampusCard[] }) {
  return (
    <section id="reach" className="tai-section bg-background py-16 md:py-24 border-b border-foreground/10">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="tai-eyebrow text-brand">Geographic Presence</p>
            <h2 className="tai-text-display mt-3 font-display text-foreground">
              From one classroom to a growing network.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              Active across Telangana and Andhra Pradesh through collegiate chapters partnering directly with neighborhood government schools.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-card px-4 py-2 text-xs font-mono text-muted-foreground">
            <MapPin className="size-4 text-brand" />
            2 States &bull; 9 Collegiate Chapters &bull; 20+ Schools
          </div>
        </div>

        {/* School Location Cards Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VERIFIED_LOCATIONS.map((loc, idx) => (
            <Reveal key={loc.schoolName} delay={idx * 0.08}>
              <div className="flex h-full flex-col justify-between rounded-2xl border border-foreground/15 bg-card/50 p-6 transition-all hover:border-brand/40 hover:bg-card hover:shadow-sm">
                <div>
                  <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-brand">
                      {loc.campusChapter}
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      {loc.dateLabel}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-xl font-bold text-foreground">
                    {loc.schoolName}
                  </h3>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 text-brand shrink-0" />
                    <span>{loc.location}</span>
                  </div>

                  <div className="mt-4 rounded-xl bg-background/80 p-3 text-xs space-y-1.5 border border-foreground/10">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cohort Reach:</span>
                      <span className="font-bold text-foreground">{loc.studentsReached}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Curriculum:</span>
                      <span className="font-medium text-foreground">{loc.sessionType}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
