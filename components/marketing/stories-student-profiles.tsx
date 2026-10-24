'use client'

import { useState } from 'react'
import { Sparkles, Quote, GraduationCap, MapPin, CheckCircle2 } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface StudentProfile {
  id: string
  name: string
  grade: string
  school: string
  location: string
  quote: string
  before: string
  inside: string
  moment: string
  after: string
}

const STUDENTS: StudentProfile[] = [
  {
    id: 'akhil',
    name: 'Akhil',
    grade: 'Class 8',
    school: 'ZPHS Bachupally',
    location: 'Rangareddy District',
    quote: 'Anna, can it make a picture of Allu Arjun?',
    before:
      'Had only interacted with smartphones for video streaming and gaming. Had never seen an AI tool or written instructions for software.',
    inside:
      'Paired with a NIAT student volunteer copilot on a tablet; learned how descriptive keywords and style parameters influence machine outputs.',
    moment:
      'Asked if the system knew his favorite Telugu cinema icon; watched the room erupt in excitement when his prompt synthesized on screen.',
    after:
      'Stayed back after the bell to ask what subjects he needs to study in high school to build tools like this himself.',
  },
  {
    id: 'sai',
    name: 'Sai',
    grade: 'Class 7',
    school: 'MPPS Nanakramguda',
    location: 'Hyderabad',
    quote: 'Anna, when are you coming again?',
    before:
      'Expected a routine blackboard lecture on basic computer hardware parts like monitors and CPUs.',
    inside:
      'Experimented directly with voice prompting and creative generative tools in a small group of three classmates.',
    moment:
      'Realized the computer was responding to his thoughts rather than just executing pre-saved slides.',
    after:
      'Asked the NIAT volunteers as they packed up when they would return, sparking our commitment to recurring campus visits.',
  },
  {
    id: 'divya',
    name: 'Divya',
    grade: 'Class 9',
    school: 'Government High School',
    location: 'Warangal Outskirts',
    quote: 'Can we write our poem in Telugu and see what it draws?',
    before:
      'Believed programming and modern digital creation tools required complete English fluency.',
    inside:
      'Tested the Telugu localization wrapper built by NIAT engineering volunteers, typing native script into the parameter box.',
    moment:
      'Prompted a descriptive village scene in Telugu and saw the visual emerge with vibrant cultural fidelity.',
    after:
      'Took notes on prompt structure in her workbook to share with her younger siblings at home.',
  },
]

export function StoriesStudentProfiles() {
  const [selectedStudentId, setSelectedStudentId] = useState(STUDENTS[0].id)
  const activeStudent = STUDENTS.find((s) => s.id === selectedStudentId) ?? STUDENTS[0]

  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-16 md:py-24">
      <div className="container-wide px-5 md:px-8 lg:px-16">
        <Reveal>
          <div className="max-w-3xl">
            <span className="section-label text-brand">Student Experiences</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl text-balance">
              Meet the students.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
              Behind every session attendance count is a young mind encountering AI for the first
              time. Here is what happens before, during, and after they enter the classroom.
            </p>
          </div>
        </Reveal>

        {/* Student Selector Cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {STUDENTS.map((student) => (
            <button
              key={student.id}
              onClick={() => setSelectedStudentId(student.id)}
              className={`rounded-2xl p-5 text-left transition-all duration-300 ${
                selectedStudentId === student.id
                  ? 'border-2 border-brand bg-card shadow-soft-lg ring-2 ring-brand/10'
                  : 'border border-border bg-card/60 hover:bg-card hover:border-border/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold text-foreground">
                  {student.name}
                </span>
                <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand">
                  {student.grade}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{student.school}</p>
              <p className="mt-3 text-xs italic font-semibold text-foreground/90 line-clamp-2">
                &quot;{student.quote}&quot;
              </p>
            </button>
          ))}
        </div>

        {/* Active Student Detailed Journey */}
        <div className="mt-8">
          <Reveal key={activeStudent.id}>
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft-lg md:p-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
                      {activeStudent.name}
                    </h3>
                    <span className="rounded-md bg-brand/10 px-2 py-0.5 text-xs font-bold text-brand">
                      {activeStudent.grade}
                    </span>
                  </div>
                  <p className="mt-1 inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <GraduationCap className="size-3.5 text-brand" /> {activeStudent.school}
                    <span>•</span>
                    <MapPin className="size-3.5 text-brand-teal" /> {activeStudent.location}
                  </p>
                </div>

                {/* Highlight Quote */}
                <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-2.5 text-left md:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                    Classroom Quote
                  </span>
                  <p className="font-display text-sm font-bold italic text-foreground mt-0.5">
                    &quot;{activeStudent.quote}&quot;
                  </p>
                </div>
              </div>

              {/* 4-Step Narrative Flow */}
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* 1. BEFORE THE SESSION */}
                <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-muted/20 p-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      01 • BEFORE THE SESSION
                    </span>
                    <h4 className="mt-2 font-display text-base font-bold text-foreground">
                      Prior Expectations
                    </h4>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      {activeStudent.before}
                    </p>
                  </div>
                </div>

                {/* 2. INSIDE THE CLASSROOM */}
                <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-muted/20 p-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                      02 • INSIDE THE CLASSROOM
                    </span>
                    <h4 className="mt-2 font-display text-base font-bold text-foreground">
                      Hands-on Experience
                    </h4>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      {activeStudent.inside}
                    </p>
                  </div>
                </div>

                {/* 3. THE MOMENT */}
                <div className="flex flex-col justify-between rounded-2xl border border-brand/30 bg-brand/5 p-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange">
                      03 • THE MOMENT
                    </span>
                    <h4 className="mt-2 font-display text-base font-bold text-foreground">
                      The Discovery
                    </h4>
                    <p className="mt-2 text-xs text-foreground/90 font-medium leading-relaxed">
                      {activeStudent.moment}
                    </p>
                  </div>
                </div>

                {/* 4. AFTER */}
                <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-muted/20 p-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                      04 • AFTER
                    </span>
                    <h4 className="mt-2 font-display text-base font-bold text-foreground">
                      Curiosity Sparked
                    </h4>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      {activeStudent.after}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-[11px] text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>Documented classroom interaction from regional school outreach.</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
