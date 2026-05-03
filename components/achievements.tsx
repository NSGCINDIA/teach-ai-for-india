"use client"

import { useRef } from "react"
import { Trophy, Star, TrendingUp } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { staggerContainer, cardItem, fadeUp } from "@/lib/motion"

const achievements = [
  { icon: Trophy,     title: "18 Schools Completed",           description: "Fully graduated the first cohort through all three phases — with student projects delivered and documented.",             color: "#FF9933" },
  { icon: Star,       title: "First Round Successfully Done",  description: "Positive feedback from students and educators across all schools, with measurable improvement in AI literacy.",           color: "#138808" },
  { icon: TrendingUp, title: "Rapid Expansion",                description: "Scaled from 3 to 9 campuses in a single academic year. Further expansion across both states already underway.",          color: "#1d7adb" },
]

export default function Achievements() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="section-padding bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-14"
        >
          <p className="section-label mb-3" style={{ color: "#FF9933" }}>Milestones Achieved</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">Progress That Speaks</h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {achievements.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                variants={cardItem}
                whileHover={{
                  y: -12,
                  scale: 1.03,
                  rotateY: i === 0 ? 3 : i === 2 ? -3 : 0,
                  boxShadow: `0 32px 60px -16px ${item.color}30`,
                  transition: { type: "spring", stiffness: 280, damping: 18 },
                }}
                style={{ transformStyle: "preserve-3d" }}
                className="rounded-2xl border border-border bg-white p-8 flex flex-col items-center text-center gap-5 cursor-default"
              >
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 8, transition: { type: "spring", stiffness: 400, damping: 15 } }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}18` }}
                >
                  <Icon size={28} style={{ color: item.color }} />
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={inView ? { scaleX: 1 } : {}}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.7 }}
                  className="w-full h-[2px] rounded-full origin-left mt-auto"
                  style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }}
                />
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
