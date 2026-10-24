import type { Metadata } from 'next'
import { landingContent } from '@/app/(public)/content'
import { CinematicSchoolEntrance } from '@/components/marketing/cinematic/cinematic-school-entrance'
import { MissionDoorwaySection } from '@/components/marketing/cinematic/mission-doorway-section'
import { ClassroomDoorsPrograms } from '@/components/marketing/cinematic/classroom-doors-programs'
import { PedagogyPipelineSection } from '@/components/marketing/cinematic/pedagogy-pipeline-section'
import { GatheringImpactSection } from '@/components/marketing/cinematic/gathering-impact-section'
import { InteractiveIndiaMapSection } from '@/components/marketing/cinematic/interactive-india-map-section'
import { StudentStoriesDesk } from '@/components/marketing/cinematic/student-stories-desk'
import { NoticeBoardGallery } from '@/components/marketing/cinematic/notice-board-gallery'
import { ThreePathwaysSection } from '@/components/marketing/cinematic/three-pathways-section'
import { TangibleSupportSection } from '@/components/marketing/cinematic/tangible-support-section'
import { FaqSection } from '@/components/marketing/faq-section'
import { SunsetExitEnding } from '@/components/marketing/cinematic/sunset-exit-ending'

export const revalidate = 300

export const metadata: Metadata = {
  title: landingContent.meta.title,
  description: landingContent.meta.description,
}

export default function HomePage() {
  return (
    <>
      {/* ─── 01 & 02. ENTER THE SCHOOL & CLASSROOM (2-SCROLL DIRECT FLIGHT) ── */}
      <CinematicSchoolEntrance />

      {/* ─── 03. MISSION: EVERY CLASSROOM A DOORWAY TO THE FUTURE ────────── */}
      <MissionDoorwaySection />

      {/* ─── 04. PROGRAMS: THREE SPATIAL CLASSROOM DOORS ─────────────────── */}
      <ClassroomDoorsPrograms />

      {/* ─── 05. HOW WE TEACH: PEDAGOGY PIPELINE ──────────────────────────── */}
      <PedagogyPipelineSection />

      {/* ─── 06. VERIFIED IMPACT METRICS ──────────────────────────────────── */}
      <GatheringImpactSection />

      {/* ─── 07. NATIONAL MOVEMENT: INTERACTIVE SVG INDIA MAP ─────────────── */}
      <InteractiveIndiaMapSection />

      {/* ─── 08. STUDENT VOICES: TACTILE CLASSROOM NOTEBOOKS & IDS ────────── */}
      <StudentStoriesDesk />

      {/* ─── 09. NOTICE BOARD: CLASSROOM PHOTO ARCHIVE WITH REAL PINS ─────── */}
      <NoticeBoardGallery />

      {/* ─── 10. GET INVOLVED: THREE ACTIONABLE PATHWAYS ──────────────────── */}
      <ThreePathwaysSection />

      {/* ─── 11. TANGIBLE TRANSPARENCY: WHERE EVERY RUPEE GOES ────────────── */}
      <TangibleSupportSection />

      {/* ─── FAQ ACCORDION ───────────────────────────────────────────────── */}
      <FaqSection />

      {/* ─── 12. SUNSET FINALE & FINAL CTA ───────────────────────────────── */}
      <SunsetExitEnding />
    </>
  )
}
