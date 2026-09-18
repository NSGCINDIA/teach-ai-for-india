'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Sparkles, Quote, ChevronLeft, ChevronRight, Camera } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface GalleryPhoto {
  url: string
  title: string
  category: string
  campus: string
  location: string
}

const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177864/WhatsApp_Image_2026-04-18_at_14.46.43_vtswq0.jpg',
    title: 'Hands-on Prompt Engineering',
    category: 'Classroom Activity',
    campus: 'NIAT × KKH',
    location: 'ZPHS Bachupally',
  },
  {
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177877/DJI_20260711131020_0287_D_rvh8gg.jpg',
    title: 'Tablet-Based Interactive Lab',
    category: 'Volunteer Facilitation',
    campus: 'NIAT × CDU',
    location: 'Hyderabad',
  },
  {
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177864/IMG-20260406-WA0007_3_hboy0k.jpg',
    title: 'First-time AI Generation Demo',
    category: 'AI Demonstration',
    campus: 'NIAT × Aurora',
    location: 'Warangal Lab',
  },
  {
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177867/IMG_20260324_121056961_prkzll.jpg',
    title: 'Full Classroom Attention',
    category: 'Classroom Activity',
    campus: 'NIAT × MRV',
    location: 'Rangareddy',
  },
  {
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784178443/motion_photo_8450246088682134754_gtddpq.jpg',
    title: 'Hardware & Lab Setup',
    category: 'Volunteer Preparation',
    campus: 'NIAT × Chevella',
    location: 'Rural Lab',
  },
  {
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177864/WhatsApp_Image_2026-04-18_at_15.25.48_2_qd8mq3.jpg',
    title: 'Curriculum & Analogies Review',
    category: 'Campus Meeting',
    campus: 'NIAT × NRI',
    location: 'Vijayawada',
  },
  {
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177911/DJI_20260711132101_0313_D_a48glv.jpg',
    title: 'Team and Students Outdoor',
    category: 'Team Moment',
    campus: 'NIAT × CIET',
    location: 'Guntur',
  },
  {
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177876/DJI_20260711124202_0244_D_zgvqzo.jpg',
    title: 'Chapter Launch & School Visit',
    category: 'School Visit',
    campus: 'NIAT × NSRIT',
    location: 'Visakhapatnam',
  },
]

const STUDENT_MOMENTS = [
  {
    quote: 'Anna, when are you coming again?',
    context: 'Asked by a 7th-grade student after the first 75-minute introductory session.',
    speaker: 'Class 7 Student',
    school: 'MPPS Nanakramguda, Rangareddy',
    campus: 'NIAT × CDU Campus Team',
  },
  {
    quote: 'Anna, can it make a picture of Allu Arjun?',
    context: 'The question that sparked an entire spontaneous Telugu prompt workshop.',
    speaker: 'Class 8 Student',
    school: 'ZPHS Bachupally',
    campus: 'NIAT × KKH Campus Team',
  },
  {
    quote: 'Can we write our poem in Telugu and see what it draws?',
    context: 'Students experimenting with native-language text prompting for the first time.',
    speaker: 'Class 9 Student',
    school: 'Government High School Warangal',
    campus: 'NIAT × KKH Campus Team',
  },
  {
    quote: 'I didn’t know computers could imagine things too.',
    context: 'Said after seeing text transform into an original concept drawing.',
    speaker: 'Class 8 Student',
    school: 'ZPH High School Sontyam',
    campus: 'NIAT × NSRIT Campus Team',
  },
]

export function CampusGalleryMoments() {
  const [activeMoment, setActiveMoment] = useState(0)

  const nextMoment = () => {
    setActiveMoment((prev) => (prev + 1) % STUDENT_MOMENTS.length)
  }

  const prevMoment = () => {
    setActiveMoment((prev) => (prev - 1 + STUDENT_MOMENTS.length) % STUDENT_MOMENTS.length)
  }

  const current = STUDENT_MOMENTS[activeMoment]

  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-16 md:py-24">
      <div className="container-wide px-5 md:px-8 lg:px-16">
        {/* Section 8: Campus Gallery */}
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="max-w-3xl">
              <span className="section-label text-brand">Classroom Ground Reality</span>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl text-balance">
                Real moments. Real classrooms.
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
                Authentic photographs from NIAT campus preparation, laboratory setups, school outreach,
                and hands-on AI interaction with students.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
              <Camera className="size-3.5 text-brand" /> Documented Ground Evidence
            </div>
          </div>
        </Reveal>

        {/* Gallery Grid */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {GALLERY_PHOTOS.map((photo, idx) => (
            <Reveal key={photo.url} delay={idx * 0.05}>
              <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card aspect-[4/3] shadow-soft transition-all duration-300 hover:shadow-soft-lg hover:border-brand/30">
                <Image
                  src={photo.url}
                  alt={`${photo.title} by ${photo.campus}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                <div className="absolute inset-x-3 bottom-3 text-white">
                  <span className="inline-block rounded-md bg-brand/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                    {photo.category}
                  </span>
                  <h4 className="mt-1 font-display text-xs font-bold leading-snug line-clamp-1">
                    {photo.title}
                  </h4>
                  <p className="text-[10px] text-white/75 mt-0.5">
                    {photo.campus} • {photo.location}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Section 9: Student Moments (Rotating Spotlight) */}
        <div className="mt-20">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/70 p-6 md:p-10 shadow-soft-lg dark:bg-card/25 backdrop-blur-sm">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 size-60 rounded-full bg-brand/5 blur-3xl pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
                    <Sparkles className="size-3.5" />
                    <span>MEMORABLE CLASSROOM MOMENT</span>
                  </div>

                  <div className="relative">
                    <Quote className="size-10 text-brand/20 mb-2" />
                    <blockquote className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold italic text-foreground tracking-tight leading-snug">
                      &quot;{current.quote}&quot;
                    </blockquote>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    {current.context}
                  </p>
                </div>

                {/* Speaker card and controls */}
                <div className="flex flex-col justify-between gap-6 border-t border-border/60 pt-6 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0 shrink-0 lg:w-72">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                      The Voice Behind the Screen
                    </span>
                    <h5 className="mt-1 font-display text-base font-bold text-foreground">
                      {current.speaker}
                    </h5>
                    <p className="text-xs text-muted-foreground mt-0.5">{current.school}</p>
                    <p className="text-xs font-medium text-brand-teal mt-2">
                      Facilitated by {current.campus}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-mono font-medium">
                      {activeMoment + 1} of {STUDENT_MOMENTS.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevMoment}
                        className="grid size-9 place-items-center rounded-full border border-border bg-background text-foreground shadow-xs transition-colors hover:bg-muted"
                        aria-label="Previous quote"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <button
                        onClick={nextMoment}
                        className="grid size-9 place-items-center rounded-full border border-border bg-background text-foreground shadow-xs transition-colors hover:bg-muted"
                        aria-label="Next quote"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
