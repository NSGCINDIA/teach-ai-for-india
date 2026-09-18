'use client'

import { useState } from 'react'
import { Sparkles, Quote, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface StudentQuestion {
  question: string
  context: string
  student: string
  school: string
  impact: string
}

const QUESTIONS: StudentQuestion[] = [
  {
    question: 'Anna, can it make a picture of Allu Arjun?',
    context: 'Asked spontaneously during the first live prompting demonstration.',
    student: 'Class 8 Student',
    school: 'ZPHS Bachupally, Rangareddy',
    impact: 'Led to our entire culturally relevant prompt engineering module.',
  },
  {
    question: 'Anna, when are you coming again?',
    context: 'Asked while NIAT student volunteers were packing equipment after a 75-minute workshop.',
    student: 'Class 7 Student',
    school: 'MPPS Nanakramguda, Hyderabad',
    impact: 'Turned a single pilot school into a recurring campus chapter commitment.',
  },
  {
    question: 'Can we write our poem in Telugu and see what it draws?',
    context: 'Students experimenting with native-language text parameters.',
    student: 'Class 9 Student',
    school: 'Government High School, Warangal',
    impact: 'Inspired NIAT students to develop a localized Telugu translation wrapper.',
  },
  {
    question: 'How does the computer know what a mango tree looks like?',
    context: 'Curious inquiry about training data and how AI recognizes real-world objects.',
    student: 'Class 6 Student',
    school: 'Rural High School, Chevella',
    impact: 'Sparked an unplugged chalk-and-board lesson on pattern recognition.',
  },
  {
    question: 'Can AI help me study mathematics in my own language?',
    context: 'A student asking if chatbots can explain formulas in regional medium.',
    student: 'Class 10 Student',
    school: 'ZPH High School Sontyam, Visakhapatnam',
    impact: 'Reinforced our focus on educational prompt design for curriculum topics.',
  },
]

export function StoriesQuestionsSpotlight() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = () => setCurrentIndex((prev) => (prev + 1) % QUESTIONS.length)
  const prev = () => setCurrentIndex((prev) => (prev - 1 + QUESTIONS.length) % QUESTIONS.length)

  const current = QUESTIONS[currentIndex]

  return (
    <section className="relative overflow-hidden border-b border-border bg-card/30 py-16 md:py-24">
      <div className="container-wide px-5 md:px-8 lg:px-16">
        <Reveal>
          <div className="max-w-3xl">
            <span className="section-label text-brand">Classroom Inquiries</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl text-balance">
              Sometimes, the best stories start with a question.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
              In government-school classrooms, children don&apos;t ask theoretical questions.
              They ask NIAT students questions rooted in wonder, culture, and their everyday lives.
            </p>
          </div>
        </Reveal>

        {/* Large Editorial Typography Question Stage */}
        <div className="mt-12">
          <Reveal key={current.question}>
            <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-8 md:p-14 shadow-soft-lg">
              <Quote className="size-12 text-brand/20 mb-4" />

              <blockquote className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold italic text-foreground tracking-tight leading-tight max-w-4xl">
                &quot;{current.question}&quot;
              </blockquote>

              <div className="mt-8 grid gap-6 md:grid-cols-3 border-t border-border/60 pt-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                    The Voice
                  </span>
                  <p className="mt-1 font-display text-base font-bold text-foreground">
                    {current.student}
                  </p>
                  <p className="text-xs text-muted-foreground">{current.school}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Context
                  </span>
                  <p className="mt-1 text-xs text-foreground/90 leading-relaxed font-medium">
                    {current.context}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                    Classroom Impact
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {current.impact}
                  </p>
                </div>
              </div>

              {/* Navigation controls */}
              <div className="mt-8 flex items-center justify-between border-t border-border/40 pt-4">
                <span className="text-xs font-mono text-muted-foreground font-medium">
                  0{currentIndex + 1} of 0{QUESTIONS.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prev}
                    className="grid size-10 place-items-center rounded-full border border-border bg-background text-foreground shadow-xs transition-colors hover:bg-muted"
                    aria-label="Previous question"
                  >
                    <ChevronLeft className="size-4.5" />
                  </button>
                  <button
                    onClick={next}
                    className="grid size-10 place-items-center rounded-full border border-border bg-background text-foreground shadow-xs transition-colors hover:bg-muted"
                    aria-label="Next question"
                  >
                    <ChevronRight className="size-4.5" />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
