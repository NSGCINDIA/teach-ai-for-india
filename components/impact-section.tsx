"use client"

import { useRef } from "react"
import { Users, School, CalendarCheck, Map, Building2, Heart } from "lucide-react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { staggerContainer, cardItem, fadeUp } from "@/lib/motion"

const stats = [
  { value: "1,820+", label: "Students Impacted",   icon: Users,         color: "#FF9933" },
  { value: "41",     label: "Schools Targeted",     icon: School,        color: "#138808" },
  { value: "123",    label: "Sessions Planned",     icon: CalendarCheck, color: "#1d7adb" },
  { value: "2",      label: "States",               icon: Map,           color: "#FF9933" },
  { value: "8+",     label: "Campuses",             icon: Building2,     color: "#138808" },
  { value: "30+",    label: "Volunteers",           icon: Heart,         color: "#e04040" },
]

export default function ImpactSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"])

  return (
    <section id="impact" ref={ref} className="relative section-padding overflow-hidden" style={{ backgroundColor: "#f7f7f7" }}>
      {/* Subtle parallax bg pattern */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 dot-grid opacity-30 pointer-events-none"
      />

      <div className="relative max-w-6xl mx-auto z-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-14"
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.05em" }}
            animate={inView ? { opacity: 1, letterSpacing: "0.18em" } : {}}
            transition={{ duration: 0.8 }}
            className="section-label mb-3"
            style={{ color: "#FF9933" }}
          >
            Our Growing Impact
          </motion.p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Making a Real Difference Across India
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                variants={cardItem}
                whileHover={{
                  y: -8,
                  scale: 1.04,
                  boxShadow: `0 16px 40px -8px ${stat.color}30`,
                  transition: { type: "spring", stiffness: 400, damping: 18 },
                }}
                className="bg-white rounded-2xl border border-border p-6 flex flex-col items-center text-center gap-3 cursor-default"
              >
                <motion.div
                  whileHover={{ rotate: 12, scale: 1.12, transition: { type: "spring", stiffness: 400, damping: 15 } }}
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}18` }}
                >
                  <Icon size={20} style={{ color: stat.color }} />
                </motion.div>
                <div>
                  <p className="text-[1.7rem] font-extrabold text-foreground leading-none tabular-nums">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-snug">{stat.label}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
