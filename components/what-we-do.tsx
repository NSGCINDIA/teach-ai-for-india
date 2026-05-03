"use client"

import { Brain, Cpu, PenLine, GraduationCap, ShieldCheck } from "lucide-react"
import { useFadeUp } from "@/hooks/use-fade-up"

const programs = [
  {
    icon: Brain,
    title: "AI Awareness Sessions",
    description: "Foundational AI concepts delivered in an engaging, accessible format built for government school students.",
    color: "#FF9933",
  },
  {
    icon: Cpu,
    title: "Hands-on Learning",
    description: "Students interact with real AI tools through guided demos and activities that build practical intuition.",
    color: "#138808",
  },
  {
    icon: PenLine,
    title: "Prompt Writing",
    description: "Structured exercises that teach students how to communicate clearly and effectively with AI systems.",
    color: "#1d7adb",
  },
  {
    icon: GraduationCap,
    title: "AI for Education",
    description: "Integrating AI into academic workflows — research, summarisation, and study tools — to raise performance.",
    color: "#FF9933",
  },
  {
    icon: ShieldCheck,
    title: "Ethical AI Usage",
    description: "Critical thinking around bias, privacy, and societal impact so students become responsible AI users.",
    color: "#138808",
  },
]

const staggerClasses = ["stagger-1","stagger-2","stagger-3","stagger-4","stagger-5"]

export default function WhatWeDo() {
  const headingRef = useFadeUp()
  const gridRef = useFadeUp()

  return (
    <section className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        <div ref={headingRef} className="fade-up text-center mb-14">
          <p className="section-label mb-3" style={{ color: "#138808" }}>What We Do</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            A Structured AI Curriculum
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto leading-relaxed text-sm">
            Five core modules designed to build comprehensive AI literacy — from awareness to application.
          </p>
        </div>

        <div ref={gridRef} className="fade-up grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((program, i) => {
            const Icon = program.icon
            return (
              <div
                key={program.title}
                className={`card-hover rounded-2xl border border-border bg-white p-6 flex flex-col gap-3 ${staggerClasses[i]} ${
                  i === 4 ? "sm:col-span-2 lg:col-span-1 lg:col-start-2" : ""
                }`}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${program.color}15` }}
                >
                  <Icon size={20} style={{ color: program.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-1.5">{program.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{program.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
