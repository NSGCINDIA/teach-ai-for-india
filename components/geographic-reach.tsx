"use client"

import { MapPin, Building2, School, Circle } from "lucide-react"
import { useFadeUp } from "@/hooks/use-fade-up"

const states = [
  {
    name: "Telangana",
    campuses: 5,
    focus: "Hyderabad and surrounding 100 km radius",
    highlights: ["Hyderabad", "Warangal", "Nizamabad", "Khammam"],
    color: "#FF9933",
  },
  {
    name: "Andhra Pradesh",
    campuses: 4,
    focus: "Vijayawada, Vizag & Tirupati districts",
    highlights: ["Vijayawada", "Visakhapatnam", "Tirupati", "Guntur"],
    color: "#138808",
  },
]

export default function GeographicReach() {
  const headingRef = useFadeUp()
  const cardsRef = useFadeUp()

  return (
    <section
      className="section-padding text-white"
      style={{ background: "linear-gradient(160deg, #0f1923 0%, #0d2210 100%)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div ref={headingRef} className="fade-up text-center mb-14">
          <p className="section-label mb-3" style={{ color: "#FF9933" }}>Geographic Reach</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-balance">
            2 States.{" "}
            <span style={{ color: "#FF9933" }}>One</span>{" "}
            <span style={{ color: "#138808" }}>Mission.</span>
          </h2>
          <p className="text-white/60 mt-3 max-w-lg mx-auto leading-relaxed text-sm">
            Operational across Telangana and Andhra Pradesh — bringing future-ready AI education to both urban centres and remote village schools.
          </p>
        </div>

        <div ref={cardsRef} className="fade-up grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {states.map((state, i) => {
            const stagger = ["stagger-1","stagger-2"][i]
            return (
              <div
                key={state.name}
                className={`card-hover rounded-2xl p-7 border flex flex-col gap-6 ${stagger}`}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: `${state.color}35`,
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${state.color}20` }}
                  >
                    <MapPin size={17} style={{ color: state.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{state.name}</h3>
                    <p className="text-xs text-white/50 mt-0.5">{state.focus}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="rounded-xl p-4 flex items-center gap-3"
                    style={{ backgroundColor: `${state.color}15` }}
                  >
                    <Building2 size={15} style={{ color: state.color }} />
                    <div>
                      <p className="text-xl font-extrabold text-white tabular-nums">{state.campuses}</p>
                      <p className="text-xs text-white/55">Campuses</p>
                    </div>
                  </div>
                  <div
                    className="rounded-xl p-4 flex items-center gap-3"
                    style={{ backgroundColor: `${state.color}15` }}
                  >
                    <School size={15} style={{ color: state.color }} />
                    <div>
                      <p className="text-xl font-extrabold text-white tabular-nums">{state.campuses === 5 ? "24" : "17"}</p>
                      <p className="text-xs text-white/55">Schools</p>
                    </div>
                  </div>
                </div>

                {/* Key areas */}
                <div className="flex flex-wrap gap-2">
                  {state.highlights.map((h) => (
                    <span
                      key={h}
                      className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5"
                      style={{ backgroundColor: `${state.color}14`, color: state.color }}
                    >
                      <Circle size={5} fill="currentColor" />
                      {h}
                    </span>
                  ))}
                </div>

                {/* Status */}
                <div
                  className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full w-fit"
                  style={{ backgroundColor: `${state.color}18`, color: state.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: state.color }} />
                  Operational
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
