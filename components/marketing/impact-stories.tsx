import { BookOpen, Sparkles, Heart } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface StoryCard {
  eyebrow: string
  title: string
  location: string
  body: string
  highlight: string
  icon: typeof BookOpen
}

const STORIES: StoryCard[] = [
  {
    eyebrow: 'Story 01',
    title: 'A Question',
    location: 'MPPS Nandakramaguda',
    body: 'The session had just begun. Thirty students sat quietly, uncertain if they were allowed to touch the tablets. Then a student raised his hand with a grin and asked in Telugu: "Anna, can it make a picture of Allu Arjun?" The NIAT volunteer didn\'t say no. In two minutes, the room turned into an active workshop.',
    highlight: '“Once a child realizes technology can build their own ideas, fear disappears forever.”',
    icon: Sparkles,
  },
  {
    eyebrow: 'Story 02',
    title: 'A Classroom',
    location: 'ZPHS Bachupally',
    body: 'Most students here had never interacted with AI models before. Working in pairs on shared tablets, they formulated prompts, adjusted descriptive adjectives, and watched neural generators render their thoughts. By the end of the hour, students who had never coded were debugging prompt instructions.',
    highlight: '“They went from consumers of screen time to directors of AI tools.”',
    icon: BookOpen,
  },
  {
    eyebrow: 'Story 03',
    title: 'A Return',
    location: 'After the Pilot Session',
    body: 'The 75 minutes were over and materials were packed up, but the students lingered around the desk asking NIAT students questions about engineering, careers, and coding. One student asked the question that defined our purpose: "Anna, when are you coming again?" That was the exact moment we knew this wasn\'t just a one-off workshop.',
    highlight: '“That one question told us more than any survey could. There was a reason to come back.”',
    icon: Heart,
  },
]

export function ImpactStories() {
  return (
    <section className="tai-section bg-background py-16 md:py-24 border-b border-foreground/10">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="tai-eyebrow text-brand">Classroom Field Notes</p>
          <h2 className="tai-text-display mt-3 font-display text-foreground">
            Impact stories from the ground.
          </h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            Documented moments that show what happens when curiosity replaces hesitation.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STORIES.map((s, idx) => {
            const Icon = s.icon
            return (
              <Reveal key={s.title} delay={idx * 0.1}>
                <article className="flex h-full flex-col justify-between rounded-2xl border border-foreground/15 bg-card/40 p-7 transition-all hover:border-brand/40 hover:bg-card hover:shadow-sm">
                  <div>
                    <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand">
                        {s.eyebrow}
                      </span>
                      <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                        <Icon className="size-4" />
                      </div>
                    </div>

                    <h3 className="mt-5 font-display text-2xl font-bold text-foreground">
                      {s.title}
                    </h3>
                    <p className="font-mono text-xs font-medium text-muted-foreground mt-1">
                      {s.location}
                    </p>

                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {s.body}
                    </p>
                  </div>

                  <div className="mt-6 pt-5 border-t border-foreground/10">
                    <p className="font-display text-sm italic text-foreground leading-snug">
                      {s.highlight}
                    </p>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
