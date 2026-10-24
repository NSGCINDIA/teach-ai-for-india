'use client'

import Image from 'next/image'
import { Pin, Camera, Sparkles } from 'lucide-react'

interface NoticePhoto {
  id: string
  url: string
  caption: string
  location: string
  rotation: string
  tapeColor: string
}

const PHOTOS: NoticePhoto[] = [
  {
    id: 'p1',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177864/IMG-20260406-WA0007_3_hboy0k.jpg',
    caption: 'Student typing her very first creative AI image prompt on the keyboard.',
    location: 'MPPS Nandakramaguda',
    rotation: '-rotate-2',
    tapeColor: 'bg-amber-400/80',
  },
  {
    id: 'p2',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177867/IMG_20260324_121056961_prkzll.jpg',
    caption: 'Students proudly displaying their completed project workbooks.',
    location: 'ZPHS Bachupally',
    rotation: 'rotate-1',
    tapeColor: 'bg-emerald-400/80',
  },
  {
    id: 'p3',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177877/DJI_20260711131020_0287_D_rvh8gg.jpg',
    caption: 'NIAT student mentors and school learners celebrating session completion.',
    location: 'NIAT × KKH Chapter',
    rotation: '-rotate-1',
    tapeColor: 'bg-rose-400/80',
  },
  {
    id: 'p4',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177864/WhatsApp_Image_2026-04-18_at_14.46.43_vtswq0.jpg',
    caption: 'A government school classroom before the morning session begins.',
    location: 'Telangana Rural Hub',
    rotation: 'rotate-2',
    tapeColor: 'bg-sky-400/80',
  },
  {
    id: 'p5',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177876/DJI_20260711124202_0244_D_zgvqzo.jpg',
    caption: 'Students asking volunteers questions in the courtyard after class.',
    location: 'Zilla Parishad High School',
    rotation: '-rotate-2',
    tapeColor: 'bg-amber-300/80',
  },
  {
    id: 'p6',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177911/DJI_20260711132101_0313_D_a48glv.jpg',
    caption: 'Courtyard gathering with headmaster and certified participants.',
    location: 'MPPS Chevella',
    rotation: 'rotate-1',
    tapeColor: 'bg-purple-400/80',
  },
]

export function NoticeBoardGallery() {
  return (
    <section
      id="scene-gallery"
      aria-label="Classroom Notice Board: Authentic Field Evidence"
      className="relative w-full py-24 sm:py-32 bg-[#FAF8F5] text-[#1B1B1B] overflow-hidden border-b border-[#E2DDD5]"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#9E2A2B]/10 border border-[#9E2A2B]/20 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold">
            <Camera className="size-3.5 text-[#9E2A2B]" />
            Classroom Notice Board
          </span>
          <h2 className="mt-5 font-display text-4xl sm:text-6xl font-bold tracking-tight text-[#1B1B1B]">
            Pinned on the Classroom Wall
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#555] font-serif max-w-2xl mx-auto">
            Real snapshots from government school sessions. No staged corporate imagery — just pure,
            genuine moments of students learning and discovering AI.
          </p>
        </div>

        {/* ─── CORK / WOODEN NOTICE BOARD FRAME ─────────────────────────────── */}
        <div
          className="mt-14 sm:mt-18 rounded-3xl p-6 sm:p-12 relative shadow-2xl border-[10px] sm:border-[14px] border-[#5C3A21] overflow-hidden"
          style={{
            backgroundColor: '#D9B48F',
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.1) 100%)',
          }}
        >
          {/* Wooden corner brass accents */}
          <div className="absolute top-2 left-2 size-4 rounded-full bg-amber-600 border border-amber-800 shadow-inner" />
          <div className="absolute top-2 right-2 size-4 rounded-full bg-amber-600 border border-amber-800 shadow-inner" />
          <div className="absolute bottom-2 left-2 size-4 rounded-full bg-amber-600 border border-amber-800 shadow-inner" />
          <div className="absolute bottom-2 right-2 size-4 rounded-full bg-amber-600 border border-amber-800 shadow-inner" />

          {/* Grid of Polaroid Photo Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {PHOTOS.map((photo) => (
              <div
                key={photo.id}
                className={`group relative bg-white p-3.5 pb-5 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:z-20 hover:shadow-2xl ${photo.rotation} hover:rotate-0`}
              >
                {/* Pushpin at top center */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
                  <div className="size-4 rounded-full bg-red-600 shadow-md border border-red-800" />
                </div>

                {/* Photo frame */}
                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-100">
                  <Image
                    src={photo.url}
                    alt={photo.caption}
                    fill
                    sizes="(max-width: 768px) 100vw, 350px"
                    className="object-cover object-center filter contrast-[1.02] group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Handwritten style caption */}
                <div className="mt-3.5 px-1">
                  <p className="font-serif text-xs sm:text-sm text-[#222] leading-snug italic">
                    &ldquo;{photo.caption}&rdquo;
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[#777] uppercase tracking-wider">
                    <span>{photo.location}</span>
                    <span className="text-[#9E2A2B] font-bold">Session Archive</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
