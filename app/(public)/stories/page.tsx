import type { Metadata } from 'next'
import { getContentBlock } from '@/lib/data/public'
import {
  TESTIMONIALS_FALLBACK,
  type TestimonialsContent,
} from '@/app/(public)/content'
import { PageHeader } from '@/components/marketing/page-header'
import { Testimonials } from '@/components/marketing/testimonials'
import { StoriesDashboard } from '@/components/marketing/stories-dashboard'
import { CtaBand } from '@/components/marketing/cta-band'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Stories',
  description: 'Field stories and reflections from the campuses, classrooms, and volunteers of Teach AI for India.',
}

export default async function StoriesPage() {
  const testimonials = await getContentBlock<TestimonialsContent>('testimonials', TESTIMONIALS_FALLBACK)

  return (
    <>
      <PageHeader
        eyebrow="Stories"
        title="Field notes from the movement"
        description="The moments that don’t fit in a metric — classrooms lighting up, volunteers finding purpose, schools opening doors."
      />

      <section className="section-padding relative">
        <div className="container-wide">
          <StoriesDashboard />
        </div>
      </section>

      <Testimonials content={testimonials} />

      <CtaBand />
    </>
  )
}
