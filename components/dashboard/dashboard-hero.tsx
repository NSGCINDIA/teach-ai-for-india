import { NeuralNetworkBackground } from '@/components/shared/neural-network-background'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface HeroMetric {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: number
}

interface DashboardHeroProps {
  greeting: string
  userName: string
  role: string
  impact?: HeroMetric[]
  className?: string
}

/**
 * DashboardHero — the one identity moment on a dashboard screen.
 *
 * The impact numbers sit directly on the hero surface, divided by hairlines,
 * rather than in four nested cards. A card inside a card is the clearest signal
 * that a layout has stopped making decisions: the hero is already a container,
 * so the numbers only need separating, not re-boxing. Openly-set figures also
 * let them run much larger, which is the actual brief — impact first.
 */
export function DashboardHero({ greeting, userName, role, impact, className }: DashboardHeroProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-brand/12 bg-cream-light',
        className,
      )}
    >
      <NeuralNetworkBackground variant="subtle" />

      <div className="relative px-6 py-8 md:px-9 md:py-10">
        <p className="text-xs font-bold tracking-wide text-brand-orange">{role}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {greeting}, {userName} <span aria-hidden>👋</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-muted-foreground md:text-base">
          Here&rsquo;s the impact you&rsquo;re creating across Teach AI For India.
        </p>

        {impact && impact.length > 0 && (
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-brand/12 pt-6 lg:grid-cols-4 lg:gap-x-0">
            {impact.map((metric, i) => (
              <div
                key={metric.label}
                className={cn(
                  'lg:px-6',
                  // Hairlines between columns only — never a leading rule on the
                  // first item in a row, which would read as a stray mark.
                  i > 0 && 'lg:border-l lg:border-brand/12',
                  i === 0 && 'lg:pl-0',
                )}
              >
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <metric.icon aria-hidden className="size-3.5 shrink-0 text-brand-orange" />
                  <span className="truncate">{metric.label}</span>
                </dt>
                <dd className="mt-1.5 text-3xl font-bold leading-none tracking-tight tabular-nums text-brand-deep md:text-4xl">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  )
}

/**
 * Hero for roles that have no aggregate numbers to show yet — same surface and
 * type scale, so the two never look like different products.
 */
interface SimpleHeroProps {
  greeting: string
  userName: string
  description: string
  role: string
  className?: string
}

export function SimpleHero({ greeting, userName, description, role, className }: SimpleHeroProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-brand/12 bg-cream-light',
        className,
      )}
    >
      <NeuralNetworkBackground variant="subtle" />
      <div className="relative px-6 py-8 md:px-9 md:py-10">
        <p className="text-xs font-bold tracking-wide text-brand-orange">{role}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {greeting}, {userName} <span aria-hidden>👋</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-muted-foreground md:text-base">
          {description}
        </p>
      </div>
    </section>
  )
}

/**
 * Section header for dashboard sections (below hero)
 */
interface SectionHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        <h2 className="text-lg font-bold tracking-tight text-foreground md:text-xl">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm font-medium text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/**
 * "At a Glance" section wrapper for KPIs
 */
export function AtAGlance({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      <h2 className="text-lg font-bold text-foreground">At a glance</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </div>
  )
}
