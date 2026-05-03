"use client"

import { Trophy, Star, TrendingUp } from "lucide-react"
import { useFadeUp } from "@/hooks/use-fade-up"

const achievements = [
  {
    icon: Trophy,
    title: "18 Schools Completed",
    description:
      "Fully graduated the first cohort through all three phases of the programme — with student projects delivered and documented.",
    color: "#FF9933",
  },
  {
    icon: Star,
    title: "First Round Successfully Delivered",
    description:
      "Positive feedback from students and educators across all schools, with measurable improvement in AI literacy scores.",
    color: "#138808",
  },
  {
    icon: TrendingUp,
    title: "Rapid Expansion Across Campuses",
    description:
      "Scaled from 3 to 9 campuses in a single academic year. Further expansion across both states already underway.",
    color: "#1d7adb",
  },
]

export default function Achievements() {
  const headingRef = useFadeUp()
  const cardsRef = useFadeUp()

  return (
    <section className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        <div ref={headingRef} className="fade-up text-center mb-14">
          <p className="section-label mb-3" style={{ color: "#FF9933" }}>Milestones Achieved</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Progress That Speaks
          </h2>
        </div>

        <div ref={cardsRef} className="fade-up grid grid-cols-1 md:grid-cols-3 gap-5">
          {achievements.map((item, i) => {
            const Icon = item.icon
            const stagger = ["stagger-1","stagger-2","stagger-3"][i]
            return (
              <div
                key={item.title}
                className={`card-hover rounded-2xl border border-border bg-white p-8 flex flex-col items-center text-center gap-5 ${stagger}`}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <Icon size={26} style={{ color: item.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
