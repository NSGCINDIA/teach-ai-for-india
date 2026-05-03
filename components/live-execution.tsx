"use client"

import { useRef } from "react"
import { Activity, Users, BookOpen, Wifi, Clock } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { staggerContainer, cardItem, fadeUp, slideLeft } from "@/lib/motion"

const activities = [
  { campus: "MRV Campus",  event: "2 sessions completed this week",  students: 84,  status: "Live",    icon: BookOpen, time: "2 hrs ago"  },
  { campus: "CDU",         event: "1 outreach session completed",     students: 40,  status: "Live",    icon: Users,    time: "5 hrs ago"  },
  { campus: "Chevella",    event: "120 students impacted",            students: 120, status: "Active",  icon: Activity, time: "Today"      },
  { campus: "Aurora",      event: "AI Awareness session delivered",   students: 65,  status: "Active",  icon: BookOpen, time: "Yesterday"  },
  { campus: "NSRIT",       event: "Prompt Writing workshop held",     students: 90,  status: "Ongoing", icon: Users,    time: "Yesterday"  },
]

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Live:    { bg: "#13880814", text: "#138808", dot: "#138808" },
  Active:  { bg: "#FF993314", text: "#c97a20", dot: "#FF9933" },
  Ongoing: { bg: "#1d7adb14", text: "#1d7adb", dot: "#1d7adb" },
}

export default function LiveExecution() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section ref={ref} className="section-padding-sm bg-white border-t border-border overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10">
          <motion.div variants={slideLeft} initial="hidden" animate={inView ? "show" : "hidden"}>
            <motion.div
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3 text-white"
              style={{ backgroundColor: "#138808" }}
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Wifi size={10} />
              </motion.span>
              Live System
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Real-Time Activity</h2>
            <p className="text-muted-foreground mt-1.5 text-sm">Live student and campus progress across India</p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-4 py-2.5 rounded-xl self-start sm:self-auto"
          >
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#138808" }}
            />
            5 campuses active right now
          </motion.div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3"
        >
          {activities.map((item) => {
            const Icon = item.icon
            const cfg = statusConfig[item.status]
            return (
              <motion.div
                key={item.campus}
                variants={cardItem}
                whileHover={{
                  y: -8,
                  scale: 1.03,
                  boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12)",
                  transition: { type: "spring", stiffness: 350, damping: 20 },
                }}
                className="rounded-2xl border border-border bg-white p-5 flex flex-col gap-3 cursor-default"
              >
                <div className="flex items-start justify-between gap-2">
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ type: "spring" }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: cfg.bg }}
                  >
                    <Icon size={15} style={{ color: cfg.text }} />
                  </motion.div>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ backgroundColor: cfg.bg, color: cfg.text }}
                  >
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: cfg.dot }}
                    />
                    {item.status}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{item.campus}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.event}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border mt-auto">
                  <span className="flex items-center gap-1"><Users size={10} />{item.students} students</span>
                  <span className="flex items-center gap-1"><Clock size={10} />{item.time}</span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
