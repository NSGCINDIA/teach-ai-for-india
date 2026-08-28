import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface PageHeaderStat {
  label: string
  value: string | number
  /** Rendered under the value — a trend, a share, a deadline. */
  hint?: string
  /** Tints the value. `attention` is for counts the user should act on. */
  tone?: 'default' | 'brand' | 'attention' | 'success'
  /**
   * Makes the number a link — for a count the user can act on, pointing at the
   * filtered view of exactly those records.
   *
   * A link rather than an `onClick` on purpose: this component is rendered by
   * ~44 server-component pages, and an event handler would force `'use client'`
   * on every one of them. A URL also survives a refresh and can be shared.
   */
  href?: string
  /** Accessible name for that link — a generic component can't word it well. */
  hrefLabel?: string
}

interface PageHeaderProps {
  /** Short context line above the title. Sentence case — this is not a label chip. */
  eyebrow?: string
  title: string
  /** ReactNode, not string — most pages interpolate a campus or period into it. */
  description?: React.ReactNode
  icon?: LucideIcon
  /** Buttons / links, right-aligned on desktop and full-width-wrapped on mobile. */
  actions?: React.ReactNode
  /** Open metric row under the rule. Deliberately card-less — see note below. */
  stats?: PageHeaderStat[]
  className?: string
}

const STAT_TONE: Record<NonNullable<PageHeaderStat['tone']>, string> = {
  default: 'text-foreground',
  brand: 'text-brand',
  attention: 'text-brand-orange',
  success: 'text-success',
}

/**
 * PageHeader — the single title treatment for every dashboard and admin screen.
 *
 * Before this, ~44 pages each hand-rolled `<header><h1 class="font-display
 * text-2xl …">`, so the one element that establishes "where am I" was the least
 * consistent thing in the product. Consolidating it also fixes the left edge:
 * the icon plate is fixed-width and the title block starts at the same x on
 * every page, which is what makes the shell read as one application.
 *
 * The stats row is intentionally *not* cards. Cards are how this design system
 * signals "this is a group you can act on"; a page's own summary numbers are
 * context, so they sit openly on the page background separated by hairlines.
 * MetricCard stays for the dashboard hero, where the numbers *are* the content.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
  stats,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('space-y-5', className)}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="flex min-w-0 items-start gap-4">
          {Icon && (
            <span
              aria-hidden
              className="mt-0.5 hidden size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand/10 to-brand-orange/10 text-brand ring-1 ring-brand/15 sm:grid"
            >
              <Icon className="size-5" strokeWidth={2} />
            </span>
          )}

          <div className="min-w-0">
            {eyebrow && (
              <p className="mb-1 text-xs font-bold tracking-wide text-brand-orange">{eyebrow}</p>
            )}
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground text-balance md:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1.5 max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground md:text-base">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {stats && stats.length > 0 && (
        <dl className="flex flex-wrap items-stretch gap-x-8 gap-y-4 border-t border-border/60 pt-4">
          {stats.map((stat) => (
            <div key={stat.label} className={cn('group min-w-24', stat.href && 'relative')}>
              <dt className="text-xs font-semibold text-muted-foreground">{stat.label}</dt>
              <dd
                className={cn(
                  'mt-0.5 text-2xl font-bold leading-none tabular-nums',
                  STAT_TONE[stat.tone ?? 'default'],
                  stat.href && 'underline-offset-4 decoration-2 group-hover:underline',
                )}
              >
                {stat.value}
              </dd>
              {stat.hint && (
                <p className="mt-1 text-xs font-medium text-text-tertiary">{stat.hint}</p>
              )}
              {/* A stretched overlay rather than wrapping the block: `dl` only
                  admits `dt`, `dd` and `div` as children, so an anchor around
                  them would be invalid markup. The overlay also makes the whole
                  stat — label, number and hint — one comfortable hit target. */}
              {stat.href && (
                <Link
                  href={stat.href}
                  aria-label={stat.hrefLabel ?? stat.label}
                  className="absolute -inset-2 rounded-lg transition-colors hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                />
              )}
            </div>
          ))}
        </dl>
      )}
    </header>
  )
}
