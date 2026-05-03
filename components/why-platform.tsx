"use client"

import { useRef } from "react"
import { X, CheckCircle2 } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { fadeUp, slideLeft, slideRight } from "@/lib/motion"

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
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="section-padding overflow-hidden" style={{ backgroundColor: "#f7f7f7" }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-14"
        >
          <p className="section-label mb-3" style={{ color: "#138808" }}>Why This Platform</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">Built to Solve Real Problems</h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto leading-relaxed text-sm">
            We identified the gaps in managing a distributed education initiative — and built the right tools to close them.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {/* Problem card */}
          <motion.div
            variants={slideLeft}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            whileHover={{
              y: -8,
              boxShadow: "0 20px 40px -12px rgba(239,68,68,0.18)",
              transition: { type: "spring", stiffness: 350, damping: 22 },
            }}
            className="rounded-2xl border border-red-100 bg-red-50/50 p-7"
          >
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <X size={16} className="text-red-500" />
              </div>
              <h3 className="font-bold text-base text-foreground">The Problem</h3>
            </div>
            <ul className="space-y-4">
              {problems.map((p, i) => (
                <motion.li
                  key={p}
                  initial={{ opacity: 0, x: -16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.15 + i * 0.1 }}
                  className="flex items-start gap-3 text-sm"
                >
                  <X size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <span className="text-foreground/80 leading-relaxed">{p}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Solution card */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            whileHover={{
              y: -8,
              boxShadow: "0 20px 40px -12px rgba(19,136,8,0.18)",
              transition: { type: "spring", stiffness: 350, damping: 22 },
            }}
            className="rounded-2xl border p-7"
            style={{ borderColor: "#13880825", backgroundColor: "#f0fdf0" }}
          >
            <div className="flex items-center gap-2.5 mb-6">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#13880820" }}
              >
                <CheckCircle2 size={16} style={{ color: "#138808" }} />
              </div>
              <h3 className="font-bold text-base text-foreground">Our Solution</h3>
            </div>
            <ul className="space-y-4">
              {solutions.map((s, i) => (
                <motion.li
                  key={s}
                  initial={{ opacity: 0, x: 16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.15 + i * 0.1 }}
                  className="flex items-start gap-3 text-sm"
                >
                  <CheckCircle2 size={14} style={{ color: "#138808" }} className="shrink-0 mt-0.5" />
                  <span className="text-foreground/80 leading-relaxed">{s}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
