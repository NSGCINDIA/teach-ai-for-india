'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface DataToolbarProps {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  /** Accessible name for the search box — every list says what it searches. */
  label: string
  /** Filter controls (NativeSelect, toggles). Wrapped so they wrap sanely on mobile. */
  children?: React.ReactNode
  /** e.g. "12 of 48 schools" — the honest answer to "did my filter do anything?" */
  summary?: React.ReactNode
  /** Shown only while something is filtered; clears every control at once. */
  onReset?: () => void
  isFiltered?: boolean
  className?: string
}

/**
 * DataToolbar — the search + filter row above every list in the product.
 *
 * It sits on the warm secondary surface rather than in a card: the card below it
 * holds the records, and stacking two bordered boxes made the controls read as a
 * second dataset. The result summary lives inside the same surface so the count
 * is attached to the controls that produced it instead of floating as loose text.
 */
export function DataToolbar({
  value,
  onValueChange,
  placeholder,
  label,
  children,
  summary,
  onReset,
  isFiltered = false,
  className,
}: DataToolbarProps) {
  return (
    <div className={cn('rounded-xl border border-border/60 bg-cream-light/60 p-3', className)}>
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Capped, not `flex-1` alone: on a list whose other filters are hidden
            (a campus-scoped user sees no campus select) the field had nothing to
            share the row with and stretched the full page width, which spent
            vertical space the table below it needed for rows. */}
        <div className="relative min-w-52 flex-1 sm:max-w-md">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-tertiary"
          />
          <Input
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={placeholder}
            aria-label={label}
            className="pl-10"
          />
        </div>
        {children}
      </div>

      {(summary || (isFiltered && onReset)) && (
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1">
          {summary && <p className="text-xs font-semibold text-muted-foreground">{summary}</p>}
          {isFiltered && onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-bold text-brand transition-colors hover:bg-brand/10 hover:text-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            >
              <X className="size-3" aria-hidden />
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
