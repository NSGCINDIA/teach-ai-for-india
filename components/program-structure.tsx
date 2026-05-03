import { Lightbulb, Hammer, Rocket } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: Lightbulb,
    title: "Introduction to AI",
    description:
      "Students are introduced to what AI is, how it works, and its real-world applications through engaging presentations and group discussions.",
    color: "#FF9933",
  },
  {
    step: "02",
    icon: Hammer,
    title: "Hands-on Activities",
    description:
      "Interactive exercises where students use AI tools, write prompts, and explore AI-generated outputs to develop practical skills.",
    color: "#138808",
  },
  {
    step: "03",
    icon: Rocket,
    title: "Projects & Application",
    description:
      "Students apply their learning to real-world problems, building mini-projects that showcase AI solutions for community challenges.",
    color: "#1d7adb",
  },
]

export default function ProgramStructure() {
  return (
    <section id="program" className="section-padding" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#FF9933" }}>
            Program Structure
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            A Clear 3-Phase Learning Journey
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
            Each school visit is structured into three progressive phases that build on each other.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connecting line (desktop) */}
          <div
            className="hidden md:block absolute top-10 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-0.5"
            style={{ background: "linear-gradient(90deg, #FF9933, #138808, #1d7adb)" }}
          />

          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.step}
                className="card-hover relative bg-white rounded-2xl border border-border p-7 shadow-sm flex flex-col items-center text-center gap-4"
              >
                {/* Step number badge */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full text-white shadow-sm"
                  style={{ backgroundColor: step.color }}
                >
                  {step.step}
                </div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mt-2"
                  style={{ backgroundColor: `${step.color}18` }}
                >
                  <Icon size={26} style={{ color: step.color }} />
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
