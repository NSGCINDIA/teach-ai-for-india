"use client"

import { useRef } from "react"
import { School, RefreshCw, Network, Users } from "lucide-react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { fadeUp, slideLeft, slideRight, staggerContainer, cardItem } from "@/lib/motion"

const metrics = [
  { value: "250+", label: "Schools Targeted",  color: "#FF9933" },
  { value: "10k+", label: "Students Impacted", color: "#138808" },
  { value: "4",    label: "Visits Per School", color: "#1d7adb" },
  { value: "9",    label: "Active Campuses",   color: "#e04040" },
]

const pillars = [
  { icon: School,     title: "250+ Schools Targeted by 2027",       description: "A phased expansion plan across Telangana and Andhra Pradesh — from 41 schools today to 250+ in two years.",     color: "#FF9933" },
  { icon: RefreshCw,  title: "4 Visits Per School",                  description: "Four structured sessions per school ensure progressive learning rather than one-off events.",                       color: "#138808" },
  { icon: Network,    title: "Cluster-Based Monthly Execution",       description: "Schools grouped geographically. Each campus team owns a cluster and executes monthly — zero overhead duplication.", color: "#1d7adb" },
  { icon: Users,      title: "Parallel Campus Teams",                 description: "9 campus teams executing simultaneously — multiplying reach without multiplying overhead.",                         color: "#e04040" },
]

export default function ExecutionModel() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const bgScale = useTransform(scrollYProgress, [0, 1], [0.95, 1.05])

  return (
    <section ref={ref} className="section-padding bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-14"
        >
          <p className="section-label mb-3" style={{ color: "#138808" }}>Scale Through a Cluster-Based Model</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">Built to Scale Rapidly</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed text-sm">
            By 2027, Teach AI For India will expand across 250+ schools and impact 10,000+ students through a structured 4-visit per school model.
          </p>
        </motion.div>

        {/* Big metric counters */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
        >
          {metrics.map((m) => (
            <motion.div
              key={m.label}
              variants={cardItem}
              whileHover={{
                y: -10,
                scale: 1.05,
                boxShadow: `0 20px 40px -10px ${m.color}35`,
                transition: { type: "spring", stiffness: 350, damping: 18 },
              }}
              className="rounded-2xl border-2 bg-white p-7 text-center cursor-default"
              style={{ borderColor: m.color }}
            >
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
                className="text-3xl font-extrabold tabular-nums"
                style={{ color: m.color }}
              >
                {m.value}
              </motion.p>
              <p className="text-xs text-muted-foreground mt-2">{m.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Pillar cards with alternating slide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon
            const variant = i % 2 === 0 ? slideLeft : slideRight
            return (
              <motion.div
                key={pillar.title}
                variants={variant}
                initial="hidden"
                animate={inView ? "show" : "hidden"}
                transition={{ delay: 0.1 + i * 0.1 }}
                whileHover={{
                  y: -8,
                  boxShadow: `0 16px 40px -8px ${pillar.color}28`,
                  transition: { type: "spring", stiffness: 350, damping: 22 },
                }}
                className="rounded-2xl border border-border bg-white p-6 flex gap-5 items-start cursor-default"
              >
                <motion.div
                  whileHover={{ rotate: 12, scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${pillar.color}18` }}
                >
                  <Icon size={20} style={{ color: pillar.color }} />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-1.5">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
