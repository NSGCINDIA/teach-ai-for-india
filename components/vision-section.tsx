"use client"

import { useRef } from "react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"

export default function VisionSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.96])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  return (
    <section ref={ref} className="section-padding bg-white overflow-hidden">
      <motion.div
        style={{ scale, opacity }}
        className="max-w-3xl mx-auto text-center"
      >
        {/* Animated quote mark */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 0.3, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-[6rem] font-serif leading-none mb-2 select-none"
          style={{ color: "#FF9933" }}
          aria-hidden="true"
        >
          &ldquo;
        </motion.div>

        <blockquote>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="text-2xl md:text-3xl lg:text-[2.4rem] font-bold text-foreground text-balance leading-snug"
          >
            Every student should learn AI
            <br className="hidden md:block" />
            {" "}and use it{" "}
            <motion.span
              initial={{ color: "#111" }}
              animate={inView ? { color: "#138808" } : {}}
              transition={{ duration: 1.2, delay: 0.5 }}
            >
              responsibly.
            </motion.span>
          </motion.p>

          <motion.footer
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-8 flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="h-[1.5px] w-10 origin-right rounded-full"
                style={{ backgroundColor: "#FF9933" }}
              />
              <p className="section-label text-muted-foreground">Our Shared Vision</p>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="h-[1.5px] w-10 origin-left rounded-full"
                style={{ backgroundColor: "#138808" }}
              />
            </div>
          </motion.footer>
        </blockquote>
      </motion.div>
    </section>
  )
}
