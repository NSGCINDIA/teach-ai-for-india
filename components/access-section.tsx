"use client"

import { useRef } from "react"
import Link from "next/link"
import { LayoutDashboard, ShieldCheck, ArrowRight, Zap, BarChart3 } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { fadeUp, slideLeft, slideRight } from "@/lib/motion"

export default function AccessSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="access" ref={ref} className="section-padding overflow-hidden" style={{ backgroundColor: "#f7f7f7" }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-14"
        >
          <p className="section-label mb-3" style={{ color: "#FF9933" }}>Platform Access</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">Your Gateway to the Platform</h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed text-sm">
            Two portals built for two roles — campus teams and platform administrators.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Team Dashboard card */}
          <motion.div
            variants={slideLeft}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            whileHover={{
              y: -14,
              scale: 1.02,
              boxShadow: "0 32px 64px -16px rgba(255,153,51,0.25)",
              transition: { type: "spring", stiffness: 280, damping: 18 },
            }}
            className="rounded-2xl border border-border bg-white p-8 flex flex-col gap-5 cursor-default"
          >
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="w-13 h-13 rounded-2xl flex items-center justify-center w-[52px] h-[52px]"
              style={{ backgroundColor: "#FF993318" }}
            >
              <LayoutDashboard size={24} style={{ color: "#FF9933" }} />
            </motion.div>

            <div>
              <h3 className="font-bold text-xl text-foreground mb-2">Team Dashboard</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Submit session data in under 60 seconds. Log attendance, track your campus progress, and keep your cluster on schedule.
              </p>
            </div>

            <ul className="space-y-2.5 text-sm">
              {[
                { icon: Zap,       text: "Submit session data in under 60 seconds" },
                { icon: BarChart3, text: "Track your campus performance live" },
              ].map(({ icon: Icon, text }, i) => (
                <motion.li
                  key={text}
                  initial={{ opacity: 0, x: -12 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-2.5 text-muted-foreground"
                >
                  <Icon size={13} style={{ color: "#FF9933" }} className="shrink-0" />
                  {text}
                </motion.li>
              ))}
            </ul>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="mt-auto">
              <Button
                asChild
                className="w-full rounded-xl font-semibold text-white hover:opacity-90 transition-all h-11 glow-saffron"
                style={{ backgroundColor: "#FF9933" }}
              >
                <Link href="/login">
                  Login <ArrowRight size={14} className="ml-1.5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Admin Panel card */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            whileHover={{
              y: -14,
              scale: 1.02,
              boxShadow: "0 32px 64px -16px rgba(19,136,8,0.30)",
              transition: { type: "spring", stiffness: 280, damping: 18 },
            }}
            className="rounded-2xl p-8 flex flex-col gap-5 text-white cursor-default"
            style={{ background: "linear-gradient(145deg, #138808, #0b5c07)" }}
          >
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="w-[52px] h-[52px] rounded-2xl bg-white/15 flex items-center justify-center"
            >
              <ShieldCheck size={24} className="text-white" />
            </motion.div>

            <div>
              <h3 className="font-bold text-xl text-white mb-2">Admin Panel</h3>
              <p className="text-sm text-white/65 leading-relaxed">
                Track impact across all campuses in real time. Review session data, manage teams, and see aggregate numbers across all 9 campuses at once.
              </p>
            </div>

            <ul className="space-y-2.5 text-sm">
              {[
                { icon: BarChart3, text: "Real-time impact across all campuses" },
                { icon: Zap,       text: "Manage teams, sessions, and clusters" },
              ].map(({ icon: Icon, text }, i) => (
                <motion.li
                  key={text}
                  initial={{ opacity: 0, x: 12 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-2.5 text-white/70"
                >
                  <Icon size={13} className="text-white/55 shrink-0" />
                  {text}
                </motion.li>
              ))}
            </ul>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="mt-auto">
              <Button
                asChild
                variant="outline"
                className="w-full rounded-xl font-semibold bg-white/10 text-white border-white/25 hover:bg-white/20 transition-colors h-11"
              >
                <Link href="/admin-login">
                  Admin Access <ArrowRight size={14} className="ml-1.5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
