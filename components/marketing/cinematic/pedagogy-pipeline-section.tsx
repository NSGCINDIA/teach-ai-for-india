'use client'

import { useState } from 'react'
import {
  GraduationCap,
  Users2,
  Cpu,
  Laptop,
  FolderGit2,
  HeartHandshake,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: string
  number: string
  title: string
  role: string
  icon: typeof GraduationCap
  description: string
  classroomEvidence: string
}

const STEPS: Step[] = [
  {
    id: 'mentor',
    number: '01',
    title: 'The NIAT Mentor',
    role: 'Undergraduate Engineering Leader',
    icon: GraduationCap,
    description:
      'College students don’t wait for graduation to give back. Trained NIAT volunteers travel to rural and peri-urban government schools equipped with lesson plans and computers.',
    classroomEvidence: 'Peer-to-peer energy bridges the intimidating age divide between teacher and child.',
  },
  {
    id: 'student',
    number: '02',
    title: 'The Government School Child',
    role: 'Curious & Capable Learner',
    icon: Users2,
    description:
      'Sitting at wooden benches, students who previously used computers only for typing or drawing MS Paint lines are introduced to interactive conversational intelligence.',
    classroomEvidence: 'Within 15 minutes, initial shyness transforms into enthusiastic hand-raising.',
  },
  {
    id: 'experiment',
    number: '03',
    title: 'The Hands-on Experiment',
    role: 'Keyboards Over Blackboards',
    icon: Laptop,
    description:
      'Every child gets keyboard time. They test hypothesis prompts: "What if the sun had two moons?", "Explain photosynthesis like a cricket match."',
    classroomEvidence: 'Learning is anchored in tactile experimentation and immediate feedback loops.',
  },
  {
    id: 'ai',
    number: '04',
    title: 'The AI Interaction',
    role: 'Multilingual Intelligence',
    icon: Cpu,
    description:
      'The model responds in Telugu, Hindi, or English. Children observe how precise phrasing changes outcomes, understanding algorithmic cause-and-effect.',
    classroomEvidence: 'Language barriers dissolve as generative tools speak the mother tongue of the student.',
  },
  {
    id: 'project',
    number: '05',
    title: 'The Applied Project',
    role: 'Tangible Student Artifact',
    icon: FolderGit2,
    description:
      'Students do not leave with empty notes. They create: an illustrated fable, a science quiz for younger siblings, or an agricultural information poster.',
    classroomEvidence: 'Children leave the workshop clutching printed certificates and physical project printouts.',
  },
  {
    id: 'impact',
    number: '06',
    title: 'The Multiplier Effect',
    role: 'Knowledge Passed Forward',
    icon: HeartHandshake,
    description:
      'When students return home, they show parents and friends what they built. Teachers use the materials for ongoing classroom periods throughout the semester.',
    classroomEvidence: 'One single afternoon session permanently alters a child’s vision of what they can become.',
  },
]

export function PedagogyPipelineSection() {
  const [activeStepId, setActiveStepId] = useState('experiment')
  const activeStep = STEPS.find((s) => s.id === activeStepId) || STEPS[0]

  return (
    <section
      id="scene-pedagogy"
      aria-label="How We Teach: The Connected Learning Journey"
      className="relative w-full py-24 sm:py-32 bg-[#FAF8F5] text-[#1B1B1B] overflow-hidden border-b border-[#E2DDD5]"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#E09F3E]/15 border border-[#E09F3E]/30 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-[#B87A14] font-semibold">
            <Sparkles className="size-3.5 text-[#B87A14]" />
            Teaching Methodology
          </span>
          <h2 className="mt-5 font-display text-4xl sm:text-6xl font-bold tracking-tight text-[#1B1B1B]">
            How We Teach
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#555] font-serif max-w-2xl mx-auto">
            Learning is not a presentation — it is an active circuit. Follow the continuous journey
            from an engineering mentor arriving in a village to the child creating their first project.
          </p>
        </div>

        {/* ─── CONNECTED 6-STEP PIPELINE TRACK ─────────────────────────────── */}
        <div className="mt-14 sm:mt-18 relative">
          {/* Subtle connecting line behind steps (desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-1 bg-gradient-to-r from-[#9E2A2B] via-[#E09F3E] to-[#2D5A27] -translate-y-1/2 z-0 opacity-20" />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative z-10">
            {STEPS.map((step) => {
              const Icon = step.icon
              const isActive = activeStepId === step.id

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStepId(step.id)}
                  className={cn(
                    'flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer',
                    isActive
                      ? 'bg-white border-[#9E2A2B] shadow-lg ring-2 ring-[#9E2A2B]/15 scale-102'
                      : 'bg-white/80 border-[#E2DDD5] hover:border-[#9E2A2B]/40 hover:bg-white shadow-xs'
                  )}
                >
                  <div
                    className={cn(
                      'size-12 rounded-xl flex items-center justify-center mb-3 transition-transform',
                      isActive ? 'bg-[#9E2A2B] text-white shadow-md scale-105' : 'bg-[#FAF8F5] text-[#555]'
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E2A2B] font-bold">
                    STEP {step.number}
                  </span>
                  <span className="font-sans text-xs sm:text-sm font-semibold text-[#1B1B1B] mt-1.5 leading-snug tracking-tight">
                    {step.title}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ─── ACTIVE STEP DEEP-DIVE SPOTLIGHT ──────────────────────────────── */}
        <div className="mt-12 sm:mt-16 bg-white border border-[#E2DDD5] rounded-3xl p-6 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FAF8F5] border border-[#ECE8E1] text-[#9E2A2B] font-mono text-xs uppercase tracking-wider font-semibold mb-3">
                <span>Phase {activeStep.number} of 06</span>
                <span>·</span>
                <span>{activeStep.role}</span>
              </div>
              <h3 className="font-sans text-2xl sm:text-4xl font-bold text-[#1B1B1B] tracking-tight">
                {activeStep.title}
              </h3>
              <p className="mt-4 text-base sm:text-lg text-[#555] leading-relaxed font-sans">
                {activeStep.description}
              </p>
            </div>

            <div className="md:col-span-4 p-5 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1]">
              <span className="font-mono text-xs text-[#2D5A27] uppercase tracking-widest block mb-2 font-semibold">
                Classroom Reality
              </span>
              <p className="text-sm font-serif italic text-[#333] leading-relaxed">
                &ldquo;{activeStep.classroomEvidence}&rdquo;
              </p>
              <div className="mt-4 pt-3 border-t border-[#E8E4DC] flex items-center justify-between text-[11px] font-mono text-[#777]">
                <span>Pass-it-Forward Model</span>
                <span className="text-[#2D5A27] font-semibold">Verified ✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
