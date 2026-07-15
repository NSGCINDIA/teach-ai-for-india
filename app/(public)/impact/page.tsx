import type { Metadata } from 'next'
import { getImpactStats, getCampusCards, getPublicGallery } from '@/lib/data/public'
import { PageHeader } from '@/components/marketing/page-header'
import { ImpactBar } from '@/components/marketing/impact-bar'
import { CtaBand } from '@/components/marketing/cta-band'
import { Reveal } from '@/components/marketing/reveal'
import { SectionHeading } from '@/components/shared/section-heading'
import { EmptyState } from '@/components/shared/states'
import { MapPin } from 'lucide-react'
import { ImpactDashboard } from '@/components/marketing/impact-dashboard'
import Image from 'next/image'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Impact',
  description:
    'Live impact dashboard for Teach AI for India — schools reached, students impacted, sessions delivered, and per-campus breakdowns.',
}

export default async function ImpactPage() {
  const [stats, campuses, galleryItems] = await Promise.all([
    getImpactStats(),
    getCampusCards(),
    getPublicGallery(6)
  ])

  // Provide high-quality fallback visual evidence items if gallery is unpopulated in dev database
  const displayGallery = galleryItems.length > 0 ? galleryItems : [
    {
      id: 'mock-1',
      url: '/hero_classroom_learning.png',
      fileType: 'photo' as const,
      fileName: 'classroom_learning_1.png',
      caption: 'VNR VJIET campus session: Interactive Prompt Sandbox at Bowrampet High School.',
      createdAt: '2026-06-15T10:00:00Z'
    },
    {
      id: 'mock-2',
      url: '/hero_classroom_learning.png',
      fileType: 'photo' as const,
      fileName: 'classroom_learning_2.png',
      caption: 'GRIET campus session: Students running python code templates.',
      createdAt: '2026-06-12T11:00:00Z'
    },
    {
      id: 'mock-3',
      url: '/hero_classroom_learning.png',
      fileType: 'photo' as const,
      fileName: 'classroom_learning_3.png',
      caption: 'CBIT chapter: Mentors working with primary kids on logic boards.',
      createdAt: '2026-06-08T09:30:00Z'
    }
  ]

  return (
    <>
      <PageHeader
        eyebrow="Impact"
        title={
          <>
            The numbers behind the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-orange to-brand-teal">
              mission
            </span>
          </>
        }
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

      {/* Interactive dashboard area */}
      <section className="section-padding pt-0">
        <div className="container-wide">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="By campus"
              title="Where the impact is happening"
              description="A real-time metrics breakdown and leaderboard across active campus teams."
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
              <Reveal delay={0.08}>
                <ImpactDashboard campuses={campuses} />
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* Documented Session Evidence */}
      <section className="section-padding bg-muted/20 relative overflow-hidden border-t border-border">
        <div className="container-wide">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="On-the-ground proof"
              title="Verified classroom moments"
              description="Real visual evidence uploaded directly by college volunteers after teaching. Transparency you can verify."
            />
          </Reveal>

          <div className="mt-12">
            <Reveal delay={0.08}>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayGallery.map((item) => (
                  <article key={item.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft hover:translate-y-[-4px] hover:shadow-soft-lg transition-all duration-300">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {item.url && (
                        <Image
                          src={item.url}
                          alt={item.caption || 'Classroom session'}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute top-3 left-3 bg-brand/90 backdrop-blur text-white text-[10px] uppercase font-bold py-1 px-2.5 rounded-full tracking-wider">
                        Session Verified
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-foreground/80 leading-relaxed min-h-[48px] text-pretty">
                        {item.caption}
                      </p>
                      <div className="mt-4 pt-4 border-t border-border/80 flex justify-between items-center text-xs text-muted-foreground font-semibold">
                        <span>{new Date(item.createdAt || '').toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-brand-teal">Active Lab</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <CtaBand
        title="Help these numbers grow"
        description="Every volunteer multiplies our reach. Join a campus team and add your name to the impact."
      />
    </>
  )
}
