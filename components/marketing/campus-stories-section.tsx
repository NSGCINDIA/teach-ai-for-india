'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MapPin, Building2, Quote, Sparkles, Calendar, ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface DocumentedStory {
  id: string
  campus: string
  university: string
  location: string
  tagline: string
  school: string
  teamAction: string
  classroomMoment: string
  studentQuote: string
  quoteAttribution: string
  image: string
}

const REAL_STORIES: DocumentedStory[] = [
  {
    id: 'kkh-warangal',
    campus: 'NIAT × KKH',
    university: 'KKH Campus',
    location: 'Hyderabad & Warangal, Telangana',
    tagline: 'Reviving a dormant computer lab with first-time prompts',
    school: 'Government High School Warangal Outskirts',
    teamAction:
      'Our campus team loaded four spare monitors and keyboards into an auto-rickshaw at 7:00 AM, arrived at the school, resolved two-year-old hardware blocks, and tethered the lab to mobile hotspots.',
    classroomMoment:
      'When ninth graders walked in, many had never typed on a keyboard. We asked them to describe a dream rocket. A student suggested "A rocket flying through a rainbow sky powered by bubble gum" in Telugu. When the vibrant image materialized on screen, the room erupted in cheers.',
    studentQuote:
      'The room fell completely silent when the AI interpreter generated their first custom Telugu prompt into a drawing. It was magic.',
    quoteAttribution: '— Sneha Reddy, Chapter Lead, NIAT × KKH',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177864/IMG-20260406-WA0007_3_hboy0k.jpg',
  },
  {
    id: 'nsrit-local',
    campus: 'NIAT × NSRIT',
    university: 'Nadimpalli Satyanarayana Raju Institute of Technology',
    location: 'Visakhapatnam, Andhra Pradesh',
    tagline: 'Bridging the language gap with Telugu prompting',
    school: 'ZPH High School Sontyam & Pendurthi',
    teamAction:
      'Our student engineers recognized that English-only interfaces alienated government school students. The team developed a lightweight translation wrapper mapping common Telugu action words directly into visual AI prompts.',
    classroomMoment:
      'Students used their mother tongue to construct visual parameters like "Create" and "Color". For the first time, language was not an obstacle to technical creation. Students moved from confusion to building multi-step logic prompts within forty minutes.',
    studentQuote:
      'Technology literacy is not about English acquisition — it is about logical thinking, and language should never be the barrier.',
    quoteAttribution: '— Volunteer Facilitator, NIAT × NSRIT',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177877/DJI_20260711131020_0287_D_rvh8gg.jpg',
  },
  {
    id: 'cdu-weekend',
    campus: 'NIAT × CDU',
    university: 'Chaitanya (Deemed to be University)',
    location: 'Hyderabad, Telangana',
    tagline: 'From campus to classroom: The question that sparked a movement',
    school: 'MPPS Nanakramguda & ZPHS Bachupally',
    teamAction:
      'Two student volunteers packed tablets and traveled into local primary and high schools, prepared to teach introductory AI logic under tight 75-minute class schedules.',
    classroomMoment:
      'When the session wrapped and equipment was being packed, students crowded the front bench with questions about how the model works. One seventh-grader looked up and asked: "Anna, when are you coming again?"',
    studentQuote:
      'Anna, when are you coming again?',
    quoteAttribution: '— Class 7 Student, MPPS Nanakramguda',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784178443/motion_photo_8450246088682134754_gtddpq.jpg',
  },
  {
    id: 'aurora-hackathon',
    campus: 'NIAT × Aurora',
    university: 'Aurora Deemed University',
    location: 'Hyderabad, Telangana',
    tagline: 'Opening university computer labs to government school students',
    school: 'Multi-school collaborative weekend workshop',
    teamAction:
      'The Aurora chapter opened university labs over the weekend, busing in 50 students from nearby government institutions to build community solution prototypes with AI copilots.',
    classroomMoment:
      'Rather than toys, the students designed practical community concepts: a solar street light planner for dark village paths and a simple bilingual plant ailment detector.',
    studentQuote:
      'They didn’t just play with tools. They designed solutions for their own villages and presented them to university professors.',
    quoteAttribution: '— Campus Outreach Coordinator, NIAT × Aurora',
    image:
      'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177911/DJI_20260711132101_0313_D_a48glv.jpg',
  },
]

export function CampusStoriesSection() {
  const [activeStoryId, setActiveStoryId] = useState(REAL_STORIES[0].id)
  const activeStory = REAL_STORIES.find((s) => s.id === activeStoryId) ?? REAL_STORIES[0]

  return (
    <section className="relative overflow-hidden border-b border-border bg-card/25 py-16 md:py-24">
      <div className="container-wide px-5 md:px-8 lg:px-16">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="max-w-3xl">
              <span className="section-label text-brand">Real Classroom Stories</span>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl text-balance">
                Every campus has a classroom story.
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
                Behind every number in our dashboard is a student-led team that walked into a classroom,
                connected with children, and witnessed a genuine spark of curiosity.
              </p>
            </div>

            {/* Campus Story Selector Tabs */}
            <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
              {REAL_STORIES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStoryId(s.id)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                    activeStoryId === s.id
                      ? 'bg-brand text-white shadow-soft'
                      : 'border border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80'
                  }`}
                >
                  {s.campus}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Featured Story Display */}
        <div className="mt-12">
          <Reveal key={activeStory.id}>
            <div className="grid gap-8 lg:grid-cols-12 rounded-3xl border border-border/80 bg-card p-6 shadow-soft-lg md:p-10 lg:items-center">
              {/* Image side */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted lg:col-span-5 shadow-sm">
                <Image
                  src={activeStory.image}
                  alt={activeStory.tagline}
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover transition-transform duration-500 hover:scale-103"
                  priority
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                    <Sparkles className="size-3 text-brand-orange" /> Verified Story
                  </span>
                </div>
              </div>

              {/* Content side */}
              <div className="space-y-6 lg:col-span-7">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-brand">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="size-3.5" /> {activeStory.campus}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <MapPin className="size-3.5" /> {activeStory.location}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
                    {activeStory.tagline}
                  </h3>

                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    School Partner: {activeStory.school}
                  </p>
                </div>

                {/* Narrative: From Campus to Classroom */}
                <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand">
                      FROM CAMPUS TO CLASSROOM
                    </span>
                    <p className="mt-1 text-sm text-foreground/90 leading-relaxed">
                      {activeStory.teamAction}
                    </p>
                  </div>

                  <div className="border-t border-border/50 pt-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-teal">
                      THE CLASSROOM MOMENT
                    </span>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {activeStory.classroomMoment}
                    </p>
                  </div>
                </div>

                {/* Student / Lead Quote */}
                <div className="relative border-l-4 border-brand bg-brand/5 p-4 rounded-r-xl">
                  <Quote className="absolute top-2 right-3 size-6 text-brand/15" />
                  <p className="text-sm font-semibold italic text-foreground leading-relaxed pr-6">
                    &quot;{activeStory.studentQuote}&quot;
                  </p>
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    {activeStory.quoteAttribution}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
