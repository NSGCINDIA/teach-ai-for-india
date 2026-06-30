import type { Metadata } from 'next'
import { getImpactStats, getCampusCards } from '@/lib/data/public'
import { formatNumber } from '@/lib/format'
import { PageHeader } from '@/components/marketing/page-header'
import { ImpactBar } from '@/components/marketing/impact-bar'
import { CtaBand } from '@/components/marketing/cta-band'
import { Reveal } from '@/components/marketing/reveal'
import { SectionHeading } from '@/components/shared/section-heading'
import { EmptyState } from '@/components/shared/states'
import { MapPin } from 'lucide-react'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Impact',
  description:
    'Live impact dashboard for Teach AI for India — schools reached, students impacted, sessions delivered, and per-campus breakdowns.',
}

export default async function ImpactPage() {
  const [stats, campuses] = await Promise.all([getImpactStats(), getCampusCards()])

  // Distinct states covered, derived from live campus data.
  const states = Array.from(new Set(campuses.map((c) => c.state).filter(Boolean))).sort()

  return (
    <>
      <PageHeader
        eyebrow="Impact"
        title="The numbers behind the mission"
        description="Every figure here is drawn from documented, campus-verified sessions — transparency is part of the work."
      />

      {/* Headline metrics */}
      <section className="section-padding-sm">
        <div className="container-wide">
          <Reveal>
            <ImpactBar stats={stats} />
          </Reveal>
        </div>
      </section>

      {/* Per-campus breakdown */}
      <section className="section-padding pt-0">
        <div className="container-wide">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="By campus"
              title="Where the impact is happening"
              description="A breakdown of reach across every active campus team."
              className="max-w-xl"
            />
          </Reveal>

          <div className="mt-10">
            {campuses.length === 0 ? (
              <EmptyState
                icon={MapPin}
                title="No campus data yet"
                description="Per-campus impact will appear here as soon as the first sessions are reported."
                action={{ label: 'Join the movement', href: '/join' }}
              />
            ) : (
              <Reveal>
                <div className="overflow-x-auto rounded-2xl border border-border shadow-soft">
                  <table className="w-full min-w-[42rem] border-collapse text-sm">
                    <caption className="sr-only">Impact metrics by campus</caption>
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-left">
                        <th scope="col" className="px-5 py-3 font-display font-bold">Campus</th>
                        <th scope="col" className="px-5 py-3 font-display font-bold">Location</th>
                        <th scope="col" className="px-5 py-3 text-right font-display font-bold">Schools</th>
                        <th scope="col" className="px-5 py-3 text-right font-display font-bold">Students</th>
                        <th scope="col" className="px-5 py-3 text-right font-display font-bold">Sessions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campuses.map((c) => (
                        <tr key={c.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/30">
                          <th scope="row" className="px-5 py-3 text-left font-medium">{c.name}</th>
                          <td className="px-5 py-3 text-muted-foreground">{c.city}, {c.state}</td>
                          <td className="px-5 py-3 text-right tabular-nums">{formatNumber(c.schools_reached)}</td>
                          <td className="px-5 py-3 text-right tabular-nums">{formatNumber(c.students_impacted)}</td>
                          <td className="px-5 py-3 text-right tabular-nums">{formatNumber(c.sessions_completed)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Reveal>
            )}
          </div>

          {/* States covered */}
          {states.length > 0 && (
            <Reveal>
              <div className="mt-12">
                <h3 className="section-label text-muted-foreground">States covered</h3>
                <ul className="mt-4 flex flex-wrap gap-2.5">
                  {states.map((state) => (
                    <li
                      key={state}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium shadow-soft"
                    >
                      <MapPin className="size-3.5 text-brand" aria-hidden /> {state}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <CtaBand
        title="Help these numbers grow"
        description="Every volunteer multiplies our reach. Join a campus team and add your name to the impact."
      />
    </>
  )
}
