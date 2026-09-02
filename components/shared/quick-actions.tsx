import Link from 'next/link'
import { type LucideIcon, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickAction {
  label: string
  description?: string
  href: string
  icon: LucideIcon
  variant?: 'default' | 'highlight'
}

interface QuickActionsProps {
  title?: string
  description?: string
  actions: QuickAction[]
  columns?: 2 | 3 | 4
  className?: string
}

/**
 * QuickActions — the "what do you want to do?" block.
 *
 * Written as verbs the user recognises ("Add school", "Record visit") rather
 * than the screens they happen to live on, so the block reads as a set of tasks
 * instead of a second navigation menu.
 */
export function QuickActions({
  title = 'What do you want to do?',
  description,
  actions,
  columns = 3,
  className,
}: QuickActionsProps) {
  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={className}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h2 className="text-lg font-bold text-foreground">{title}</h2>}
          {description && (
            <p className="mt-1 text-sm font-medium text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <div className={cn('grid gap-3', gridCols[columns])}>
        {actions.map((action) => (
          <QuickActionCard key={action.href + action.label} {...action} />
        ))}
      </div>
    </div>
  )
}

/**
 * One task card. The hover is a colour change and a 4px arrow slide — no scale
 * transform. A grid of cards that each jump forward under the cursor makes the
 * whole block feel unsettled, and this is a screen people sit in front of.
 */
function QuickActionCard({ label, description, href, icon: Icon, variant = 'default' }: QuickAction) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex items-start gap-3.5 rounded-xl border p-4 transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        variant === 'highlight'
          ? 'border-brand/20 bg-cream-light hover:border-brand/40 hover:bg-secondary'
          : 'border-border/60 bg-card hover:border-brand/30 hover:bg-cream-light/60',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'grid size-10 shrink-0 place-items-center rounded-lg transition-colors',
          variant === 'highlight'
            ? 'bg-brand text-white'
            : 'bg-cream-light text-ink-orange group-hover:bg-brand/10 group-hover:text-brand',
        )}
      >
        <Icon className="size-5" strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-bold text-foreground transition-colors group-hover:text-brand">
            {label}
          </h3>
          <ArrowRight
            aria-hidden
            className="size-4 shrink-0 text-text-tertiary transition-all group-hover:translate-x-0.5 group-hover:text-brand"
          />
        </div>
        {description && (
          <p className="mt-0.5 line-clamp-2 text-xs font-medium leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </Link>
  )
}

/**
 * Compact Quick Action Button (for toolbars/headers)
 */
interface CompactQuickActionProps {
  label: string
  href: string
  icon: LucideIcon
  className?: string
}

export function CompactQuickAction({ label, href, icon: Icon, className }: CompactQuickActionProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-border/70 bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-brand/30 hover:bg-cream-light hover:text-brand',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50',
        className,
      )}
    >
      <Icon aria-hidden className="size-4" />
      {label}
    </Link>
  )
}
