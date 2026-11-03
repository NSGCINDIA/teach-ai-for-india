'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Pin,
  Camera,
  Calendar,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from 'lucide-react'

type Category = 'all' | 'breakthroughs' | 'action' | 'mentors' | 'milestones'

interface NoticePhoto {
  id: string
  category: 'breakthroughs' | 'action' | 'mentors' | 'milestones'
  title: string
  caption: string
  location: string
  district: string
  date: string
  url: string
  rotation: string
  pinColor: 'red' | 'yellow' | 'teal' | 'purple' | 'emerald' | 'amber'
  cardBg: string
  cardBorder: string
  tapeColor: string
  tapeAngle: string
  stamp: string
  stampColor: string
  promptSnippet?: string
  story: string
  takeaway: string
  badge: string
}

const PHOTOS: NoticePhoto[] = [
  {
    id: 'p1',
    category: 'breakthroughs',
    title: 'The Allu Arjun Telugu Prompt',
    caption: '“Anna, can it make a picture of Allu Arjun?” The question that turned a hesitant room into an electric creative lab.',
    location: 'MPPS Nanakramguda',
    district: 'Hyderabad, Telangana',
    date: '19 Oct 2023 · 09:42 AM',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177864/IMG-20260406-WA0007_3_hboy0k.jpg',
    rotation: '-rotate-2',
    pinColor: 'red',
    cardBg: 'bg-[#FEFCE8]',
    cardBorder: 'border-[#FEF08A]',
    tapeColor: 'bg-amber-200/90 border-amber-300/80',
    tapeAngle: '-rotate-6',
    stamp: 'FIRST PROMPT SPARK',
    stampColor: 'border-rose-700 text-rose-800 bg-rose-50/70',
    promptSnippet: '“అల్లు అర్జున్ అంతరిక్షంలో రాకెట్ నడుపుతున్న చిత్రం” (Allu Arjun piloting a rocket in space)',
    story:
      'Thirty students sat quietly, uncertain if they were allowed to touch the keyboards. Then an 8th-grader grinned and asked if the computer understands Telugu cinema. The volunteer smiled and guided him to type his query in Telugu script. Two minutes later, when the vibrant artwork generated, the quiet classroom erupted into cheers.',
    takeaway: 'Once a child realizes artificial intelligence speaks their own language and understands their culture, fear vanishes instantly.',
    badge: 'Telugu Creative Lab',
  },
  {
    id: 'p2',
    category: 'action',
    title: 'Keyboards Over Blackboards',
    caption: 'Two students in buddy pairs taking turns typing descriptive adjectives for an agricultural simulation.',
    location: 'ZPHS Bachupally',
    district: 'Medchal-Malkajgiri',
    date: '18 Apr 2024 · 10:15 AM',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177864/WhatsApp_Image_2026-04-18_at_14.46.43_vtswq0.jpg',
    rotation: 'rotate-2',
    pinColor: 'teal',
    cardBg: 'bg-[#F0FDF4]',
    cardBorder: 'border-[#BBF7D0]',
    tapeColor: 'bg-sky-200/90 border-sky-300/80',
    tapeAngle: 'rotate-12',
    stamp: '100% HANDS-ON',
    stampColor: 'border-teal-700 text-teal-800 bg-teal-50/70',
    promptSnippet: '“A green solar-powered drip irrigation system for Telangana cotton fields during summer”',
    story:
      'Facilitator Rule #01 in action: mentors keep their hands strictly behind their backs. By having students collaborate in pairs as "Keyboard Pilot" and "Prompt Architect", every child takes complete psychological ownership of the machine. They debug spelling typos and watch how adjectives directly change model output.',
    takeaway: 'Active tactile participation replaces intimidation with genuine agency and mastery.',
    badge: 'Pair Programming',
  },
  {
    id: 'p3',
    category: 'milestones',
    title: 'Completed 24-Page Workbooks',
    caption: 'Students proudly displaying their completed prompt engineering notebooks filled with concept sketches.',
    location: 'ZPHS Bachupally',
    district: 'Rangareddy District',
    date: '24 Mar 2024 · 11:30 AM',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177867/IMG_20260324_121056961_prkzll.jpg',
    rotation: '-rotate-1',
    pinColor: 'yellow',
    cardBg: 'bg-[#FFFBEB]',
    cardBorder: 'border-[#FDE68A]',
    tapeColor: 'bg-emerald-200/90 border-emerald-300/80',
    tapeAngle: '-rotate-3',
    stamp: 'COHORT CERTIFIED',
    stampColor: 'border-emerald-700 text-emerald-800 bg-emerald-50/70',
    promptSnippet: '“24 pages of handwritten prompt drafts, hallucination checklists, and village solutions”',
    story:
      'Students do not leave our workshops with empty notes. Every child completes a physical 24-page field workbook containing unplugged concept maps, hallucination detection rubrics, and a hand-drawn community solution. Each workbook is evaluated and signed by university chapter leads.',
    takeaway: 'Physical artifacts give children tangible proof of their new abilities to show parents and teachers.',
    badge: 'Physical Evidence',
  },
  {
    id: 'p4',
    category: 'mentors',
    title: 'Mentors & Learners Around Tablets',
    caption: 'NIAT engineering undergraduates kneeling beside benches, guiding learners through visual generative models.',
    location: 'NIAT × CDU Chapter',
    district: 'Hyderabad Hub',
    date: '11 Jul 2024 · 01:10 PM',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177877/DJI_20260711131020_0287_D_rvh8gg.jpg',
    rotation: '-rotate-3',
    pinColor: 'emerald',
    cardBg: 'bg-[#FFF1F2]',
    cardBorder: 'border-[#FECDD3]',
    tapeColor: 'bg-rose-200/90 border-rose-300/80',
    tapeAngle: 'rotate-6',
    stamp: 'PEER MENTORSHIP',
    stampColor: 'border-indigo-700 text-indigo-800 bg-indigo-50/70',
    promptSnippet: '“Near-peer dynamic breaks traditional teacher-student intimidation barriers”',
    story:
      'Undergraduate engineering students traveling together on rural district buses create an immediate bond with government school students. Being only 5 to 6 years older, volunteers feel like elder brothers and sisters ("Annas" and "Akkas"). Questions flow freely without the formal hesitation common in standard classes.',
    takeaway: 'Near-peer teaching unlocks questions students are normally too shy to ask.',
    badge: 'Near-Peer Dynamic',
  },
  {
    id: 'p5',
    category: 'mentors',
    title: '7:15 AM Lab Boot-Up & Network',
    caption: 'Volunteers arriving early with portable 5G hotspots, power strips, and refurbished laptops.',
    location: 'Rural School Hub',
    district: 'Chevella, Telangana',
    date: '15 Jan 2024 · 07:15 AM',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784178443/motion_photo_8450246088682134754_gtddpq.jpg',
    rotation: 'rotate-1',
    pinColor: 'purple',
    cardBg: 'bg-[#FAF5FF]',
    cardBorder: 'border-[#E9D5FF]',
    tapeColor: 'bg-amber-100/95 border-amber-300/80',
    tapeAngle: '-rotate-12',
    stamp: 'FIELD LOGISTICS',
    stampColor: 'border-amber-800 text-amber-900 bg-amber-50/70',
    promptSnippet: '“Zero dependencies on school internet: volunteers bring their own cellular mobile mesh”',
    story:
      'In many rural schools, computer rooms have sat inactive for years due to system configuration issues or lack of network connectivity. Our volunteer squad arrives an hour early, resolving hardware blocks, testing extension cables, and ensuring every single bench has an active machine before the morning bell.',
    takeaway: 'Resource constraints are met with proactive volunteer grit so learning never halts.',
    badge: 'Hardware Logistics',
  },
  {
    id: 'p6',
    category: 'action',
    title: 'Questions Under the Neem Tree',
    caption: 'Learners surrounding volunteers in the school courtyard after hours, asking about neural network training.',
    location: 'Zilla Parishad High School',
    district: 'Andhra Pradesh Outskirts',
    date: '11 Jul 2024 · 12:42 PM',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177876/DJI_20260711124202_0244_D_zgvqzo.jpg',
    rotation: '-rotate-2',
    pinColor: 'amber',
    cardBg: 'bg-[#F0FDFA]',
    cardBorder: 'border-[#99F6E4]',
    tapeColor: 'bg-teal-200/90 border-teal-300/80',
    tapeAngle: 'rotate-3',
    stamp: 'RECESS CURIOSITY',
    stampColor: 'border-teal-800 text-teal-900 bg-teal-50/70',
    promptSnippet: '“Anna, when are you coming again? Can we build something bigger next time?”',
    story:
      'The 90-minute workshop was officially over and laptops were packed, but students lingered under the courtyard neem tree. They peppered our college leads with questions about engineering careers, university admissions, and how to program their own conversational chatbots.',
    takeaway: 'The true success metric is not when class ends, but whether curiosity continues into recess.',
    badge: 'Sparking Ambition',
  },
  {
    id: 'p7',
    category: 'milestones',
    title: 'Courtyard Graduation & Certificates',
    caption: 'Courtyard ceremony with school headmaster, teachers, and certified middle school creators.',
    location: 'MPPS Chevella',
    district: 'Telangana',
    date: '11 Jul 2024 · 01:21 PM',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177911/DJI_20260711132101_0313_D_a48glv.jpg',
    rotation: 'rotate-2',
    pinColor: 'red',
    cardBg: 'bg-[#FFF7ED]',
    cardBorder: 'border-[#FED7AA]',
    tapeColor: 'bg-purple-200/90 border-purple-300/80',
    tapeAngle: '-rotate-6',
    stamp: 'HEADMASTER VERIFIED',
    stampColor: 'border-purple-800 text-purple-900 bg-purple-50/70',
    promptSnippet: '“Every child recognized with an official signed certificate of foundational AI literacy”',
    story:
      'Headmaster Balaji noted that this was the very first technology cohort in the school where girl students took charge of the keyboards and presented original digital creations to the entire teaching staff. Each learner walked away with a framed certificate of completion.',
    takeaway: 'Institutional recognition builds lasting confidence and validates student effort.',
    badge: 'Graduation Day',
  },
  {
    id: 'p8',
    category: 'mentors',
    title: 'Volunteer Pedagogy Briefing',
    caption: 'Volunteers conducting peer drills to refine everyday agricultural and festival analogies before school deployment.',
    location: 'NIAT Campus Hub',
    district: 'Vijayawada Chapter',
    date: '18 Apr 2024 · 03:25 PM',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784177864/WhatsApp_Image_2026-04-18_at_15.25.48_2_qd8mq3.jpg',
    rotation: '-rotate-1',
    pinColor: 'teal',
    cardBg: 'bg-[#F0F9FF]',
    cardBorder: 'border-[#BAE6FD]',
    tapeColor: 'bg-rose-100/95 border-rose-300/80',
    tapeAngle: 'rotate-12',
    stamp: 'PEDAGOGY PROTOCOL',
    stampColor: 'border-rose-800 text-rose-900 bg-rose-50/70',
    promptSnippet: '“Replacing abstract math with relatable metaphors: cricket, farming, and cooking”',
    story:
      'Facilitators complete intensive pedagogical preparation before entering partner schools. We rehearse explaining neural weights through local metaphors (like how cricket fielders predict ball flight or how grandmothers season curry) so technical jargon is never an obstacle.',
    takeaway: 'Great teaching requires stripping away jargon and speaking the language of pure curiosity.',
    badge: 'Volunteer Rigor',
  },
  {
    id: 'p9',
    category: 'breakthroughs',
    title: 'Deploying to School #24',
    caption: 'Undergraduate chapter squad carrying demonstration hardware and fresh workbooks to a remote partner school.',
    location: 'Visakhapatnam Outreach',
    district: 'Andhra Pradesh',
    date: '10 Apr 2024 · 08:30 AM',
    url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1000/v1784178443/IMG-20260410-WA0007_txyvjq.jpg',
    rotation: 'rotate-3',
    pinColor: 'yellow',
    cardBg: 'bg-[#F5F5F4]',
    cardBorder: 'border-[#E7E5E4]',
    tapeColor: 'bg-emerald-100/95 border-emerald-300/80',
    tapeAngle: '-rotate-3',
    stamp: 'STATEWIDE EXPANSION',
    stampColor: 'border-emerald-800 text-emerald-900 bg-emerald-50/70',
    promptSnippet: '“From 1 school in Nanakramguda to 34+ active hubs across Telangana and AP”',
    story:
      'What began as a single pilot classroom has grown into an organic student movement. Over 1,800 students have completed hands-on cohorts across government high schools in two states, stewarded entirely by university undergraduate leaders.',
    takeaway: 'Grassroots student leadership enables scalable, hyper-localized educational equity.',
    badge: 'Movement Scale',
  },
]

