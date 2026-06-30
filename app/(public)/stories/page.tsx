import type { Metadata } from 'next'
import { BookOpen } from 'lucide-react'
import { getContentBlock } from '@/lib/data/public'
import {
  STORIES_FALLBACK,
  TESTIMONIALS_FALLBACK,
  type StoriesContent,
  type TestimonialsContent,
} from '@/app/(public)/content'
import { PageHeader } from '@/components/marketing/page-header'
import { Testimonials } from '@/components/marketing/testimonials'
import { CtaBand } from '@/components/marketing/cta-band'
import { Reveal } from '@/components/marketing/reveal'
import { EmptyState } from '@/components/shared/states'
import { formatDate } from '@/lib/format'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Stories',
  description: 'Field stories and reflections from the campuses, classrooms, and volunteers of Teach AI for India.',
}

export default async function StoriesPage() {
  const [stories, testimonials] = await Promise.all([
    getContentBlock<StoriesContent>('stories', STORIES_FALLBACK),
    getContentBlock<TestimonialsContent>('testimonials', TESTIMONIALS_FALLBACK),
  ])

  return (
    <>
      <PageHeader
        eyebrow="Stories"
        title="Field notes from the movement"
        description="The moments that don’t fit in a metric — classrooms lighting up, volunteers finding purpose, schools opening doors."
      />

      <section className="section-padding">
        <div className="container-wide">
          {stories.items.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Our first stories are being written"
              description="As campuses run their sessions, we’ll publish the moments worth remembering here. In the meantime, hear it from the people on the ground below."
              action={{ label: 'Become part of the story', href: '/join' }}
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {stories.items.map((story, i) => (
                <Reveal key={`${story.title}-${i}`} delay={(i % 3) * 0.08}>
                  <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg">
                    {(story.campus || story.date) && (
                      <p className="section-label text-brand">
                        {[story.campus, story.date ? formatDate(story.date) : null].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <h2 className="mt-3 font-display text-xl font-bold text-balance">{story.title}</h2>
                    <p className="mt-2 flex-1 text-pretty text-muted-foreground">{story.excerpt}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <Testimonials content={testimonials} />

      <CtaBand />
    </>
  )
}
