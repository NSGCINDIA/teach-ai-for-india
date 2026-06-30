import type { Metadata } from 'next'
import { BookOpen, Brain, Infinity as InfinityIcon, Settings2, ShieldCheck } from 'lucide-react'
import { getContentBlock } from '@/lib/data/public'
import { MISSION_FALLBACK, type MissionContent } from '@/app/(public)/content'
import { PageHeader } from '@/components/marketing/page-header'
import { Mission } from '@/components/marketing/mission'
import { CtaBand } from '@/components/marketing/cta-band'
import { Reveal } from '@/components/marketing/reveal'
import { SectionHeading } from '@/components/shared/section-heading'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'About',
  description:
    'The story, mission, and strategic pillars behind Teach AI for India — a student-led movement for applied AI literacy.',
}

const PILLARS = [
  {
    icon: BookOpen,
    title: 'Story',
    description:
      'A compelling, honest narrative that earns trust — with families, schools, volunteers, and partners alike.',
  },
  {
    icon: Settings2,
    title: 'Operations',
    description:
      'A repeatable execution engine: identify, reach, deliver, and report sessions without dropping a beat.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust',
    description:
      'Documented evidence for every session and transparent metrics, so impact is never just a claim.',
  },
  {
    icon: Brain,
    title: 'Intelligence',
    description:
      'Data that compounds — learning from each campus to make the next session sharper than the last.',
  },
  {
    icon: InfinityIcon,
    title: 'Continuity',
    description:
      'Leadership and knowledge that outlast any single cohort, so the movement keeps moving.',
  },
]

export default async function AboutPage() {
  const mission = await getContentBlock<MissionContent>('mission', MISSION_FALLBACK)

  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="A movement built by students, for the next generation"
        description="We believe the children with the least access to AI today have the most to gain tomorrow. So we go to them."
      />

      {/* Story */}
      <section className="section-padding">
        <div className="container-wide grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <Reveal>
            <SectionHeading align="left" eyebrow="Our story" title="It started with a simple imbalance" className="max-w-md" />
          </Reveal>
          <Reveal delay={0.08}>
            <div className="space-y-4 text-pretty text-muted-foreground md:text-lg">
              <p>
                AI is rewriting what it means to be employable, creative, and informed. Yet the students who could benefit
                most — in government schools far from the tech corridors — are the least likely to ever touch it.
              </p>
              <p>
                Teach AI for India began as a small group of university students who refused to accept that gap. Instead of
                waiting for a curriculum to trickle down, we built one and carried it into classrooms ourselves.
              </p>
              <p>
                Today we are a growing network of campus teams, each one mapping schools, training volunteers, and running
                hands-on AI sessions — turning students from passive users into confident creators.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mission (reused content block) */}
      <Mission content={mission} />

      {/* Strategic pillars */}
      <section className="section-padding bg-muted/40">
        <div className="container-wide">
          <Reveal>
            <SectionHeading
              eyebrow="How we're built"
              title="Five pillars that hold the movement up"
              description="Our strategy is deliberately structured so that mission, execution, and longevity reinforce each other."
            />
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((pillar, i) => (
              <Reveal key={pillar.title} delay={(i % 3) * 0.08}>
                <article className="h-full rounded-2xl border border-border bg-card p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg">
                  <span className="grid size-12 place-items-center rounded-xl bg-brand/10 text-brand">
                    <pillar.icon className="size-6" aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold">{pillar.title}</h3>
                  <p className="mt-2 text-pretty text-muted-foreground">{pillar.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
