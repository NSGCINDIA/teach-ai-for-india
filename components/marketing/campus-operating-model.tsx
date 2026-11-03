'use client'

import { ArrowRight, BookOpen, CheckCircle2, HeartHandshake, Lightbulb, MessageSquareQuote, Users } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface OperatingStep {
  step: string
  title: string
  summary: string
  detail: string
  icon: typeof Users
  badge: string
}

const STEPS: OperatingStep[] = [
  {
    step: '01',
    title: 'FORM A TEAM',
    summary: 'NIAT students come together around the mission.',
    detail: 'Passionate NIAT students unite as a recognized campus chapter, assigning outreach and execution coordinators.',
    icon: Users,
    badge: 'Mobilization',
  },
  {
    step: '02',
    title: 'PREPARE',
    summary: 'The team learns the curriculum and prepares the session.',
    detail: 'Volunteers master the applied AI syllabus, test sandbox environments, and practice child-friendly analogies before entering the room.',
    icon: BookOpen,
    badge: 'Training',
  },
  {
    step: '03',
    title: 'CONNECT',
    summary: 'The team builds relationships with nearby schools.',
    detail: 'Student outreach leads coordinate directly with local government school headmasters and teachers to schedule free workshop slots.',
    icon: HeartHandshake,
    badge: 'Partnership',
  },
  {
    step: '04',
    title: 'TEACH',
    summary: 'NIAT students facilitate hands-on AI learning.',
    detail: 'In 60 to 90 minute interactive sessions, NIAT student volunteers guide children through prompt engineering, creative tools, and basic programming concepts.',
    icon: Lightbulb,
    badge: 'Execution',
  },
  {
    step: '05',
    title: 'LISTEN',
    summary: 'The team gathers feedback from students and educators.',
    detail: 'Volunteers collect authentic reflections, student drawings, questions, and teacher assessments immediately following the session.',
    icon: MessageSquareQuote,
    badge: 'Feedback',
  },
  {
    step: '06',
    title: 'IMPROVE',
    summary: 'The next session gets better.',
    detail: 'Learnings, bottlenecks, and student inquiries feed right back into the chapter syllabus, ensuring continuous refinement for the next classroom.',
    icon: CheckCircle2,
    badge: 'Evolution',
  },
]

export function CampusOperatingModel() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-16 md:py-24">
      <div className="container-wide px-5 md:px-8 lg:px-16">
        <Reveal>
          <div className="max-w-3xl">
            <span className="section-label text-brand">The Operating Loop</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl text-balance">
              How a campus turns an idea into impact.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
              Every Teach AI for India chapter is powered by NIAT students running a disciplined, repeatable cycle.
              From the first volunteer meetup to the final classroom evaluation, each step is designed
              for genuine student learning.
            </p>
          </div>
        </Reveal>

        {/* 6 Steps Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((item, idx) => {
            const Icon = item.icon
            return (
              <Reveal key={item.step} delay={idx * 0.07} className="h-full">
                <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-soft-lg dark:bg-card/25">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-brand bg-brand/10 px-2.5 py-1 rounded-md">
                        {item.step}
                      </span>
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {item.badge}
                      </span>
                    </div>

                    {/* Title & Icon */}
                    <div className="mt-5 flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-muted text-foreground group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                        <Icon className="size-5" />
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground group-hover:text-brand transition-colors">
                        {item.title}
                      </h3>
                    </div>

                    <p className="mt-3 font-medium text-sm text-foreground/90">
                      {item.summary}
                    </p>

                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      {item.detail}
                    </p>
                  </div>

                  {/* Flow connector line */}
                  <div className="mt-6 flex items-center gap-2 border-t border-border/50 pt-3 text-xs font-semibold text-muted-foreground">
                    <span>Phase {idx + 1} of 6</span>
                    {idx < STEPS.length - 1 && (
                      <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-brand font-bold">
                        Next: {STEPS[idx + 1].title} <ArrowRight className="size-3" />
                      </span>
                    )}
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
