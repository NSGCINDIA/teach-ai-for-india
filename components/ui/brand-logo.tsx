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
    sm: 'text-sm font-bold tracking-tight',
    md: 'text-lg font-extrabold tracking-tight',
    lg: 'text-xl sm:text-2xl font-extrabold tracking-tight',
    xl: 'text-2xl sm:text-3xl font-black tracking-tight',
    '2xl': 'text-3xl sm:text-4xl font-black tracking-tight',
  }[size]

  return (
    <span className={`inline-flex items-center font-display select-none ${sizeClasses} ${className}`}>
      <span className="text-[#881337] dark:text-rose-400">TEACH</span>
      <span className="text-[#800000] dark:text-[#a00000] font-black">AI</span>
      <span className={lightOnly ? 'text-slate-900' : 'text-slate-900 dark:text-slate-100'}>FORINDIA</span>
    </span>
  )
}
