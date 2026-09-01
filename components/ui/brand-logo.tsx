import React from 'react'

interface BrandLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  lightOnly?: boolean
}

/**
 * BrandLogo — TAI wordmark with warm brand palette.
 * TEACH (maroon) + AI (deep maroon, heavier weight) + FORINDIA (charcoal).
 *
 * `lightOnly` swaps that whole scheme for white: every colour above sits in
 * the 1.4-2.1:1 range against a dark surface, so on one the wordmark simply
 * cannot use its normal ink. The three segments stay differentiated by weight
 * only (already true of AI, which was always heavier) rather than by hue,
 * since a second colour tuned for a dark background isn't safe on every dark
 * background a future caller might use — plain white at full or 85% opacity is.
 */
export function BrandLogo({ className = '', size = 'md', lightOnly = false }: BrandLogoProps) {
  const sizeClasses = {
    sm:  'text-xs sm:text-sm  font-bold   tracking-tight',
    md:  'text-sm sm:text-base font-extrabold tracking-tight',
    lg:  'text-base sm:text-lg font-extrabold tracking-tight',
    xl:  'text-lg sm:text-xl  font-black  tracking-tight',
    '2xl': 'text-xl sm:text-2xl font-black  tracking-tight',
  }[size]

  return (
    <span
      className={`inline-flex items-center select-none ${sizeClasses} ${className}`}
      aria-label="Teach AI For India"
    >
      <span className={lightOnly ? 'text-white' : 'text-[#A81822]'}>TEACH</span>
      <span className={lightOnly ? 'text-white font-black' : 'text-[#7A0E17] font-black'}>AI</span>
      <span className={lightOnly ? 'text-white/85' : 'text-[#2B1810]'}>FORINDIA</span>
    </span>
  )
}
