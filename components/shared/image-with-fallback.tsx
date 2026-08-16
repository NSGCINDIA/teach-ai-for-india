'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageOff, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NeuralDecoration } from './neural-network-background'

type AspectRatio = '16:9' | '1:1' | '4:3' | '3:2' | '21:9'

interface ImageWithFallbackProps {
  src: string | null | undefined
  alt: string
  aspectRatio?: AspectRatio
  className?: string
  priority?: boolean
  fallbackType?: 'logo' | 'placeholder'
  sizes?: string
}

const aspectRatioClasses: Record<AspectRatio, string> = {
  '16:9': 'aspect-[16/9]',
  '1:1': 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '3:2': 'aspect-[3/2]',
  '21:9': 'aspect-[21/9]',
}

/**
 * Universal image component with TAI-branded loading and fallback states
 * - Loading: Warm skeleton with shimmer
 * - Loaded: Standard Next.js Image
 * - Error: TAI-branded fallback graphic
 * - No Image: Warm placeholder with icon
 */
export function ImageWithFallback({
  src,
  alt,
  aspectRatio = '16:9',
  className = '',
  priority = false,
  fallbackType = 'placeholder',
  sizes,
}: ImageWithFallbackProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // No src provided - show branded placeholder
  if (!src) {
    return (
      <div
        className={cn(
          'relative overflow-hidden bg-gradient-to-br from-cream-light to-cream-warm',
          aspectRatioClasses[aspectRatio],
          className
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {fallbackType === 'logo' ? (
            <NeuralDecoration className="w-20 h-20" />
          ) : (
            <ImageIcon className="w-12 h-12 text-text-tertiary/40" strokeWidth={1.5} />
          )}
        </div>
      </div>
    )
  }

  // Error state - show TAI-branded fallback
  if (error) {
    return (
      <div
        className={cn(
          'relative overflow-hidden bg-gradient-to-br from-cream-light via-cream-warm to-secondary/30',
          aspectRatioClasses[aspectRatio],
          className
        )}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
          <div className="relative w-16 h-16">
            <NeuralDecoration className="w-full h-full" />
          </div>
          <span className="text-xs text-text-secondary/60 text-center font-medium">
            Image unavailable
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-cream-light',
        aspectRatioClasses[aspectRatio],
        className
      )}
    >
      {/* Loading skeleton with warm shimmer */}
      {loading && (
        <div className="absolute inset-0 shimmer bg-gradient-to-br from-cream-light to-cream-warm" />
      )}

      {/* Actual image */}
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          'object-cover transition-opacity duration-300',
          loading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false)
          setError(true)
        }}
        priority={priority}
        sizes={sizes}
      />
    </div>
  )
}

/**
 * Avatar variant with rounded styling
 */
interface AvatarImageProps {
  src: string | null | undefined
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const avatarSizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
}

export function AvatarImage({ src, alt, size = 'md', className = '' }: AvatarImageProps) {
  const [error, setError] = useState(false)
  const safeAlt = alt || 'User'
  const initials = safeAlt
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  if (!src || error) {
    return (
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-brand-orange to-brand-gold flex items-center justify-center text-white font-semibold',
          avatarSizes[size],
          className
        )}
      >
        <span className={size === 'sm' ? 'text-xs' : size === 'lg' || size === 'xl' ? 'text-base' : 'text-sm'}>
          {initials}
        </span>
      </div>
    )
  }

  return (
    <div className={cn('relative rounded-full overflow-hidden', avatarSizes[size], className)}>
      <Image
        src={src}
        alt={alt || 'Avatar'}
        fill
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  )
}

/**
 * Thumbnail variant for lists and grids
 */
interface ThumbnailImageProps {
  src: string | null | undefined
  alt: string
  aspectRatio?: AspectRatio
  className?: string
}

export function ThumbnailImage({ src, alt, aspectRatio = '16:9', className = '' }: ThumbnailImageProps) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      aspectRatio={aspectRatio}
      className={cn('rounded-lg', className)}
      fallbackType="logo"
    />
  )
}
