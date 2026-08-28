import { cn } from '@/lib/utils'

/**
 * Warm palette pairs for monogram fills. Every pair is drawn from the TAI brand
 * ramp and every one carries white text at >= 4.5:1, so picking by hash can
 * never land on an inaccessible combination — the variation is decorative only
 * and the initials stay legible whichever one comes up.
 */
const FILLS = [
  'from-brand-deep to-brand',
  'from-brand to-brand-orange',
  'from-brand-orange to-brand-gold',
  'from-brand-deep to-brand-orange',
  'from-[#8B4A2B] to-brand-orange',
  'from-brand to-[#C2410C]',
] as const

const SIZES = {
  sm: 'size-8 text-[11px] rounded-lg',
  md: 'size-10 text-xs rounded-xl',
  lg: 'size-12 text-sm rounded-xl',
} as const

/** Stable across renders and servers — `Math.random` would flip fills on every hydration. */
function hashIndex(seed: string, buckets: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return Math.abs(h) % buckets
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

interface EntityMonogramProps {
  name: string
  size?: keyof typeof SIZES
  className?: string
}

/**
 * EntityMonogram — the identity mark for a school, campus, or person in a list.
 *
 * Rows of pure text read as a spreadsheet; a colour-varied plate at the start of
 * each row gives the eye something to scan by and makes the primary entity
 * unmistakably the primary column. Purely decorative, so it is hidden from the
 * accessibility tree — the row's name text right beside it is the real label.
 */
export function EntityMonogram({ name, size = 'md', className }: EntityMonogramProps) {
  const fill = FILLS[hashIndex(name, FILLS.length)]

  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center bg-gradient-to-br font-bold text-white shadow-sm',
        fill,
        SIZES[size],
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  )
}
