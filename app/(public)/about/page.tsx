import type { Metadata } from 'next'
import Image from 'next/image'
import { BookOpen, Brain, Infinity as InfinityIcon, Settings2, ShieldCheck, Sparkles } from 'lucide-react'
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
    hoverBorder: 'hover:border-brand-orange/45 hover:shadow-brand-orange/10',
    iconBg: 'bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange group-hover:text-white',
  },
  {
    icon: Settings2,
    title: 'Operations',
    description:
      'A repeatable execution engine: identify, reach, deliver, and report sessions without dropping a beat.',
    hoverBorder: 'hover:border-brand/45 hover:shadow-brand/10',
    iconBg: 'bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white',
  },
  {
    icon: ShieldCheck,
    title: 'Trust',
    description:
      'Documented evidence for every session and transparent metrics, so impact is never just a claim.',
    hoverBorder: 'hover:border-brand-teal/45 hover:shadow-brand-teal/10',
    iconBg: 'bg-brand-teal/10 text-brand-teal group-hover:bg-brand-teal group-hover:text-white',
  },
  {
    icon: Brain,
    title: 'Intelligence',
    description:
      'Data that compounds — learning from each campus to make the next session sharper than the last.',
    hoverBorder: 'hover:border-brand/45 hover:shadow-brand/10',
    iconBg: 'bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white',
  },
  {
    icon: InfinityIcon,
    title: 'Continuity',
    description:
      'Leadership and knowledge that outlast any single cohort, so the movement keeps moving.',
    hoverBorder: 'hover:border-brand-teal/45 hover:shadow-brand-teal/10',
    iconBg: 'bg-brand-teal/10 text-brand-teal group-hover:bg-brand-teal group-hover:text-white',
  },
]

export default async function AboutPage() {
  const mission = await getContentBlock<MissionContent>('mission', MISSION_FALLBACK)

  return (
    <>
      <PageHeader
        eyebrow="About us"
        title={
          <>
            A movement built by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-orange to-brand-teal">
              students
            </span>
            , for the next generation
          </>
        }
        description="We believe the children with the least access to AI today have the most to gain tomorrow. So we go to them."
      />

      {/* Story */}
      <section className="section-padding">
        <div className="container-wide grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col gap-6">
            <Reveal>
              <SectionHeading align="left" eyebrow="Our story" title="It started with a simple imbalance" className="max-w-md" />
            </Reveal>
            <Reveal delay={0.15}>
              <div className="relative group overflow-hidden rounded-2xl border border-brand/20 bg-brand/5 dark:bg-brand/10 p-6 backdrop-blur shadow-soft max-w-md mt-2">
                <div className="absolute top-0 right-0 p-3 opacity-20 text-brand pointer-events-none">
                  <Brain className="size-16 animate-pulse text-brand" />
                </div>
                <h4 className="font-display font-extrabold text-brand text-base flex items-center gap-2">
                  <Sparkles className="size-4 text-brand-orange animate-spin-slow" />
                  The Applied AI Divide
                </h4>
                <p className="mt-2 text-sm text-foreground/80 leading-relaxed text-pretty">
                  While private school students build games with AI, government classrooms struggle with basic digital literacy. We solve this by bringing university volunteers to deploy physical coding sandboxes directly to them.
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs font-bold text-brand">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-brand-orange animate-pulse" />
                    Expanding across Telangana & AP
                  </span>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border shadow-soft">
                <Image
                  src="https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177876/DJI_20260711124202_0244_D_zgvqzo.jpg"
                  alt="Teach AI for India volunteers posing with government school students after an AI coding session"
                  fill
                  sizes="(max-width: 768px) 100vw, 450px"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.08}>
            <div className="space-y-5 text-pretty text-muted-foreground md:text-lg md:leading-relaxed self-center">
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

              {/* Milestones timeline */}
              <div className="mt-8 pt-8 border-t border-border/80">
                <h4 className="font-display font-extrabold text-sm uppercase tracking-[0.14em] text-brand">Movement Milestones</h4>
                <div className="mt-6 relative border-l border-border/80 pl-6 space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1.5 size-4 rounded-full border-2 border-brand bg-background" />
                    <span className="text-xs font-bold text-brand uppercase tracking-wider">Late 2024</span>
                    <h5 className="font-bold text-foreground text-sm mt-0.5">The First Classroom</h5>
                    <p className="text-xs text-muted-foreground mt-1">Launched pilot program in a single government high school in Hyderabad with 30 students.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1.5 size-4 rounded-full border-2 border-brand bg-background" />
                    <span className="text-xs font-bold text-brand uppercase tracking-wider">2025</span>
                    <h5 className="font-bold text-foreground text-sm mt-0.5">Expanding to 9 Campuses</h5>
                    <p className="text-xs text-muted-foreground mt-1">Formed college volunteer chapters across major technical universities in Telangana and AP.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1.5 size-4 rounded-full border-2 border-brand-orange bg-background animate-pulse" />
                    <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">2026 (Active)</span>
                    <h5 className="font-bold text-foreground text-sm mt-0.5">Vercel & Supabase Scale</h5>
                    <p className="text-xs text-muted-foreground mt-1">Expanding curriculum support to prompt engineering, creative design, and automated session evidence tools.</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mission (reused content block) */}
      <Mission content={mission} />

      {/* Strategic pillars */}
      <section className="section-padding bg-muted/40 relative overflow-hidden">
        {/* Glow Flourishes */}
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-40 size-[30rem] rounded-full bg-gradient-to-br from-brand-orange/5 to-transparent blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -top-40 -right-40 size-[30rem] rounded-full bg-gradient-to-br from-brand-teal/5 to-transparent blur-3xl" />

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
                <article className={`group h-full rounded-2xl border border-border bg-card/60 dark:bg-card/25 backdrop-blur-sm p-7 shadow-soft transition-all duration-300 hover:translate-y-[-4px] hover:shadow-soft-lg ${pillar.hoverBorder}`}>
                  <span className={`grid size-12 place-items-center rounded-xl transition-all duration-300 ${pillar.iconBg}`}>
                    <pillar.icon className="size-6" aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-extrabold text-foreground group-hover:text-brand transition-colors duration-300">{pillar.title}</h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
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
