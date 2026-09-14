'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Sparkles, ArrowRight, Play, RotateCcw, CheckCircle2, MessageSquare, Terminal } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface Stage {
  id: number
  title: string
  subtitle: string
  badge: string
  image: string
  caption: string
  description: string
  quote?: string
}

const STAGES: Stage[] = [
  {
    id: 1,
    title: 'The Question',
    subtitle: 'MPPS Nandakramaguda, Rangareddy District',
    badge: 'Classroom Ask',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1200/v1784177864/IMG-20260406-WA0007_3_hboy0k.jpg',
    caption: 'Class 7 student typing on a shared tablet for the first time',
    description:
      'The session had just begun. Students were quiet, uncertain if they were allowed to touch the tablets. Then one student raised his hand with a grin and asked in Telugu: "Anna, can it make a picture of Allu Arjun?"',
    quote: '"Anna, can it make a picture of Allu Arjun?"',
  },
  {
    id: 2,
    title: 'The AI Output',
    subtitle: 'Neural generation rendered live in the classroom',
    badge: 'The Generation',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1200/v1784177877/DJI_20260711131020_0287_D_rvh8gg.jpg',
    caption: 'Volunteers and students huddling around the screen as the prompt resolves',
    description:
      'The volunteer didn\'t say no. He showed the student how to construct the prompt: "Cinematic portrait of movie hero Allu Arjun, golden hour light, Hyderabad background, heroic stance." In seconds, the screen populated with art.',
    quote: '"You don\'t just ask for an image — you describe the world you want to see."',
  },
  {
    id: 3,
    title: 'The Reaction',
    subtitle: 'The moment passive listeners became active creators',
    badge: 'The Room Erupts',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1200/v1784177867/IMG_20260324_121056961_prkzll.jpg',
    caption: 'The classroom erupting in laughter, high-fives, and hands in the air',
    description:
      'The entire classroom leaned in. The silence broke into loud cheers and laughter. Suddenly every single hand was up: "Can it make an astronaut?", "Can it explain Mars in Telugu?", "Can I make my own movie poster?" The divide vanished.',
    quote: '"That\'s when we knew: once a child realizes technology can build their own ideas, fear disappears forever."',
  },
]

export function AlluArjunMoment() {
  const [currentStage, setCurrentStage] = useState<number>(1)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [promptText, setPromptText] = useState<string>(
    'Cinematic hero portrait of Allu Arjun, golden festive lighting, Hyderabad street backdrop, vibrant colors'
  )

  const activeStageData = STAGES.find((s) => s.id === currentStage) || STAGES[0]

  const handleSimulateGeneration = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setCurrentStage(3)
    }, 1800)
  }

  return (
    <section id="the-question" className="tai-section relative overflow-hidden bg-background">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        {/* Editorial Eyebrow & Headline */}
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.2em] text-brand">
            <Sparkles className="size-4" />
            The first question matters
          </div>
          <h2 className="tai-text-display mt-4 font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            &ldquo;Anna, can it make a picture of Allu Arjun?&rdquo;
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground md:text-xl">
            Technology is never adopted through abstract theory. It starts with what a child already loves. 
            Here is the exact story of how one spontaneous question transformed an entire classroom.
          </p>
        </div>

        {/* Interactive Story Showcase Container */}
        <div className="mt-12 rounded-3xl border border-foreground/15 bg-card p-6 shadow-xl lg:p-10">
          {/* Stage Progress Bar / Tabs */}
          <div className="grid grid-cols-3 gap-2 border-b border-foreground/10 pb-6 md:gap-6">
            {STAGES.map((s) => {
              const isActive = s.id === currentStage
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentStage(s.id)}
                  className={`group relative flex flex-col items-start rounded-xl p-3 text-left transition-all sm:p-4 ${
                    isActive
                      ? 'bg-brand/10 text-brand ring-1 ring-brand/30'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex size-7 items-center justify-center rounded-full text-xs font-bold sm:text-sm ${
                        isActive ? 'bg-brand text-white' : 'bg-foreground/10 text-foreground'
                      }`}
                    >
                      {s.id}
                    </span>
                    <span className="font-mono text-xs font-bold uppercase tracking-wider hidden sm:inline sm:text-sm">
                      {s.badge}
                    </span>
                  </div>
                  <span className="mt-2 text-sm font-semibold sm:text-base lg:text-lg text-foreground">
                    {s.title}
                  </span>
                  <div
                    className={`mt-2 h-1 w-full rounded-full transition-all ${
                      isActive ? 'bg-brand' : 'bg-transparent group-hover:bg-foreground/15'
                    }`}
                  />
                </button>
              )
            })}
          </div>

          {/* Active Stage Content Display */}
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Visual Media Pane */}
            <div className="lg:col-span-7">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-foreground/20 bg-black sm:aspect-[16/10]">
                <Image
                  src={activeStageData.image}
                  alt={activeStageData.caption}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 font-mono text-xs font-medium text-white backdrop-blur-sm sm:text-sm">
                  {activeStageData.subtitle}
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-sm text-white/85 sm:text-base">
                    {activeStageData.caption}
                  </p>
                </div>
              </div>
            </div>

            {/* Narrative & Interactive Prompt Pane */}
            <div className="flex flex-col justify-between lg:col-span-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3.5 py-1 font-mono text-xs sm:text-sm font-bold text-brand">
                  Phase {activeStageData.id} of 3 · {activeStageData.badge}
                </span>

                <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                  {activeStageData.quote || activeStageData.title}
                </h3>

                <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {activeStageData.description}
                </p>

                {/* Interactive Simulated Prompt Sandbox */}
                <div className="mt-6 rounded-xl border border-foreground/15 bg-background p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-mono font-medium">
                      <Terminal className="size-4 text-brand" />
                      Classroom Prompt Studio
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-semibold text-emerald-600">Model: Live Demo</span>
                  </div>

                  <div className="mt-2.5 rounded-lg bg-muted/60 p-3.5 font-mono text-sm text-foreground">
                    &gt; &quot;{promptText}&quot;
                  </div>

                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Telugu translation: అల్లు అర్జున్ సినిమా పోస్టర్
                    </span>
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={handleSimulateGeneration}
                      className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-50 shrink-0"
                    >
                      {isGenerating ? (
                        <>
                          <Sparkles className="size-3.5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Play className="size-3.5" />
                          Run Classroom Prompt
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="mt-8 flex items-center justify-between border-t border-foreground/10 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStage((prev) => (prev > 1 ? prev - 1 : 3))}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-4" />
                  Previous Stage
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStage((prev) => (prev < 3 ? prev + 1 : 1))}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-deep"
                >
                  Next: {currentStage === 3 ? 'Back to The Question' : STAGES[currentStage]?.title}
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
