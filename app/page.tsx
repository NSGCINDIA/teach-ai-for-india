import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import LiveExecution from "@/components/live-execution"
import ImpactSection from "@/components/impact-section"
import WhatWeDo from "@/components/what-we-do"
import ProgramStructure from "@/components/program-structure"
import ExecutionModel from "@/components/execution-model"
import CampusSection from "@/components/campus-section"
import GeographicReach from "@/components/geographic-reach"
import Achievements from "@/components/achievements"
import WhyPlatform from "@/components/why-platform"
import VisionSection from "@/components/vision-section"
import AccessSection from "@/components/access-section"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <LiveExecution />
      <ImpactSection />
      <WhatWeDo />
      <ProgramStructure />
      <ExecutionModel />
      <CampusSection />
      <GeographicReach />
      <Achievements />
      <WhyPlatform />
      <VisionSection />
      <AccessSection />
      <Footer />
    </main>
  )
}
