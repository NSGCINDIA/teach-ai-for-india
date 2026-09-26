import type { Metadata } from 'next'
import { getContentBlock, getImpactStats } from '@/lib/data/public'
import { ORIGIN_STORY_FALLBACK, type OriginStoryContent } from '@/app/(public)/content'
import { OriginIntro } from '@/components/marketing/origin-intro'
import { AboutGap } from '@/components/marketing/about-gap'
import { OriginMoment } from '@/components/marketing/origin-moment'
import { FirstClassroom } from '@/components/marketing/first-classroom'
import { HumanMoment } from '@/components/marketing/human-moment'
import { WhatWeBelieve } from '@/components/marketing/what-we-believe'
import { OperatingLoop } from '@/components/marketing/operating-loop'
import { AboutProof } from '@/components/marketing/about-proof'
import { AboutScale } from '@/components/marketing/about-scale'
import { AboutTwoPaths } from '@/components/marketing/about-two-paths'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'About',
  description:
    'We learned something valuable. We decided to give it back — the real story of how Teach AI for India started, one classroom at a time.',
}

const CLOUDINARY = 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto'

const PHOTOS = {
  originMoment: {
    src: `${CLOUDINARY},w_1200/v1784177864/WhatsApp_Image_2026-04-18_at_14.46.43_vtswq0.jpg`,
    alt: 'A government school classroom before a Teach AI for India session begins',
  },
  classroomMain: {
    src: `${CLOUDINARY},w_1400/v1784177867/IMG_20260324_121056961_prkzll.jpg`,
    alt: 'Students at MPPS Nandakramaguda during the first Teach AI for India session',
  },
  classroomInset: {
    src: `${CLOUDINARY},w_800/v1784177864/IMG-20260406-WA0007_3_hboy0k.jpg`,
    alt: 'A student typing a creative AI image prompt during the first session',
  },
  humanMoment: {
    src: `${CLOUDINARY},w_1200/v1784177911/DJI_20260711132101_0313_D_a48glv.jpg`,
    alt: 'Students asking Teach AI for India volunteers questions after the session ended',
  },
  operatingLoop: {
    src: `${CLOUDINARY},w_800/v1784177864/WhatsApp_Image_2026-04-18_at_15.25.48_2_qd8mq3.jpg`,
    alt: 'Teach AI for India volunteers collaborating on curriculum for a session',
  },
} as const

export default async function AboutPage() {
  const [content, stats] = await Promise.all([
    getContentBlock<OriginStoryContent>('origin_story', ORIGIN_STORY_FALLBACK),
    getImpactStats(),
  ])

  return (
    <>
      {/* 1. WHY WE EXIST: Opening with concise credibility statement */}
      <OriginIntro content={content.intro} />

      {/* 2. THE GAP: The AI opportunity gap and our response */}
      <AboutGap />

      {/* 3. OUR STORY: Origin, First Classroom, and the Human Moment */}
      <OriginMoment content={content.originMoment} photo={PHOTOS.originMoment} />
      <FirstClassroom
        content={content.firstClassroom}
        mainPhoto={PHOTOS.classroomMain}
        insetPhoto={PHOTOS.classroomInset}
      />
      <HumanMoment content={content.humanMoment} photo={PHOTOS.humanMoment} />

      {/* 4. WHAT WE BELIEVE: Access, Practice, Sharing */}
      <WhatWeBelieve />

      {/* 5. HOW WE WORK: Repeatable operating loop */}
      <OperatingLoop
        content={content.operatingLoop}
        volunteerNote={content.volunteerNote}
        photo={PHOTOS.operatingLoop}
      />

      {/* 6. PROOF: The model is already in motion (verified stats) */}
      <AboutProof stats={stats} />

      {/* 7. WHY IT CAN SCALE: Built to grow from one campus to many */}
      <AboutScale />

      {/* 8. JOIN / PARTNER: Dual pathway for volunteers and partners */}
      <AboutTwoPaths />
    </>
  )
}
