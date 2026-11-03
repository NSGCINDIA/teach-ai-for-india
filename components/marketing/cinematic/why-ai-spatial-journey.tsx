'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Sparkles, Brain, Lightbulb, Compass, Award, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Stage {
  id: string
  step: string
  title: string
  subtitle: string
  conceptTags: string[]
  description: string
  studentThought: string
  interactiveDemo: {
    prompt: string
    result: string
  }
}

const STAGES: Stage[] = [
  {
    id: 'learn',
    step: '01',
    title: 'LEARN',
    subtitle: 'From Passive Consumers to Active Questioners',
    conceptTags: ['Foundational Models', 'Prompt Mechanics', 'Machine Perception'],
    description:
      'Children understand that AI is not magical or intimidating, but a mathematical assistant waiting for clear instructions. They learn how to give context, set constraints, and ask powerful questions.',
    studentThought: '“I don’t just watch videos anymore. Now I can ask AI how a rocket engine works in Telugu!”',
    interactiveDemo: {
      prompt: 'Explain gravity using mangoes falling from a banyan tree...',
      result: 'Earth attracts mangoes just like the ground pulls your cricket ball back down.',
    },
  },
  {
    id: 'create',
    step: '02',
    title: 'CREATE',
    subtitle: 'Imagination Unleashed in Multilingual Code & Art',
    conceptTags: ['Generative Media', 'Visual Storytelling', 'Iterative Refinement'],
    description:
      'Students type their first creative prompts to generate original folklore illustrations, poems in their mother tongue, and digital science posters for their school hallway.',
    studentThought: '“I wrote three sentences and the computer generated a painting of my village festival in seconds.”',
    interactiveDemo: {
      prompt: 'Draw an Indian village festival with kites and colorful lanterns...',
      result: '🎨 High-resolution generative canvas rendered with bright festival colors.',
    },
  },
  {
    id: 'solve',
    step: '03',
    title: 'SOLVE',
    subtitle: 'Addressing Everyday Real-World Village Challenges',
    conceptTags: ['Local Problem Solving', 'Agricultural AI', 'Public Health Logic'],
    description:
      'Students explore how AI can help identify plant diseases on farmers’ leaves, translate healthcare notices into local dialects, and organize study schedules for exams.',
    studentThought: '“My uncle’s tomato crop had leaf spots. We uploaded a photo to an AI vision tool to check what pest it was.”',
    interactiveDemo: {
      prompt: 'Analyze this photo of yellow tomato leaves for early blight symptoms...',
      result: 'Identified: Early Blight (Alternaria solani). Recommended: Organic neem spray & drip drainage.',
    },
  },
  {
    id: 'lead',
    step: '04',
    title: 'LEAD',
    subtitle: 'Bridging the Divide: Future-Ready Youth',
    conceptTags: ['Digital Confidence', 'Career Aspirations', 'Peer Mentoring'],
    description:
      'Government school students no longer feel left behind in the tech wave. They mentor their younger peers, gain digital self-efficacy, and dream of careers in engineering, design, and research.',
    studentThought: '“Now I know that my background doesn’t limit my future. I can build software too.”',
    interactiveDemo: {
      prompt: 'Outline a student-led robotics club for a rural high school...',
      result: '10-week curriculum created with low-cost sensors and open-source AI assistants.',
    },
  },
]

export function WhyAiSpatialJourney() {
  const [activeStageIndex, setActiveStageIndex] = useState(0)
  const currentStage = STAGES[activeStageIndex]

  return (
    <section
      id="scene-why-ai"
      aria-label="Why AI Education Matters: The Student Journey"
      className="relative w-full py-24 sm:py-32 bg-[#101412] text-white overflow-hidden border-b border-white/10"
    >
      {/* Background glow radial */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-emerald-300 backdrop-blur-md">
            <Brain className="size-3.5 text-emerald-400" />
            Chapter 02 · The Transformation
          </span>
          <h2 className="mt-5 font-display text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            Why AI Education Matters
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/75 font-serif max-w-2xl mx-auto">
            When a child in a government school learns to interact with artificial intelligence, fear
            is replaced by agency. Follow the 4-step transformation.
          </p>
        </div>

        {/* ─── 4-STAGE INTERACTIVE PROGRESSION TABS ───────────────────────── */}
        <div className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-3">
          {STAGES.map((s, index) => {
            const isActive = activeStageIndex === index
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStageIndex(index)}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-5 py-3 font-mono text-sm tracking-wider uppercase transition-all duration-300 cursor-pointer border',
                  isActive
                    ? 'bg-amber-400 text-black border-amber-300 font-bold shadow-[0_0_20px_rgba(251,191,36,0.4)] scale-105'
                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                )}
              >
                <span className={cn('text-xs px-2 py-0.5 rounded-md font-bold', isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-white/60')}>
                  {s.step}
                </span>
                <span>{s.title}</span>
              </button>
            )
          })}
        </div>

        {/* ─── STAGE SPOTLIGHT CARD (SPATIAL DEPTH) ────────────────────────── */}
        <div className="mt-10 sm:mt-14 bg-gradient-to-b from-white/10 to-white/5 border border-white/15 rounded-3xl p-6 sm:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {currentStage.conceptTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 font-mono text-[11px] uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                  {currentStage.title}
                  <span className="block text-xl sm:text-2xl font-serif text-amber-300 mt-2 font-normal italic">
                    {currentStage.subtitle}
                  </span>
                </h3>

                <p className="mt-5 text-base sm:text-lg text-white/85 leading-relaxed font-sans">
                  {currentStage.description}
                </p>
              </div>

              {/* Real Student Quote Slate */}
              <div className="mt-8 p-5 rounded-2xl bg-black/40 border border-white/10 relative">
                <div className="text-xs font-mono text-amber-400/80 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="size-3" />
                  Student Reflection
                </div>
                <p className="text-sm sm:text-base italic text-emerald-100 font-serif leading-relaxed">
                  {currentStage.studentThought}
                </p>
              </div>
            </div>

            {/* Right Interactive Prompt Simulation Console (5 cols) */}
            <div className="lg:col-span-5 bg-[#080d09] rounded-2xl border border-white/15 p-5 shadow-inner flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-white/50">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>AI CLASSROOM TERMINAL</span>
                </span>
                <span>STEP {currentStage.step} / 04</span>
              </div>

              <div className="py-6 space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/90 block mb-1">
                    Student Prompt:
                  </span>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-xs sm:text-sm text-white/95 leading-relaxed">
                    &gt; {currentStage.interactiveDemo.prompt}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/90 block mb-1">
                    AI Output:
                  </span>
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 font-mono text-xs sm:text-sm text-emerald-200 leading-relaxed">
                    {currentStage.interactiveDemo.result}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/60">
                <span>Hands-on verified session</span>
                <button
                  type="button"
                  onClick={() => setActiveStageIndex((prev) => (prev + 1) % STAGES.length)}
                  className="flex items-center gap-1 text-amber-300 hover:text-white transition-colors cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="size-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
