import { X, CheckCircle2 } from "lucide-react"

const problems = [
  "No centralized tracking system for sessions",
  "Difficult to manage and coordinate multiple campuses",
  "Inconsistent updates and reporting from field teams",
]

const solutions = [
  "Centralized dashboard for all campus data",
  "Real-time tracking and monitoring system",
  "Structured execution model with standardized reporting",
]

export default function WhyPlatform() {
  return (
    <section className="section-padding" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#138808" }}>
            Why This Platform
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Built to Solve Real Problems
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
            We identified the gaps in managing a distributed education initiative — and built the right tools to fix them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Problem */}
          <div className="rounded-2xl border border-red-100 bg-red-50/60 p-7">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <X size={16} className="text-red-500" />
              </div>
              <h3 className="font-bold text-base text-foreground">The Problem</h3>
            </div>
            <ul className="space-y-3">
              {problems.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm">
                  <X size={15} className="text-red-400 shrink-0 mt-0.5" />
                  <span className="text-foreground/80 leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solution */}
          <div className="rounded-2xl border p-7" style={{ borderColor: "#13880830", backgroundColor: "#f0fdf0" }}>
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#13880820" }}
              >
                <CheckCircle2 size={16} style={{ color: "#138808" }} />
              </div>
              <h3 className="font-bold text-base text-foreground">Our Solution</h3>
            </div>
            <ul className="space-y-3">
              {solutions.map((s) => (
                <li key={s} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 size={15} style={{ color: "#138808" }} className="shrink-0 mt-0.5" />
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
