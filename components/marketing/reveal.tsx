'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  className?: string
  /** Stagger delay in seconds. */
  delay?: number
  /** Initial vertical offset in px. */
  y?: number
}

/**
 * Scroll-triggered entrance wrapper — a single fade-up that fires once when the
 * element enters the viewport. Reduced motion is handled globally by
 * <MotionConfig reducedMotion="user"> so this renders identically on server and
 * client (no hydration mismatch — PRD §12.4).
 */
export function Reveal({ children, className, delay = 0, y = 24 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}
