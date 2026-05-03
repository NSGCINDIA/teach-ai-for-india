"use client"

import { useRef } from "react"
import { MapPin, Building2, School, Circle } from "lucide-react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { fadeUp, staggerContainer, cardItem } from "@/lib/motion"

const states = [
  {
    name: "Telangana",
    campuses: 5,
    schools: 24,
    focus: "Hyderabad and surrounding 100 km radius",
    highlights: ["Hyderabad", "Warangal", "Nizamabad", "Khammam"],
    color: "#FF9933",
  },
  {
    name: "Andhra Pradesh",
    campuses: 4,
    schools: 17,
    focus: "Vijayawada, Vizag & Tirupati districts",
    highlights: ["Vijayawada", "Visakhapatnam", "Tirupati", "Guntur"],
    color: "#138808",
  },
]

export default function GeographicReach() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"])

  return (
    <section
      ref={ref}
      className="relative section-padding text-white overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0f1923 0%, #0d2210 100%)" }}
    >
      {/* Animated parallax orbs */}
      <motion.div
        style={{ y: bgY }}
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ y: bgY, background: "radial-gradient(circle, rgba(255,153,51,0.1) 0%, transparent 65%)" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]), background: "radial-gradient(circle, rgba(19,136,8,0.1) 0%, transparent 65%)" }}
      />
      {/* Dot grid overlay */}
      <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />

      <motion.div style={{ y: textY }} className="relative max-w-6xl mx-auto z-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-14"
        >
          <p className="section-label mb-3" style={{ color: "#FF9933" }}>Geographic Reach</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-balance">
            2 States.{" "}
            <span style={{ color: "#FF9933" }}>One</span>{" "}
            <span style={{ color: "#4ade80" }}>Mission.</span>
          </h2>
          <p className="text-white/55 mt-3 max-w-lg mx-auto leading-relaxed text-sm">
            Operational across Telangana and Andhra Pradesh — bringing future-ready AI education to both urban centres and remote village schools.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto"
        >
          {states.map((state) => (
            <motion.div
              key={state.name}
              variants={cardItem}
              whileHover={{
                y: -10,
                scale: 1.02,
                boxShadow: `0 32px 64px -16px ${state.color}30`,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              className="rounded-2xl p-7 border flex flex-col gap-6 backdrop-blur-sm cursor-default"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderColor: `${state.color}35`,
              }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 20 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${state.color}22` }}
                >
                  <MapPin size={18} style={{ color: state.color }} />
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg text-white">{state.name}</h3>
                  <p className="text-xs text-white/45 mt-0.5">{state.focus}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Building2, value: state.campuses, label: "Campuses" },
                  { icon: School,    value: state.schools,  label: "Schools"  },
                ].map(({ icon: Icon, value, label }) => (
                  <motion.div
                    key={label}
                    whileHover={{ scale: 1.05 }}
                    className="rounded-xl p-4 flex items-center gap-3"
                    style={{ backgroundColor: `${state.color}18` }}
                  >
                    <Icon size={14} style={{ color: state.color }} />
                    <div>
                      <p className="text-xl font-extrabold text-white tabular-nums">{value}</p>
                      <p className="text-xs text-white/50">{label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {state.highlights.map((h, j) => (
                  <motion.span
                    key={h}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.4 + j * 0.06 }}
                    className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5"
                    style={{ backgroundColor: `${state.color}18`, color: state.color }}
                  >
                    <Circle size={5} fill="currentColor" />
                    {h}
                  </motion.span>
                ))}
              </div>

              <div
                className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full w-fit"
                style={{ backgroundColor: `${state.color}20`, color: state.color }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: state.color }}
                />
                Operational
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
