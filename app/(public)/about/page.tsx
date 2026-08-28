import type { Metadata } from 'next'
import { getContentBlock } from '@/lib/data/public'
import { ORIGIN_STORY_FALLBACK, type OriginStoryContent } from '@/app/(public)/content'
import { OriginIntro } from '@/components/marketing/origin-intro'
import { OriginMoment } from '@/components/marketing/origin-moment'
import { FirstClassroom } from '@/components/marketing/first-classroom'
import { HumanMoment } from '@/components/marketing/human-moment'
import { WhatWeBelieve } from '@/components/marketing/what-we-believe'
import { OperatingLoop } from '@/components/marketing/operating-loop'
import { WhyWeContinue } from '@/components/marketing/why-we-continue'

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
  whyWeContinue: {
    src: `${CLOUDINARY},w_1200/v1784178443/IMG-20260410-WA0007_txyvjq.jpg`,
    alt: 'Teach AI for India team with a school principal after securing a session partnership',
  },
} as const

export default async function AboutPage() {
  const content = await getContentBlock<OriginStoryContent>('origin_story', ORIGIN_STORY_FALLBACK)

  return (
    <>
      <OriginIntro content={content.intro} />
      <OriginMoment content={content.originMoment} photo={PHOTOS.originMoment} />
      <FirstClassroom content={content.firstClassroom} mainPhoto={PHOTOS.classroomMain} insetPhoto={PHOTOS.classroomInset} />
      <HumanMoment content={content.humanMoment} photo={PHOTOS.humanMoment} />
      <WhatWeBelieve content={content.belief} />
      <OperatingLoop content={content.operatingLoop} volunteerNote={content.volunteerNote} photo={PHOTOS.operatingLoop} />
      <WhyWeContinue content={content.whyWeContinue} photo={PHOTOS.whyWeContinue} />
    </>
  )
}
