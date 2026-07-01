"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { staggerContainer, cardItem, fadeUp } from "@/lib/motion"

const links = [
  { label: "Impact",   href: "/#impact" },
  { label: "Program",  href: "/#program" },
  { label: "Campuses", href: "/#campuses" },
  { label: "Login",    href: "/login" },
  { label: "Gallery",  href: "/gallery" },
  { label: "Contact",  href: "/contact" },
]

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white overflow-hidden">
      {/* India stripe top */}
      <div className="h-[3px] india-stripe w-full" />

      <div className="max-w-6xl mx-auto px-5 md:px-10 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center md:items-start gap-2"
          >
            <motion.div whileHover={{ scale: 1.04 }} transition={{ type: "spring", stiffness: 400 }}>
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Teach_Ai_1_page-0001-removebg-preview-ZJzf3R1J38t7BLntCYEUuQMl2LbJdV.png"
                alt="Teach AI For India"
                width={150}
                height={58}
                className="object-contain"
              />
            </motion.div>
            <p className="text-xs text-muted-foreground">Built by NIAT Students. Powered by purpose.</p>
          </motion.div>

          {/* Nav links */}
          <motion.nav
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            {links.map((link) => (
              <motion.div key={link.label} variants={cardItem}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {link.label}
                  <span
                    className="absolute -bottom-0.5 left-0 right-0 h-[1px] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full"
                    style={{ backgroundColor: "#FF9933" }}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.nav>
        </div>

        {/* Bottom bar */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Teach AI For India. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {["#FF9933", "#e5e7eb", "#138808"].map((color, i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.4, ease: "easeInOut", type: "tween" }}
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
