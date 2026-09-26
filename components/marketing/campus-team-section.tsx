'use client'

import { GraduationCap } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'
import { AvatarImage } from '@/components/shared/image-with-fallback'

export interface VerifiedTeamMember {
  id: string
  name: string
  campus: string
  role: string
  avatar?: string | null
}

const VERIFIED_LEADERS: VerifiedTeamMember[] = [
  {
    id: 'lead-1',
    name: 'Sneha Reddy',
    campus: 'NIAT × KKH',
    role: 'Chapter Lead',
    avatar: null,
  },
  {
    id: 'lead-2',
    name: 'Ravi Teja',
    campus: 'NIAT × NSRIT',
    role: 'Outreach Coordinator',
    avatar: null,
  },
  {
    id: 'lead-3',
    name: 'Karthik M.',
    campus: 'NIAT × CDU',
    role: 'Execution Lead',
    avatar: null,
  },
  {
    id: 'lead-4',
    name: 'Ananya S.',
    campus: 'NIAT × Aurora',
    role: 'Session Facilitator',
    avatar: null,
  },
  {
    id: 'lead-5',
    name: 'Ahladini Sindhu Sri',
    campus: 'NIAT × Chevella',
    role: 'Outreach Lead',
    avatar: null,
  },
  {
    id: 'lead-6',
    name: 'Jahnavi Chandra',
    campus: 'NIAT × CIET',
    role: 'Execution Lead',
    avatar: null,
  },
]

export function CampusTeamSection({ customTeam }: { customTeam?: VerifiedTeamMember[] }) {
  const list = customTeam && customTeam.length > 0 ? customTeam : VERIFIED_LEADERS

  if (!list || list.length === 0) return null

  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-16 md:py-24">
      <div className="container-wide px-5 md:px-8 lg:px-16">
        <Reveal>
          <div className="max-w-3xl">
            <span className="section-label text-brand">Campus Leadership</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl text-balance">
              The NIAT students behind the classrooms.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
              Built by passionate NIAT students — campus leads and student facilitators handle school outreach, session logistics,
              and volunteer coordination. Meet a few of the students making it happen.
            </p>
          </div>
        </Reveal>

        {/* Team Grid */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {list.map((member, idx) => (
            <Reveal key={member.id} delay={idx * 0.05} className="h-full">
              <div className="group flex h-full flex-col items-center rounded-2xl border border-border/80 bg-card p-5 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-soft-lg">
                <div className="relative mb-4">
                  <AvatarImage
                    src={member.avatar || undefined}
                    alt={member.name}
                    size="lg"
                    className="size-16 rounded-full border-2 border-border/60 shadow-xs"
                  />
                  <span className="absolute bottom-0 right-0 grid size-5 place-items-center rounded-full bg-brand text-white shadow-xs">
                    <GraduationCap className="size-3" />
                  </span>
                </div>

                <h3 className="font-display text-sm font-bold text-foreground leading-tight">
                  {member.name}
                </h3>
                <p className="mt-1 text-xs font-semibold text-brand">{member.role}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{member.campus}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
