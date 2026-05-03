"use client"

import { Users, School, CalendarCheck, Map, Building2, Heart } from "lucide-react"
import { useFadeUp } from "@/hooks/use-fade-up"

const stats = [
  { value: "1,820+", label: "Students Impacted",   icon: Users,         color: "#FF9933" },
  { value: "41",     label: "Schools Targeted",     icon: School,        color: "#138808" },
  { value: "123",    label: "Sessions Planned",     icon: CalendarCheck, color: "#1d7adb" },
  { value: "2",      label: "States",               icon: Map,           color: "#FF9933" },
  { value: "8+",     label: "Campuses",             icon: Building2,     color: "#138808" },
  { value: "30+",    label: "Volunteers",           icon: Heart,         color: "#e04040" },
]

const staggerClasses = ["stagger-1","stagger-2","stagger-3","stagger-4","stagger-5","stagger-6"]

export default function ImpactSection() {
  const headingRef = useFadeUp()
  const gridRef = useFadeUp()

  return (
    <section id="impact" className="section-padding" style={{ backgroundColor: "#f7f7f7" }}>
      <div className="max-w-6xl mx-auto">
        <div ref={headingRef} className="fade-up text-center mb-14">
          <p className="section-label mb-3" style={{ color: "#FF9933" }}>Our Growing Impact</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Making a Real Difference Across India
          </h2>
        </div>

        <div ref={gridRef} className="fade-up grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className={`card-hover bg-white rounded-2xl border border-border p-6 flex flex-col items-center text-center gap-3 ${staggerClasses[i]}`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon size={19} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-[1.65rem] font-extrabold text-foreground leading-none tabular-nums">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-snug">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
