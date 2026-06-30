import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Building2, GraduationCap, ImageIcon, MapPin, PlayCircle, Quote, UserRound, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/marketing/reveal'
import { AnimatedCounter } from '@/components/shared/animated-counter'
import { EvidenceGrid } from '@/components/shared/evidence-grid'
import { EmptyState } from '@/components/shared/states'
import { getCampusBySlug, getCampusCards, getContentBlock, getPublicGallery } from '@/lib/data/public'
import {
  HOW_IT_WORKS_FALLBACK,
  STORIES_FALLBACK,
  type HowItWorksContent,
  type StoriesContent,
} from '@/app/(public)/content'
import { formatDate } from '@/lib/format'

export const revalidate = 300

/** Pre-render a static page per known campus; new slugs render on-demand via ISR. */
export async function generateStaticParams() {
  const campuses = await getCampusCards()
  return campuses.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const campus = await getCampusBySlug(slug)
  if (!campus) return { title: 'Campus not found' }
  return {
    title: `${campus.name} Campus`,
    description:
      campus.description ??
      `The ${campus.name} campus team brings applied AI education to schools in ${campus.city}, ${campus.state}.`,
  }
}

export default async function CampusDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const campus = await getCampusBySlug(slug)
  if (!campus) notFound()

  // All public data sources, fetched in parallel + degrading gracefully.
  const [gallery, stories, howItWorks] = await Promise.all([
    getPublicGallery(12, campus.id),
    getContentBlock<StoriesContent>('stories', STORIES_FALLBACK),
    getContentBlock<HowItWorksContent>('how_it_works', HOW_IT_WORKS_FALLBACK),
  ])

  // Prefer a story tagged to this campus; otherwise lead with the latest overall.
  const featuredStory =
    stories.items.find((s) => s.campus?.toLowerCase() === campus.name.toLowerCase()) ??
    stories.items[0] ??
    null

  const metrics = [
    { label: 'Schools reached', value: campus.schools_reached, icon: GraduationCap },
    { label: 'Students impacted', value: campus.students_impacted, icon: Users },
    { label: 'Sessions delivered', value: campus.sessions_completed, icon: PlayCircle },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        {campus.hero_image_url ? (
          <>
            <Image
              src={campus.hero_image_url}
              alt={`${campus.name} campus`}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </>
        ) : (
          <>
            <div aria-hidden className="absolute inset-0 dot-grid opacity-50" />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand/15 to-brand-teal/5 blur-3xl"
            />
          </>
        )}

        <div className="container-wide relative px-5 py-16 md:px-8 md:py-24 lg:px-16">
          <Reveal>
            <div className={campus.hero_image_url ? 'text-white' : ''}>
              <Link
                href="/campuses"
                className="inline-flex items-center gap-1.5 text-sm font-medium opacity-80 transition-opacity hover:opacity-100"
              >
                <ArrowLeft className="size-4" aria-hidden /> All campuses
              </Link>
              <p
                className={`section-label mt-6 inline-flex items-center gap-2 ${campus.hero_image_url ? 'text-white/80' : 'text-brand'}`}
              >
                <Building2 className="size-3.5" aria-hidden /> {campus.university_name}
              </p>
              <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-balance md:text-5xl">
                {campus.name}
              </h1>
              <p className={`mt-4 inline-flex items-center gap-1.5 ${campus.hero_image_url ? 'text-white/85' : 'text-muted-foreground'}`}>
                <MapPin className="size-4" aria-hidden /> {campus.city}, {campus.state}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Metrics */}
      <section className="section-padding-sm">
        <div className="container-wide">
          <Reveal>
            <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-soft sm:grid-cols-3">
              {metrics.map(({ label, value, icon: Icon }) => (
                <li key={label} className="flex flex-col items-center gap-2 bg-card px-4 py-8 text-center">
                  <span className="grid size-10 place-items-center rounded-xl bg-accent text-brand">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <AnimatedCounter value={value} className="font-display text-3xl font-extrabold tabular-nums md:text-4xl" />
                  <span className="text-sm font-medium text-muted-foreground">{label}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Description + lead */}
      <section className="section-padding pt-0">
        <div className="container-wide grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <Reveal>
            <div>
              <h2 className="font-display text-2xl font-bold">About this campus</h2>
              <p className="mt-4 text-pretty text-muted-foreground md:text-lg">
                {campus.description ??
                  `The ${campus.name} team is mobilising student volunteers to deliver applied AI education to government schools across ${campus.city} and the wider ${campus.state} region.`}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <aside className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="section-label text-muted-foreground">Campus lead</h2>
              <div className="mt-4 flex items-center gap-4">
                <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-accent text-brand">
                  {campus.lead_avatar_url ? (
                    <Image src={campus.lead_avatar_url} alt={campus.lead_name ?? 'Campus lead'} fill sizes="56px" className="object-cover" />
                  ) : (
                    <UserRound className="size-7" aria-hidden />
                  )}
                </span>
                <div>
                  <p className="font-display font-bold">{campus.lead_name ?? 'Lead role open'}</p>
                  <p className="text-sm text-muted-foreground">
                    {campus.lead_name ? 'Campus lead' : 'We’re recruiting a lead for this campus.'}
                  </p>
                </div>
              </div>
              <Button asChild className="mt-6 w-full bg-brand text-white hover:bg-brand/90">
                <Link href="/join">Volunteer at this campus</Link>
              </Button>
            </aside>
          </Reveal>
        </div>
      </section>

      {/* Session timeline — no public per-session feed exists yet, so we show the
          repeatable delivery flow every session at this campus follows (PRD §7.1). */}
      <section className="section-padding pt-0">
        <div className="container-wide">
          <Reveal>
            <h2 className="font-display text-2xl font-bold">How a session runs here</h2>
            <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">
              {campus.sessions_completed > 0
                ? `Every one of the ${campus.sessions_completed} sessions delivered at ${campus.name} follows the same documented five-step journey.`
                : `As ${campus.name} begins delivering sessions, each one will follow the same documented five-step journey.`}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <ol className="mt-8 space-y-6 border-l border-border pl-6">
              {howItWorks.steps.map((step, i) => (
                <li key={step.title} className="relative">
                  <span className="absolute -left-[1.95rem] grid size-8 place-items-center rounded-full bg-brand text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="font-display font-bold">{step.title}</h3>
                  <p className="mt-1 text-pretty text-muted-foreground">{step.description}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* Featured story */}
      {featuredStory && (
        <section className="section-padding pt-0">
          <div className="container-wide">
            <Reveal>
              <article className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-soft md:p-10">
                <Quote className="size-8 text-brand/30" aria-hidden />
                <p className="section-label mt-4 text-brand">
                  {[featuredStory.campus, featuredStory.date ? formatDate(featuredStory.date) : null]
                    .filter(Boolean)
                    .join(' · ') || 'Featured story'}
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-balance md:text-3xl">
                  {featuredStory.title}
                </h2>
                <p className="mt-4 max-w-3xl text-pretty text-muted-foreground md:text-lg">
                  {featuredStory.excerpt}
                </p>
              </article>
            </Reveal>
          </div>
        </section>
      )}

      {/* Per-campus gallery */}
      <section className="section-padding pt-0">
        <div className="container-wide">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl font-bold">From the classroom</h2>
              {gallery.length > 0 && (
                <Link href="/gallery" className="text-sm font-medium text-brand transition-opacity hover:opacity-80">
                  Full gallery →
                </Link>
              )}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-8">
              {gallery.length === 0 ? (
                <EmptyState
                  icon={ImageIcon}
                  title="No photos yet from this campus"
                  description="Approved session photos from this campus will appear here as the team uploads them."
                />
              ) : (
                <EvidenceGrid items={gallery} />
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
