"use client"

import { useRef } from "react"
import { Brain, Cpu, PenLine, GraduationCap, ShieldCheck } from "lucide-react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { staggerContainer, cardItem, fadeUp } from "@/lib/motion"

const programs = [
  { icon: Brain,         title: "AI Awareness Sessions",  description: "Foundational AI concepts delivered in an engaging, accessible format built for government school students.", color: "#FF9933" },
  { icon: Cpu,           title: "Hands-on Learning",      description: "Students interact with real AI tools through guided demos and activities that build practical intuition.",   color: "#138808" },
  { icon: PenLine,       title: "Prompt Writing",         description: "Structured exercises that teach students how to communicate clearly and effectively with AI systems.",       color: "#1d7adb" },
  { icon: GraduationCap, title: "AI for Education",       description: "Integrating AI into academic workflows — research, summarisation, and study tools — to raise performance.", color: "#FF9933" },
  { icon: ShieldCheck,   title: "Ethical AI Usage",       description: "Critical thinking around bias, privacy, and societal impact so students become responsible AI users.",      color: "#138808" },
]

export default function WhatWeDo() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const sectionX = useTransform(scrollYProgress, [0, 0.3], ["-3%", "0%"])

  return (
    <section ref={ref} className="section-padding bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-14"
        >
          <p className="section-label mb-3" style={{ color: "#138808" }}>What We Do</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            A Structured AI Curriculum
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto leading-relaxed text-sm">
            Five core modules designed to build comprehensive AI literacy — from awareness to application.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          style={{ x: sectionX }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {programs.map((program, i) => {
            const Icon = program.icon
            return (
              <motion.div
                key={program.title}
                variants={cardItem}
                whileHover={{
                  y: -10,
                  rotateX: 3,
                  rotateY: i % 2 === 0 ? 2 : -2,
                  boxShadow: `0 24px 48px -12px ${program.color}28`,
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
                style={{ transformStyle: "preserve-3d" }}
                className={`rounded-2xl border border-border bg-white p-6 flex flex-col gap-4 cursor-default ${
                  i === 4 ? "sm:col-span-2 lg:col-span-1 lg:col-start-2" : ""
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${program.color}18` }}
                >
                  <Icon size={22} style={{ color: program.color }} />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-1.5">{program.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{program.description}</p>
                </div>
                {/* Bottom accent bar */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="h-[2px] rounded-full origin-left mt-auto"
                  style={{ background: `linear-gradient(90deg, ${program.color}, transparent)` }}
                />
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
