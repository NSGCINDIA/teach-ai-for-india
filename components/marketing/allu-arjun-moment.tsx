'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Sparkles, ArrowRight, Play, RotateCcw, Terminal } from 'lucide-react'
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
    title: "A Student's Question",
    subtitle: 'MPPS Nandakramaguda, Rangareddy District',
    badge: 'The Spark',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1200/v1784177864/IMG-20260406-WA0007_3_hboy0k.jpg',
    caption: 'Class 7 student raising his hand on a shared tablet for the first time',
    description:
      'The session had just begun. Students were quiet, uncertain if they were allowed to touch the tablets. Then one student raised his hand with a grin and asked in Telugu: "Anna, can it make a picture of Allu Arjun?"',
    quote: '"Anna, can it make a picture of Allu Arjun?"',
  },
  {
    id: 2,
    title: 'Curiosity',
    subtitle: 'The entire classroom leans in',
    badge: 'Leaning In',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1200/v1784177877/DJI_20260711131020_0287_D_rvh8gg.jpg',
    caption: 'The room shifts from hesitant silence into shared, collective curiosity',
    description:
      'The NIAT student volunteer didn\'t say no or pivot to a textbook slide. Instead, he asked: "What kind of picture do you want? What is he wearing? Where is he standing?" In an instant, thirty students stopped being passive listeners and started imagining.',
    quote: '"What does the movie hero look like in your mind?"',
  },
  {
    id: 3,
    title: 'Hands-on AI Experience',
    subtitle: 'Translating imagination into descriptive prompts',
    badge: 'Creating Together',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1200/v1784177864/WhatsApp_Image_2026-04-18_at_14.46.43_vtswq0.jpg',
    caption: 'Students taking turns typing their ideas directly into the interface',
    description:
      'The students took the tablet. Together with the NIAT volunteer, they translated Telugu thoughts into structured descriptive prompts: cinematic lighting, hero pose, Charminar backdrop. Hands reached out to touch the keys.',
    quote: '"You don\'t just ask for an image — you describe the world you want to see."',
  },
  {
    id: 4,
    title: 'Learning',
    subtitle: 'Neural generation renders live in the classroom',
    badge: 'The Concept Clicks',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1200/v1784177867/IMG_20260324_121056961_prkzll.jpg',
    caption: 'The classroom erupting in laughter, high-fives, and hands in the air',
    description:
      'In seconds, the output appeared on screen. The room erupted into cheers. But right behind the excitement came the realization: AI wasn\'t magic, and it wasn\'t just for software engineers in tech parks. It was a tool that listened to clear thinking.',
    quote: '"Wait — it understood what we asked for! The words became a picture!"',
  },
  {
    id: 5,
    title: 'Possibility',
    subtitle: 'The question that changed everything',
    badge: 'What Comes Next',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1200/v1784177911/DJI_20260711132101_0313_D_a48glv.jpg',
    caption: 'Students surrounding university mentors after the session ended',
    description:
      'Class had ended, but nobody wanted to leave. Hands stayed up: "Can it explain Mars in Telugu?", "Can I make my own comic book?", "Anna, when are you coming again?" One question opened the door to a world they didn\'t know they belonged in.',
    quote: '"Anna, when are you coming again? Can we build something next time?"',
  },
]

export function AlluArjunMoment() {
  const [currentStage, setCurrentStage] = useState<number>(1)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [promptText] = useState<string>(
    'Cinematic hero portrait of Allu Arjun, golden festive lighting, Hyderabad street backdrop, vibrant colors'
  )

  const activeStageData = STAGES.find((s) => s.id === currentStage) || STAGES[0]

  const handleSimulateGeneration = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setCurrentStage(4)
    }, 1800)
  }

  return (
    <section id="the-question" className="tai-section relative overflow-hidden bg-background">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        {/* Editorial Eyebrow & Headline */}
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.2em] text-brand">
            <Sparkles className="size-4" />
            Real classroom story
          </div>
          <h2 className="tai-text-display mt-4 font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            &ldquo;Anna, can it make a picture of Allu Arjun?&rdquo;
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground md:text-xl">
            Technology is never adopted through abstract theory. It starts with what a child already loves. 
            Here is the exact story of how one spontaneous question transformed an entire classroom.
          </p>

          {/* Emotional Highlight Line */}
          <div className="mt-6 inline-block rounded-xl border border-brand/20 bg-brand/5 px-4 py-2.5 sm:px-5">
            <p className="font-display text-base font-semibold text-foreground sm:text-lg">
              &ldquo;One question became curiosity. Curiosity became learning. Learning became possibility.&rdquo;
            </p>
          </div>
        </div>

        {/* Interactive Story Showcase Container */}
        <div className="mt-12 rounded-3xl border border-foreground/15 bg-card p-6 shadow-xl lg:p-10">
          {/* Stage Progress Bar / Tabs — 5 Steps Flow */}
          <div className="grid grid-cols-2 gap-2 border-b border-foreground/10 pb-6 sm:grid-cols-3 lg:grid-cols-5 md:gap-3">
            {STAGES.map((s) => {
              const isActive = s.id === currentStage
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentStage(s.id)}
                  className={`group relative flex flex-col items-start rounded-xl p-3 text-left transition-all ${
                    isActive
                      ? 'bg-brand/10 text-brand ring-1 ring-brand/30'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                        isActive ? 'bg-brand text-white' : 'bg-foreground/10 text-foreground'
                      }`}
                    >
                      {s.id}
                    </span>
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Step {s.id}
                    </span>
                  </div>
                  <span className="mt-2 text-xs sm:text-sm font-semibold text-foreground line-clamp-1">
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
                  Step {activeStageData.id} of 5 · {activeStageData.badge}
                </span>

                <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {activeStageData.quote || activeStageData.title}
                </h3>

                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {activeStageData.description}
                </p>

                {/* Interactive Simulated Prompt Sandbox */}
                <div className="mt-6 rounded-xl border border-foreground/15 bg-background p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-mono font-medium">
                      <Terminal className="size-4 text-brand" />
                      Classroom Prompt Studio
                    </span>
                    <span className="font-mono text-xs font-semibold text-emerald-600">Model: Live Demo</span>
                  </div>

                  <div className="mt-2.5 rounded-lg bg-muted/60 p-3 font-mono text-xs sm:text-sm text-foreground">
                    &gt; &quot;{promptText}&quot;
                  </div>

                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      Telugu translation: అల్లు అర్జున్ సినిమా పోస్టర్
                    </span>
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={handleSimulateGeneration}
                      className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-50 shrink-0"
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
                  onClick={() => setCurrentStage((prev) => (prev > 1 ? prev - 1 : 5))}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-4" />
                  Previous Step
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStage((prev) => (prev < 5 ? prev + 1 : 1))}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-deep"
                >
                  Next: {currentStage === 5 ? 'Back to Step 1' : STAGES[currentStage]?.title}
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
