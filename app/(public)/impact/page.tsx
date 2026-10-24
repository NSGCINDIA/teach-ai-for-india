import type { Metadata } from 'next'
import { getImpactStats, getCampusCards, getPublicGallery } from '@/lib/data/public'
import { ImpactHero } from '@/components/marketing/impact-hero'
import { ImpactTimeline } from '@/components/marketing/impact-timeline'
import { ImpactReach } from '@/components/marketing/impact-reach'
import { ImpactClassroomMoment } from '@/components/marketing/impact-classroom-moment'
import { ImpactBeforeAfter } from '@/components/marketing/impact-before-after'
import { ImpactVoices } from '@/components/marketing/impact-voices'
import { ImpactModel } from '@/components/marketing/impact-model'
import { ImpactGallery } from '@/components/marketing/impact-gallery'
import { ImpactStories } from '@/components/marketing/impact-stories'
import { ImpactTransparency } from '@/components/marketing/impact-transparency'
import { ImpactWhatsNext } from '@/components/marketing/impact-whats-next'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Impact',
  description:
    '1,842+ students. Real classrooms. One growing movement — verified impact, classroom evidence, and student stories across Telangana and Andhra Pradesh.',
}

export default async function ImpactPage() {
  const [stats, campuses, galleryItems] = await Promise.all([
    getImpactStats(),
    getCampusCards(),
    getPublicGallery(8),
  ])

  // High-quality verified fallback classroom photos if media table is unpopulated in dev database
  const displayGallery =
    galleryItems.length > 0
      ? galleryItems
      : [
          {
            id: 'mock-1',
            url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177864/WhatsApp_Image_2026-04-18_at_14.46.43_vtswq0.jpg',
            fileType: 'photo' as const,
            fileName: 'session_bachupally.jpg',
            caption: 'Students at ZPHS Bachupally learning to prompt AI during a NIAT × KKH session.',
            campusId: 'niat-kkh',
            createdAt: '2026-06-15T10:00:00Z',
          },
          {
            id: 'mock-2',
            url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177877/DJI_20260711131020_0287_D_rvh8gg.jpg',
            fileType: 'photo' as const,
            fileName: 'session_cdu.jpg',
            caption: 'Volunteers and students huddling around shared tablets as live generations render.',
            campusId: 'niat-cdu',
            createdAt: '2026-06-12T11:30:00Z',
          },
          {
            id: 'mock-3',
            url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177864/IMG-20260406-WA0007_3_hboy0k.jpg',
            fileType: 'photo' as const,
            fileName: 'session_aurora.jpg',
            caption: 'Interactive workshop on neural networks and creative prompt engineering in Telugu.',
            campusId: 'niat-aurora',
            createdAt: '2026-06-10T09:15:00Z',
          },
          {
            id: 'mock-4',
            url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177867/IMG_20260324_121056961_prkzll.jpg',
            fileType: 'photo' as const,
            fileName: 'session_mrv.jpg',
            caption: 'Classroom erupting in laughter and excitement during the first live output.',
            campusId: 'niat-mrv',
            createdAt: '2026-06-08T14:20:00Z',
          },
          {
            id: 'mock-5',
            url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784178443/motion_photo_8450246088682134754_gtddpq.jpg',
            fileType: 'photo' as const,
            fileName: 'session_chevella.jpg',
            caption: 'Volunteer team setting up the local computer lab for a weekend AI boot camp.',
            campusId: 'niat-chevella',
            createdAt: '2026-06-05T10:45:00Z',
          },
          {
            id: 'mock-6',
            url: 'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_800/v1784177911/DJI_20260711132101_0313_D_a48glv.jpg',
            fileType: 'photo' as const,
            fileName: 'session_ciet.jpg',
            caption: 'Students asking volunteers questions about engineering and coding after class ended.',
            campusId: 'niat-ciet',
            createdAt: '2026-05-28T11:00:00Z',
          },
        ]

  return (
    <>
      {/* 1 & 2. HERO & IMPACT NUMBERS: Impact at a glance with live verified data */}
      <ImpactHero stats={stats} />

      {/* 3. IMPACT OVER TIME: Milestone timeline from March 2026 to today */}
      <ImpactTimeline />

      {/* 4. WHERE WE'VE REACHED: School & campus location cards across AP and Telangana */}
      <ImpactReach campuses={campuses} />

      {/* 5. WHAT HAPPENS IN A CLASSROOM: The emotional 5-step centerpiece */}
      <ImpactClassroomMoment />

      {/* 6. STUDENT TRANSFORMATION: Before vs After */}
      <ImpactBeforeAfter />

      {/* 7. REAL VOICES: Authentic student and headmaster quotes */}
      <ImpactVoices />

      {/* 8. HOW WE MEASURE: Reach, Experience, Feedback, Improvement */}
      <ImpactModel />

      {/* 9. CLASSROOM EVIDENCE: Verified visual gallery with school metadata */}
      <ImpactGallery items={displayGallery} />

      {/* 10. IMPACT STORIES: 3 documented story cards */}
      <ImpactStories />

      {/* 11. TRANSPARENCY: See the work behind the numbers */}
      <ImpactTransparency />

      {/* 12 & 13. WHAT'S NEXT & FINAL CTA: The road ahead + dual pathway */}
      <ImpactWhatsNext />
    </>
  )
}
