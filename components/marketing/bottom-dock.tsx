'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export function BottomDock() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Smoothly hide dock when user reaches the bottom to prevent covering the static footer
      if (scrollPosition + windowHeight >= documentHeight - 160) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Trigger initial check
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  const isActive = (href: string) => pathname === href

  const links = [
    { href: '/about', label: 'ABOUT' },
    { href: '/impact', label: 'IMPACT' },
    { href: '/campuses', label: 'CAMPUSES' },
    { href: '/stories', label: 'STORIES' },
  ]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, x: '-50%', opacity: 0 }}
          animate={{ y: 0, x: '-50%', opacity: 1 }}
          exit={{ y: 80, x: '-50%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 260 }}
          className="fixed bottom-6 left-1/2 z-50 w-[92%] max-w-[500px] bg-[#0f0f11]/90 dark:bg-slate-900/90 border border-white/10 dark:border-white/5 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.35)] rounded-full py-2 px-3.5 flex items-center justify-between gap-4 pointer-events-auto"
        >
          {/* Logo Brand - Displaying the full stylized 3D logo, cropped to exclude the top NIAT header */}
          <Link href="/" className="flex items-center shrink-0 group">
            <div className="relative h-10 w-28 overflow-hidden rounded-lg shrink-0">
              <img 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Teach_Ai_1_page-0001-removebg-preview-ZJzf3R1J38t7BLntCYEUuQMl2LbJdV.png" 
                alt="Teach AI for India Logo" 
                className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 max-w-none" 
                style={{ width: '120px', height: 'auto' }}
              />
            </div>
          </Link>

          {/* Central links */}
          <div className="flex items-center gap-3 md:gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[9px] md:text-[10px] font-extrabold tracking-wider transition-colors hover:text-white",
                  isActive(link.href) ? "text-brand" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Action button */}
          <Link 
            href="/contact"
            className="rounded-full bg-white text-[#0f0f11] hover:bg-white/90 transition-colors px-3.5 py-1.5 text-[9px] md:text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap"
          >
            LET'S TALK
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
