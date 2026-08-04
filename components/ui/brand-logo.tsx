import React from 'react'

interface BrandLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  lightOnly?: boolean
}

/**
 * Global Brand Logo Component
 * Renders TEACHAIFORINDIA text logo with exact brand styling:
 * - TEACH in primary brand color
 * - AI in maroon (#800000)
 * - FORINDIA in standard primary text color
 */
export function BrandLogo({ className = '', size = 'md', lightOnly = false }: BrandLogoProps) {
  const sizeClasses = {
    sm: 'text-xs sm:text-sm font-bold tracking-tight',
    md: 'text-sm sm:text-base font-extrabold tracking-tight',
    lg: 'text-base sm:text-lg font-extrabold tracking-tight',
    xl: 'text-lg sm:text-xl font-black tracking-tight',
    '2xl': 'text-xl sm:text-2xl font-black tracking-tight',
  }[size]

  return (
    <span className={`inline-flex items-center font-display select-none ${sizeClasses} ${className}`}>
      <span className="text-[#881337] dark:text-rose-400">TEACH</span>
      <span className="text-[#800000] dark:text-[#a00000] font-black">AI</span>
      <span className={lightOnly ? 'text-slate-900' : 'text-slate-900 dark:text-slate-100'}>FORINDIA</span>
    </span>
  )
}
