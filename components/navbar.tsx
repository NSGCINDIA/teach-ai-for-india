"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Impact", href: "/#impact" },
  { label: "Program", href: "/#program" },
  { label: "Campuses", href: "/#campuses" },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-[0_1px_0_0_#e5e7eb] border-b border-border"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-5 md:px-10 h-[68px] flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 group" aria-label="Teach AI For India home">
          <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Teach_Ai_1_page-0001-removebg-preview-ZJzf3R1J38t7BLntCYEUuQMl2LbJdV.png"
              alt="Teach AI For India"
              width={190}
              height={72}
              className="object-contain h-[52px] w-auto"
              priority
            />
          </motion.div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {navLinks.map((link, i) => (
            <motion.div
              key={link.label}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.5 }}
            >
              <Link
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted relative group"
              >
                {link.label}
                <span className="absolute bottom-1 left-4 right-4 h-[1.5px] bg-saffron scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" style={{ backgroundColor: "#FF9933" }} />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="hidden md:flex items-center gap-2.5 shrink-0"
        >
          <Button variant="ghost" size="sm" asChild className="text-sm font-medium h-9 px-4">
            <Link href="/login">Login</Link>
          </Button>
          <Button
            size="sm"
            asChild
            className="text-white text-sm font-semibold rounded-xl px-5 h-9 hover:opacity-90 transition-all hover:shadow-md active:scale-95"
            style={{ backgroundColor: "#138808" }}
          >
            <Link href="/admin-login">Admin Access</Link>
          </Button>
        </motion.div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={open ? "close" : "open"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </motion.div>
          </AnimatePresence>
        </button>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden bg-white border-t border-border"
          >
            <div className="px-5 pb-5 pt-3 space-y-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="flex gap-2 pt-3 border-t border-border mt-2">
                <Button variant="outline" size="sm" className="flex-1 rounded-xl" asChild>
                  <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
                </Button>
                <Button
                  size="sm"
                  className="flex-1 text-white rounded-xl hover:opacity-90"
                  style={{ backgroundColor: "#138808" }}
                  asChild
                >
                  <Link href="/admin-login" onClick={() => setOpen(false)}>Admin Access</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
