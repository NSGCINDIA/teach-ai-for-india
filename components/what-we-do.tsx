import { Brain, Cpu, PenLine, GraduationCap, ShieldCheck } from "lucide-react"

const programs = [
  {
    icon: Brain,
    title: "AI Awareness Sessions",
    description: "Introducing foundational AI concepts to government school students in an engaging, accessible format.",
    color: "#FF9933",
  },
  {
    icon: Cpu,
    title: "Hands-on Learning",
    description: "Interactive activities and demonstrations where students experience AI tools firsthand.",
    color: "#138808",
  },
  {
    icon: PenLine,
    title: "Prompt Writing",
    description: "Teaching students how to communicate effectively with AI systems using structured prompts.",
    color: "#1d7adb",
  },
  {
    icon: GraduationCap,
    title: "AI for Education",
    description: "Integrating AI tools into learning workflows to improve academic performance and research skills.",
    color: "#FF9933",
  },
  {
    icon: ShieldCheck,
    title: "Ethical AI Usage",
    description: "Teaching responsible AI use: understanding bias, privacy, and societal implications.",
    color: "#138808",
  },
]

export default function WhatWeDo() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#138808" }}>
            What We Do
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            A Structured AI Curriculum
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
            Five core modules designed to build comprehensive AI literacy from the ground up.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {programs.map((program, idx) => {
            const Icon = program.icon
            return (
              <div
                key={program.title}
                className={`card-hover rounded-2xl border border-border bg-white p-6 shadow-sm ${
                  idx === 4 ? "lg:col-span-1 sm:col-span-2 lg:col-start-2" : ""
                }`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${program.color}18` }}
                >
                  <Icon size={22} style={{ color: program.color }} />
                </div>
                <h3 className="font-semibold text-base text-foreground mb-2">{program.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{program.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
