'use client'

import { cn } from '@/lib/utils'

export interface FilterChipOption<T extends string> {
  value: T
  label: string
  count: number
}

interface FilterChipsProps<T extends string> {
  /** Accessible name for the whole group, e.g. "Filter by pipeline stage". */
  label: string
  options: FilterChipOption<T>[]
  /** `''` means "no filter" and renders the leading All chip as selected. */
  value: T | ''
  onChange: (value: T | '') => void
  allLabel?: string
  allCount: number
  className?: string
}

/**
 * FilterChips — a status filter you can read at a glance instead of open.
 *
 * A `<select>` hides both the available stages and how many records sit in each
 * one, which is precisely the shape of a pipeline: the distribution *is* the
 * information. Rendering the stages inline turns the filter into a small
 * funnel chart that also happens to be clickable.
 *
 * These are real buttons in a `group`/`aria-pressed` pattern rather than styled
 * checkboxes, so keyboard users tab through them in reading order and each one
 * announces its own pressed state along with its count.
 */
export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
  allLabel = 'All',
  allCount,
  className,
}: FilterChipsProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('flex flex-wrap items-center gap-1.5', className)}
    >
      <FilterChip
        label={allLabel}
        count={allCount}
        selected={value === ''}
        onClick={() => onChange('')}
      />
      {options.map((option) => (
        <FilterChip
          key={option.value}
          label={option.label}
          count={option.count}
          selected={value === option.value}
          onClick={() => onChange(value === option.value ? '' : option.value)}
        />
      ))}
    </div>
  )
}

/**
 * One chip. Exported so a filter on a *different* axis — "Overdue follow-ups"
 * on the schools pipeline — can sit beside a `FilterChips` group and look like
 * it belongs, without being folded into that group's mutually-exclusive
 * single-select model.
 */
export function FilterChip({
  label,
  count,
  selected,
  onClick,
  tone = 'brand',
}: {
  label: string
  count: number
  selected: boolean
  onClick: () => void
  /** `attention` for a chip that surfaces work that is late. */
  tone?: 'brand' | 'attention'
}) {
  // A zero-count stage still *renders* — the gap in the funnel is a finding,
  // not noise — but there is nothing behind it, so clicking it only produced
  // an empty list. It recedes and stops being a target.
  const empty = !selected && count === 0

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={empty}
      aria-pressed={selected}
      className={cn(
        'group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        selected
          ? tone === 'attention'
            ? 'border-transparent bg-brand-orange text-white shadow-sm'
            : 'border-transparent bg-brand text-white shadow-sm'
          : 'border-border/70 bg-card text-muted-foreground',
        !selected && !empty && 'hover:border-brand/40 hover:bg-cream-light hover:text-brand',
        empty && 'cursor-default opacity-60',
      )}
    >
      {label}
      <span
        className={cn(
          'rounded-full px-1.5 py-px text-[11px] font-bold tabular-nums transition-colors',
          selected
            ? 'bg-white/20 text-white'
            : cn('bg-cream-light text-text-tertiary', !empty && 'group-hover:bg-brand/10 group-hover:text-brand'),
        )}
      >
        {count}
      </span>
    </button>
  )
}
