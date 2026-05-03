"use client"

import { useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, TrendingUp } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { fadeUp, staggerContainer, cardItem } from "@/lib/motion"

const trustStats = [
  { value: "1,820+", label: "Students" },
  { value: "8+",     label: "Campuses" },
  { value: "2",      label: "States" },
  { value: "41",     label: "Schools" },
]

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] })

  // Parallax layers
  const orb1Y  = useTransform(scrollYProgress, [0, 1], ["0%", "35%"])
  const orb2Y  = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"])
  const textY  = useTransform(scrollYProgress, [0, 1], ["0%", "18%"])
  const opacityOut = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-[68px]"
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />

      {/* Saffron orb */}
      <motion.div
        style={{ y: orb1Y }}
        className="absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full pointer-events-none orb-pulse"
        style={{ y: orb1Y, background: "radial-gradient(circle, rgba(255,153,51,0.18) 0%, transparent 70%)" }}
      />
      {/* Green orb */}
      <motion.div
        style={{ y: orb2Y }}
        className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ y: orb2Y, background: "radial-gradient(circle, rgba(19,136,8,0.14) 0%, transparent 70%)" }}
      />

      {/* India stripe */}
      <div className="absolute top-[68px] left-0 right-0 h-[2.5px] india-stripe opacity-80" />

      {/* ── Content ── */}
      <motion.div
        style={{ y: textY, opacity: opacityOut }}
        className="relative max-w-5xl mx-auto px-5 md:px-10 text-center py-28 z-10"
      >
        {/* Live badge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-white/90 backdrop-blur-sm shadow-sm text-xs font-semibold text-foreground mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "#138808" }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "#138808" }} />
          </span>
          Live Across 8 Campuses in Telangana &amp; Andhra Pradesh
        </motion.div>

        {/* Logo lockup — large and proud */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.03, rotateX: 2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Teach_Ai_1_page-0001-removebg-preview-ZJzf3R1J38t7BLntCYEUuQMl2LbJdV.png"
              alt="Teach AI For India — NIAT Student General Council"
              width={380}
              height={148}
              className="object-contain drop-shadow-lg"
              priority
            />
          </motion.div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.18 }}
          className="text-[2.2rem] md:text-5xl lg:text-[3.8rem] font-extrabold tracking-tight text-foreground text-balance leading-[1.08] mb-5"
        >
          {"Building India's First "}
          <span className="text-gradient-india">Student-Led</span>
          {" AI Education "}
          <span style={{ color: "#138808" }}>Movement</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.26 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-pretty"
        >
          Scaling AI literacy across government schools through campus-led execution, structured learning, and real community impact.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.34 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-16"
        >
          <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              asChild
              className="text-white font-semibold px-9 rounded-2xl shadow-md hover:shadow-lg transition-all h-12 text-base glow-saffron"
              style={{ backgroundColor: "#FF9933" }}
            >
              <Link href="#access">
                Get Started <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="font-semibold px-9 rounded-2xl h-12 text-base hover:bg-muted"
            >
              <Link href="#impact">
                View Impact <TrendingUp size={16} className="ml-2" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          transition={{ delayChildren: 0.45 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {trustStats.map((item, i) => (
            <motion.div
              key={item.label}
              variants={cardItem}
              whileHover={{ y: -4, scale: 1.05 }}
              className="flex flex-col items-center gap-1 bg-white/80 backdrop-blur-sm border border-border rounded-2xl px-7 py-4 shadow-sm"
            >
              <span className="text-2xl font-extrabold text-foreground leading-none tabular-nums">{item.value}</span>
              <span className="text-[11px] text-muted-foreground uppercase tracking-widest">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity: opacityOut }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
      >
        <span className="text-[11px] text-muted-foreground uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
          className="w-[1.5px] h-6 rounded-full"
          style={{ background: "linear-gradient(to bottom, #FF9933, #138808)" }}
        />
      </motion.div>
    </section>
  )
}
