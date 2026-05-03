"use client"

import { School, RefreshCw, Network, Users } from "lucide-react"
import { useFadeUp } from "@/hooks/use-fade-up"

const metrics = [
  { value: "250+",  label: "Schools Targeted",           color: "#FF9933" },
  { value: "10k+",  label: "Students Impacted",          color: "#138808" },
  { value: "4",     label: "Visits Per School",          color: "#1d7adb" },
  { value: "9",     label: "Active Campuses",            color: "#e04040" },
]

const pillars = [
  {
    icon: School,
    title: "250+ Schools Targeted by 2027",
    description: "A phased expansion plan across Telangana and Andhra Pradesh — from 41 schools today to 250+ in two years.",
    color: "#FF9933",
  },
  {
    icon: RefreshCw,
    title: "4 Visits Per School",
    description: "Four structured sessions per school ensure progressive learning rather than one-off events.",
    color: "#138808",
  },
  {
    icon: Network,
    title: "Cluster-Based Monthly Execution",
    description: "Schools grouped geographically into clusters. Each campus team owns a cluster and executes monthly.",
    color: "#1d7adb",
  },
  {
    icon: Users,
    title: "Parallel Campus Teams",
    description: "9 campus teams executing simultaneously — multiplying reach without multiplying overhead.",
    color: "#e04040",
  },
]

export default function ExecutionModel() {
  const headingRef = useFadeUp()
  const metricsRef = useFadeUp()
  const pillarsRef = useFadeUp()

  return (
    <section className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        <div ref={headingRef} className="fade-up text-center mb-14">
          <p className="section-label mb-3" style={{ color: "#138808" }}>Scale Through a Cluster-Based Model</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Built to Scale Rapidly
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed text-sm">
            By 2027, Teach AI For India will expand across 250+ schools and impact 10,000+ students through a structured 4-visit per school model.
          </p>
        </div>

        {/* Big metrics */}
        <div ref={metricsRef} className="fade-up grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {metrics.map((m, i) => {
            const stagger = ["stagger-1","stagger-2","stagger-3","stagger-4"][i]
            return (
              <div
                key={m.label}
                className={`card-hover rounded-2xl border border-border bg-white p-6 text-center ${stagger}`}
                style={{ borderTopWidth: 2, borderTopColor: m.color }}
              >
                <p className="text-3xl font-extrabold tabular-nums" style={{ color: m.color }}>{m.value}</p>
                <p className="text-xs text-muted-foreground mt-1.5">{m.label}</p>
              </div>
            )
          })}
        </div>

        {/* Pillar cards */}
        <div ref={pillarsRef} className="fade-up grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon
            const stagger = ["stagger-1","stagger-2","stagger-3","stagger-4"][i]
            return (
              <div
                key={pillar.title}
                className={`card-hover rounded-2xl border border-border bg-white p-6 flex gap-4 items-start ${stagger}`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${pillar.color}15` }}
                >
                  <Icon size={18} style={{ color: pillar.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
