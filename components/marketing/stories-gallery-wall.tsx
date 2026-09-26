'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, MapPin, Calendar, PlayCircle, School, Eye } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface WallItem {
  id: string
  url: string
  title: string
  school: string
  location: string
  date: string
  session: string
  description: string
}

const WALL_ITEMS: WallItem[] = [
  {
    id: 'wall-1',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177864/WhatsApp_Image_2026-04-18_at_14.46.43_vtswq0.jpg',
    title: 'Students Writing Their First Telugu AI Prompts',
    school: 'ZPHS Bachupally',
    location: 'Rangareddy, Telangana',
    date: 'April 2026',
    session: 'Hands-on Prompt Engineering Workshop',
    description:
      'Students in class 8 discovering that artificial intelligence tools can process regional language descriptions to generate original concept illustrations.',
  },
  {
    id: 'wall-2',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177877/DJI_20260711131020_0287_D_rvh8gg.jpg',
    title: 'Volunteer Facilitation on Mobile Tablets',
    school: 'MPPS Nanakramguda',
    location: 'Hyderabad, Telangana',
    date: 'July 2026',
    session: 'Interactive Generative AI Lab',
    description:
      'NIAT × CDU student volunteers guiding small groups of students through tablet interfaces to build custom creative outputs.',
  },
  {
    id: 'wall-3',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177864/IMG-20260406-WA0007_3_hboy0k.jpg',
    title: 'Classroom Celebration & Participation Recognition',
    school: 'Government High School',
    location: 'Warangal Outskirts',
    date: 'April 2026',
    session: 'First Cohort Completion',
    description:
      'Forty-five students holding up their generated prompt designs and certificates alongside student volunteers from NIAT × KKH.',
  },
  {
    id: 'wall-4',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177867/IMG_20260324_121056961_prkzll.jpg',
    title: 'Classroom Immersion and Group Attention',
    school: 'ZPH High School',
    location: 'Rangareddy District',
    date: 'March 2026',
    session: 'Foundational AI Literacy',
    description:
      'A full classroom engaged as university mentors explain how computer models identify patterns in image generation.',
  },
  {
    id: 'wall-5',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784178443/motion_photo_8450246088682134754_gtddpq.jpg',
    title: 'Weekend Lab Infrastructure Setup',
    school: 'Rural Computer Lab',
    location: 'Chevella, Telangana',
    date: 'June 2026',
    session: 'Lab Boot-Up and Network Testing',
    description:
      'Volunteers testing monitors, keyboards, and mobile hotspot links to ensure every student has an active machine before class begins.',
  },
  {
    id: 'wall-6',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177911/DJI_20260711132101_0313_D_a48glv.jpg',
    title: 'Outdoor Post-Session Debrief',
    school: 'Government School Playground',
    location: 'Visakhapatnam, Andhra Pradesh',
    date: 'July 2026',
    session: 'Community Outreach Visit',
    description:
      'Students and volunteers gathering after the session to reflect on what they learned and share favorite generated drawings.',
  },
]

export function StoriesGalleryWall() {
  const [activeItem, setActiveItem] = useState<WallItem | null>(null)

  return (
    <section className="relative overflow-hidden border-b border-border bg-card/25 py-16 md:py-24">
      <div className="container-wide px-5 md:px-8 lg:px-16">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="max-w-3xl">
              <span className="section-label text-brand">Ground Evidence</span>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl text-balance">
                Classroom Moments in Pictures
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
                Visual documentation from real Teach AI for India classroom visits. Click any
                photograph to view school location and session details.
              </p>
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Click photo to inspect metadata
            </div>
          </div>
        </Reveal>

        {/* Masonry / Grid */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {WALL_ITEMS.map((item, idx) => (
            <Reveal key={item.id} delay={idx * 0.06}>
              <div
                onClick={() => setActiveItem(item)}
                className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft transition-all duration-300 hover:shadow-soft-lg hover:border-brand/40"
              >
                <Image
                  src={item.url}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="absolute inset-x-3 bottom-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-orange">
                    <Eye className="size-3" /> Inspect Details
                  </span>
                  <p className="mt-0.5 font-display text-xs font-bold line-clamp-1">{item.title}</p>
                  <p className="text-[10px] text-white/75">{item.school}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Modal Lightbox */}
        {activeItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setActiveItem(null)}
          >
            <div
              className="relative max-w-2xl w-full rounded-3xl border border-border bg-card overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <div className="relative aspect-[16/10] w-full">
                <Image src={activeItem.url} alt={activeItem.title} fill className="object-cover" />
                <button
                  onClick={() => setActiveItem(null)}
                  className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
                  aria-label="Close modal"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Metadata details */}
              <div className="p-6 md:p-8 space-y-4">
                <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                  {activeItem.title}
                </h3>

                <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/40 p-4 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <School className="size-4 text-brand shrink-0" />
                    <span className="truncate">{activeItem.school}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-4 text-brand-teal shrink-0" />
                    <span className="truncate">{activeItem.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-4 text-brand-orange shrink-0" />
                    <span>{activeItem.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <PlayCircle className="size-4 text-brand shrink-0" />
                    <span className="truncate">{activeItem.session}</span>
                  </div>
                </div>

                <p className="text-sm text-foreground/90 leading-relaxed">
                  {activeItem.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