export function NoticeBoardGallery() {
  const [filter, setFilter] = useState<Category>('all')
  const [activeModalItem, setActiveModalItem] = useState<NoticePhoto | null>(null)

  const filteredPhotos = filter === 'all' ? PHOTOS : PHOTOS.filter((p) => p.category === filter)

  // Keyboard navigation for modal lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeModalItem) return
      if (e.key === 'Escape') setActiveModalItem(null)
      if (e.key === 'ArrowRight') {
        const currentIndex = PHOTOS.findIndex((p) => p.id === activeModalItem.id)
        if (currentIndex !== -1 && currentIndex < PHOTOS.length - 1) {
          setActiveModalItem(PHOTOS[currentIndex + 1])
        } else {
          setActiveModalItem(PHOTOS[0])
        }
      }
      if (e.key === 'ArrowLeft') {
        const currentIndex = PHOTOS.findIndex((p) => p.id === activeModalItem.id)
        if (currentIndex > 0) {
          setActiveModalItem(PHOTOS[currentIndex - 1])
        } else {
          setActiveModalItem(PHOTOS[PHOTOS.length - 1])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeModalItem])

  // Helper for 3D Pushpin
  const renderPin = (color: NoticePhoto['pinColor']) => {
    const pinGradients = {
      red: 'from-rose-400 via-red-600 to-red-900',
      yellow: 'from-amber-200 via-amber-400 to-amber-700',
      teal: 'from-teal-300 via-teal-500 to-teal-800',
      purple: 'from-purple-300 via-purple-600 to-purple-900',
      emerald: 'from-emerald-300 via-emerald-600 to-emerald-900',
      amber: 'from-orange-300 via-amber-500 to-amber-800',
    }

    return (
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none group-hover:scale-110 transition-transform">
        <div
          className={`size-4 sm:size-5 rounded-full bg-gradient-to-br ${pinGradients[color]} shadow-[0_4px_8px_rgba(0,0,0,0.5)] border border-white/50 relative flex items-center justify-center`}
        >
          <div className="size-1.5 rounded-full bg-white/80 absolute top-0.5 left-1" />
        </div>
        <div className="w-1 h-1.5 bg-neutral-700/70 -mt-0.5 rounded-b-full shadow-sm" />
      </div>
    )
  }

  return (
    <section
      id="scene-gallery"
      aria-label="Classroom Notice Board: Authentic Field Evidence"
      className="relative w-full py-24 sm:py-32 bg-[#14231A] text-[#FAF7F2] overflow-hidden border-b border-[#223629]"
      style={{
        backgroundColor: '#14231A',
        backgroundImage: `
          radial-gradient(circle at 50% 15%, rgba(45, 90, 60, 0.28) 0%, transparent 60%),
          radial-gradient(circle at 15% 85%, rgba(20, 50, 30, 0.35) 0%, transparent 50%),
          radial-gradient(circle at 85% 75%, rgba(30, 70, 40, 0.25) 0%, transparent 50%)
        `,
      }}
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#E09F3E]/20 border border-[#E09F3E]/35 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-[#F3B356] font-semibold">
            <Camera className="size-3.5 text-[#F3B356]" />
            Live Classroom Wall
          </span>
          <h2 className="mt-5 font-display text-4xl sm:text-6xl font-bold tracking-tight text-[#FAF7F2]">
            Pinned on the Classroom Wall
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#C8BFB2] font-serif max-w-2xl mx-auto">
            9 authentic field snapshots from government school benches across Telangana &amp; Andhra Pradesh.
            Click any photo to inspect the student prompt, facilitator notes, and field breakthrough behind it.
          </p>

          {/* ─── TACTILE FILTER TABS (PINNED BADGES) ─────────────────────────── */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {[
              { id: 'all', label: 'All Artifacts (9)' },
              { id: 'breakthroughs', label: 'Sparks & Prompts (2)' },
              { id: 'action', label: 'Classroom Action (2)' },
              { id: 'mentors', label: 'Mentors in Action (3)' },
              { id: 'milestones', label: 'Milestones & Certs (2)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as Category)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 border flex items-center gap-1.5 shadow-sm cursor-pointer ${
                  filter === tab.id
                    ? 'bg-[#9E2A2B] text-white border-[#B83234] shadow-md scale-105 ring-2 ring-amber-300/30'
                    : 'bg-[#1C3024]/90 text-[#D8D0C4] border-[#2A4333] hover:border-[#E09F3E]/50 hover:bg-[#233B2D] hover:text-white'
                }`}
              >
                <Pin className={`size-3 ${filter === tab.id ? 'text-amber-300' : 'text-[#E09F3E]'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── AUTHENTIC CORKBOARD WITH WOODEN FRAME ───────────────────────── */}
        <div
          className="mt-12 sm:mt-16 rounded-3xl p-5 sm:p-10 lg:p-12 relative shadow-[0_30px_70px_-20px_rgba(0,0,0,0.6)] border-[14px] sm:border-[20px] border-[#4A2B15] overflow-hidden"
          style={{
            backgroundColor: '#C99E6B',
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(139, 90, 43, 0.28) 1.5px, transparent 2.5px),
              radial-gradient(circle at 80% 40%, rgba(92, 58, 27, 0.22) 2px, transparent 3.5px),
              radial-gradient(circle at 40% 70%, rgba(210, 168, 116, 0.45) 1.5px, transparent 3px),
              radial-gradient(circle at 70% 85%, rgba(110, 68, 30, 0.25) 2px, transparent 4px),
              radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.12) 0%, rgba(0, 0, 0, 0.25) 100%)
            `,
            backgroundSize: '32px 32px, 48px 48px, 40px 40px, 60px 60px, 100% 100%',
          }}
        >
          {/* Wooden Bevel Inner Shadow */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_4px_16px_rgba(0,0,0,0.6)]" />

          {/* Four Brass Corner Brackets with Screws */}
          <div className="absolute top-2 left-2 size-5 sm:size-6 rounded-sm bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border border-amber-800 shadow-md flex items-center justify-center">
            <div className="w-2.5 h-0.5 bg-amber-950/80 rounded-full" />
          </div>
          <div className="absolute top-2 right-2 size-5 sm:size-6 rounded-sm bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border border-amber-800 shadow-md flex items-center justify-center">
            <div className="w-2.5 h-0.5 bg-amber-950/80 rounded-full" />
          </div>
          <div className="absolute bottom-2 left-2 size-5 sm:size-6 rounded-sm bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border border-amber-800 shadow-md flex items-center justify-center">
            <div className="w-2.5 h-0.5 bg-amber-950/80 rounded-full" />
          </div>
          <div className="absolute bottom-2 right-2 size-5 sm:size-6 rounded-sm bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border border-amber-800 shadow-md flex items-center justify-center">
            <div className="w-2.5 h-0.5 bg-amber-950/80 rounded-full" />
          </div>

          {/* ─── VINTAGE PINNED HEADER RIBBON ───────────────────────────────── */}
          <div className="mb-10 sm:mb-12 flex justify-center">
            <div className="relative bg-[#FBF7EE] text-[#4A2B15] border border-[#D5C7B3] px-6 sm:px-10 py-2.5 rounded shadow-md max-w-xl text-center transform -rotate-1">
              <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 size-4 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 border border-amber-800 shadow" />
              <div className="absolute top-1/2 -right-2.5 -translate-y-1/2 size-4 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 border border-amber-800 shadow" />

              <span className="font-mono text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase text-[#8B0000]">
                AUTHENTIC CLASSROOM ARCHIVE · TELANGANA &amp; AP
              </span>
              <p className="text-[11px] text-[#6B5A47] font-serif italic mt-0.5">
                Real photographs documented by collegiate volunteers during hands-on government school workshops
              </p>
            </div>
          </div>

          {/* ─── DYNAMIC ARTIFACTS GRID (9 PHOTOS WITH CRAFT MOUNTS) ─────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {filteredPhotos.map((photo) => {
              return (
                <article
                  key={photo.id}
                  onClick={() => setActiveModalItem(photo)}
                  className={`group relative ${photo.cardBg} border ${photo.cardBorder} p-3.5 pb-6 rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.25)] transition-all duration-300 hover:scale-[1.04] hover:z-30 hover:shadow-[0_22px_45px_rgba(0,0,0,0.45)] cursor-pointer ${photo.rotation} hover:rotate-0`}
                >
                  {/* Realistic 3D Pushpin */}
                  {renderPin(photo.pinColor)}

                  {/* Translucent Corner Washi Tape */}
                  <div
                    className={`absolute -top-2.5 right-4 w-12 h-5 ${photo.tapeColor} backdrop-blur-[1px] ${photo.tapeAngle} rounded-sm shadow-sm pointer-events-none border opacity-90`}
                  />

                  {/* Polaroid Photo Frame */}
                  <div className="relative aspect-[4/3] w-full rounded-md overflow-hidden bg-slate-900 shadow-inner group/img">
                    <Image
                      src={photo.url}
                      alt={photo.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 360px"
                      className="object-cover object-center filter contrast-[1.03] group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Click-to-inspect Hover Badge */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-mono text-xs uppercase tracking-wider backdrop-blur-[1px]">
                      <ZoomIn className="size-4 text-amber-300" />
                      <span>Inspect Field Story</span>
                    </div>

                    {/* Category Pill in Top-Left of photo */}
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white font-mono text-[8.5px] px-2 py-0.5 rounded uppercase tracking-wider font-semibold">
                      {photo.badge}
                    </div>

                    {/* Date Stamp in Bottom Right of photo */}
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-amber-200 font-mono text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
                      {photo.date.split('·')[0].trim()}
                    </div>
                  </div>

                  {/* Handwritten style caption card footer */}
                  <div className="mt-3.5 px-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#9E2A2B] truncate">
                        {photo.location}
                      </span>
                      {photo.stamp && (
                        <span
                          className={`shrink-0 font-mono text-[8.5px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 border rounded rotate-[-3deg] ${photo.stampColor}`}
                        >
                          {photo.stamp}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 font-sans text-sm font-bold text-[#1B1B1B] leading-snug">
                      {photo.title}
                    </h3>

                    <p className="mt-1.5 font-serif text-xs text-[#333] leading-snug italic line-clamp-2">
                      &ldquo;{photo.caption}&rdquo;
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center justify-between text-[10px] font-mono text-[#666]">
                      <span className="truncate max-w-[170px]">{photo.district}</span>
                      <span className="text-[#9E2A2B] font-bold group-hover:underline flex items-center gap-0.5">
                        Inspect →
                      </span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        {/* ─── TACTILE LIGHTBOX INSPECTION MODAL ────────────────────────────── */}
        {activeModalItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setActiveModalItem(null)}
          >
            <div
              className="relative max-w-3xl w-full max-h-[92vh] overflow-y-auto bg-white rounded-3xl p-5 sm:p-8 shadow-2xl border-4 border-[#5C3A21]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 right-4 z-20 size-9 rounded-full bg-black/10 hover:bg-[#9E2A2B] hover:text-white text-[#333] transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Close photo inspection"
              >
                <X className="size-5" />
              </button>

              {/* Navigation Arrows */}
              <button
                type="button"
                onClick={() => {
                  const idx = PHOTOS.findIndex((p) => p.id === activeModalItem.id)
                  const prev = idx > 0 ? idx - 1 : PHOTOS.length - 1
                  setActiveModalItem(PHOTOS[prev])
                }}
                className="absolute top-1/2 -left-3 sm:-left-5 -translate-y-1/2 z-20 size-10 rounded-full bg-white text-[#1B1B1B] shadow-lg border border-[#D5C7B3] hover:bg-[#9E2A2B] hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft className="size-5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const idx = PHOTOS.findIndex((p) => p.id === activeModalItem.id)
                  const next = idx < PHOTOS.length - 1 ? idx + 1 : 0
                  setActiveModalItem(PHOTOS[next])
                }}
                className="absolute top-1/2 -right-3 sm:-right-5 -translate-y-1/2 z-20 size-10 rounded-full bg-white text-[#1B1B1B] shadow-lg border border-[#D5C7B3] hover:bg-[#9E2A2B] hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight className="size-5" />
              </button>

              {/* Photo Display */}
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-neutral-900 shadow-inner">
                <Image
                  src={activeModalItem.url}
                  alt={activeModalItem.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 760px"
                  className="object-cover object-center"
                />

                {/* Stamp in Top Right */}
                <div
                  className={`absolute top-3 right-3 font-mono text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 border rounded shadow-md rotate-[-3deg] ${activeModalItem.stampColor}`}
                >
                  {activeModalItem.stamp}
                </div>
              </div>

              {/* Metadata and Story */}
              <div className="mt-5 text-[#1B1B1B]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ECE8E1] pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-3.5 text-[#9E2A2B]" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#9E2A2B]">
                      {activeModalItem.location} · {activeModalItem.district}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#666]">
                    <Calendar className="size-3.5" />
                    <span>{activeModalItem.date}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#1B1B1B]">
                    {activeModalItem.title}
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#ECE8E1] text-[#9E2A2B] font-bold">
                    {activeModalItem.badge}
                  </span>
                </div>

                <p className="mt-2 text-sm sm:text-base font-serif italic text-[#444] leading-relaxed">
                  &ldquo;{activeModalItem.caption}&rdquo;
                </p>

                {/* Student Prompt Snippet Box */}
                {activeModalItem.promptSnippet && (
                  <div className="mt-4 p-3.5 rounded-xl bg-[#FBF7EE] border border-[#E8DFC9]">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E2A2B] font-bold block mb-1">
                      Live Classroom Prompt / Metric
                    </span>
                    <p className="text-xs sm:text-sm font-mono text-[#4A3B2C] leading-relaxed">
                      {activeModalItem.promptSnippet}
                    </p>
                  </div>
                )}

                {/* Field Story Narrative */}
                <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E2A2B] font-bold block mb-1">
                    The Field Story Behind This Photo
                  </span>
                  <p className="text-xs sm:text-sm text-[#444] leading-relaxed">
                    {activeModalItem.story}
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-[#E8E2D6] flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#888]">Pedagogical Takeaway:</span>
                    <span className="text-[#2D5A27] font-semibold">{activeModalItem.takeaway}</span>
                  </div>
                </div>

                {/* ─── INTERACTIVE THUMBNAIL CAROUSEL AT BOTTOM OF MODAL ─────── */}
                <div className="mt-5 pt-4 border-t border-[#ECE8E1]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#777] font-semibold">
                      All 9 Field Photographs:
                    </span>
                    <span className="font-mono text-[10px] text-[#9E2A2B] font-bold">
                      {PHOTOS.findIndex((p) => p.id === activeModalItem.id) + 1} / {PHOTOS.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {PHOTOS.map((thumb) => {
                      const isSelected = thumb.id === activeModalItem.id
                      return (
                        <button
                          key={thumb.id}
                          type="button"
                          onClick={() => setActiveModalItem(thumb)}
                          className={`relative size-14 sm:size-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#9E2A2B] ring-2 ring-[#9E2A2B]/30 scale-105'
                              : 'border-transparent opacity-65 hover:opacity-100'
                          }`}
                        >
                          <Image
                            src={thumb.url}
                            alt={thumb.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
