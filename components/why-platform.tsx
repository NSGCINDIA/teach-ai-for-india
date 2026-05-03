"use client"

import { X, CheckCircle2 } from "lucide-react"
import { useFadeUp } from "@/hooks/use-fade-up"

const problems = [
  "No centralised tracking for session data across campuses",
  "Hard to coordinate 9 independent campus teams at once",
  "Inconsistent field reports make impact measurement unreliable",
]

const solutions = [
  "One centralised dashboard — all campus data in a single view",
  "Real-time tracking so nothing falls through the cracks",
  "Structured execution model with standardised session reporting",
]

export default function WhyPlatform() {
  const headingRef = useFadeUp()
  const cardsRef = useFadeUp()

  return (
    <section className="section-padding" style={{ backgroundColor: "#f7f7f7" }}>
      <div className="max-w-6xl mx-auto">
        <div ref={headingRef} className="fade-up text-center mb-14">
          <p className="section-label mb-3" style={{ color: "#138808" }}>Why This Platform</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Built to Solve Real Problems
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto leading-relaxed text-sm">
            We identified the gaps in managing a distributed education initiative — and built the right tools to close them.
          </p>
        </div>

        <div ref={cardsRef} className="fade-up grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {/* Problem */}
          <div className="stagger-1 rounded-2xl border border-red-100 bg-red-50/50 p-7">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <X size={15} className="text-red-500" />
              </div>
              <h3 className="font-bold text-base text-foreground">The Problem</h3>
            </div>
            <ul className="space-y-4">
              {problems.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm">
                  <X size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <span className="text-foreground/80 leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solution */}
          <div
            className="stagger-2 rounded-2xl border p-7"
            style={{ borderColor: "#13880825", backgroundColor: "#f0fdf0" }}
          >
            <div className="flex items-center gap-2.5 mb-6">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#13880818" }}
              >
                <CheckCircle2 size={15} style={{ color: "#138808" }} />
              </div>
              <h3 className="font-bold text-base text-foreground">Our Solution</h3>
            </div>
            <ul className="space-y-4">
              {solutions.map((s) => (
                <li key={s} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 size={14} style={{ color: "#138808" }} className="shrink-0 mt-0.5" />
                  <span className="text-foreground/80 leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
