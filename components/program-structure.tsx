"use client"

import { Lightbulb, Hammer, Rocket } from "lucide-react"
import { useFadeUp } from "@/hooks/use-fade-up"

const steps = [
  {
    step: "01",
    icon: Lightbulb,
    title: "Introduction to AI",
    description:
      "Students discover what AI is, how it works, and where it already shows up in their daily lives — through engaging stories and live demonstrations.",
    color: "#FF9933",
  },
  {
    step: "02",
    icon: Hammer,
    title: "Hands-on Activities",
    description:
      "Interactive exercises where students use real AI tools, write prompts, and explore outputs. Learning by doing, not by watching.",
    color: "#138808",
  },
  {
    step: "03",
    icon: Rocket,
    title: "Projects & Application",
    description:
      "Students build mini-projects that apply AI to problems in their own community — turning knowledge into action.",
    color: "#1d7adb",
  },
]

export default function ProgramStructure() {
  const headingRef = useFadeUp()
  const stepsRef = useFadeUp()

  return (
    <section id="program" className="section-padding" style={{ backgroundColor: "#f7f7f7" }}>
      <div className="max-w-6xl mx-auto">
        <div ref={headingRef} className="fade-up text-center mb-14">
          <p className="section-label mb-3" style={{ color: "#FF9933" }}>Program Structure</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            A Clear 3-Phase Learning Journey
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto leading-relaxed text-sm">
            Each school visit follows three progressive phases that build confidence and capability at every step.
          </p>
        </div>

        <div ref={stepsRef} className="fade-up relative grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Connector line */}
          <div
            className="hidden md:block absolute top-[3.25rem] left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px"
            style={{ background: "linear-gradient(90deg, #FF9933 0%, #138808 50%, #1d7adb 100%)" }}
          />

          {steps.map((step, i) => {
            const Icon = step.icon
            const stagger = ["stagger-1","stagger-2","stagger-3"][i]
            return (
              <div
                key={step.step}
                className={`card-hover relative bg-white rounded-2xl border border-border p-7 flex flex-col items-center text-center gap-4 ${stagger}`}
              >
                {/* Step badge */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full text-white shadow-sm"
                  style={{ backgroundColor: step.color }}
                >
                  {step.step}
                </div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mt-2"
                  style={{ backgroundColor: `${step.color}15` }}
                >
                  <Icon size={24} style={{ color: step.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
