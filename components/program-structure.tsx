"use client"

import { useRef } from "react"
import { Lightbulb, Hammer, Rocket } from "lucide-react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { fadeUp, staggerContainer, cardItem } from "@/lib/motion"

const steps = [
  {
    step: "01",
    icon: Lightbulb,
    title: "Introduction to AI",
    description: "Students discover what AI is, how it works, and where it shows up in daily life — through engaging stories and live demonstrations.",
    color: "#FF9933",
  },
  {
    step: "02",
    icon: Hammer,
    title: "Hands-on Activities",
    description: "Interactive exercises where students use real AI tools, write prompts, and explore outputs. Learning by doing, not by watching.",
    color: "#138808",
  },
  {
    step: "03",
    icon: Rocket,
    title: "Projects & Application",
    description: "Students build mini-projects applying AI to problems in their own community — turning knowledge into action.",
    color: "#1d7adb",
  },
]

export default function ProgramStructure() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const lineScale = useTransform(scrollYProgress, [0.1, 0.6], [0, 1])

  return (
    <section id="program" ref={ref} className="section-padding overflow-hidden" style={{ backgroundColor: "#f7f7f7" }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-16"
        >
          <p className="section-label mb-3" style={{ color: "#FF9933" }}>Program Structure</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            A Clear 3-Phase Learning Journey
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto leading-relaxed text-sm">
            Each school visit follows three progressive phases that build confidence and capability at every step.
          </p>
        </motion.div>

        <div className="relative">
          {/* Animated connector line */}
          <div className="hidden md:block absolute top-[3.5rem] left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-[2px] overflow-hidden rounded-full bg-border">
            <motion.div
              style={{ scaleX: lineScale, originX: 0 }}
              className="absolute inset-0 rounded-full"
              style={{ background: "linear-gradient(90deg, #FF9933 0%, #138808 50%, #1d7adb 100%)", scaleX: lineScale, originX: 0 }}
            />
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.step}
                  variants={cardItem}
                  whileHover={{
                    y: -12,
                    scale: 1.03,
                    rotateY: i === 0 ? 4 : i === 2 ? -4 : 0,
                    boxShadow: `0 28px 56px -16px ${step.color}30`,
                    transition: { type: "spring", stiffness: 280, damping: 18 },
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="relative bg-white rounded-2xl border border-border p-8 flex flex-col items-center text-center gap-4 cursor-default"
                >
                  {/* Step number badge */}
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={inView ? { scale: 1, rotate: 0 } : {}}
                    transition={{ delay: 0.2 + i * 0.12, type: "spring", stiffness: 300 }}
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3.5 py-1 rounded-full text-white shadow-md"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.step}
                  </motion.div>

                  <motion.div
                    whileHover={{ rotate: 12, scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mt-2"
                    style={{ backgroundColor: `${step.color}18` }}
                  >
                    <Icon size={28} style={{ color: step.color }} />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-base text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
