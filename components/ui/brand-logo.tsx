import React from 'react'

interface BrandLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  lightOnly?: boolean
}

/**
 * BrandLogo — TAI wordmark with warm brand palette.
 * TEACH (maroon) + AI (deep maroon, heavier weight) + FORINDIA (charcoal)
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
      <span className="text-[#A81822]">TEACH</span>
      <span className="text-[#7A0E17] font-black">AI</span>
      <span className={lightOnly ? 'text-[#2B1810]' : 'text-[#2B1810]'}>FORINDIA</span>
    </span>
  )
}
