import { NeuralNetworkBackground } from '@/components/shared/neural-network-background'
import { MetricCard } from '@/components/shared/metric-card'
import { School, Users, CalendarDays, Sparkles, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardHeroProps {
  greeting: string
  userName: string
  role: string
  impact?: {
    label: string
    value: string | number
    icon: LucideIcon
    trend?: number
  }[]
  className?: string
}

/**
 * Dashboard Hero — TAI brand moment with warm welcome and impact visibility.
 * Creates emotional connection and makes the user feel part of the movement.
 */
export function DashboardHero({ 
  greeting, 
  userName, 
  role, 
  impact,
  className 
}: DashboardHeroProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-gradient-to-br from-cream-light via-cream-warm to-secondary/20 border-2 border-brand/10', className)}>
      {/* Neural network background decoration */}
      <NeuralNetworkBackground variant="subtle" />
      
      <div className="relative px-6 py-8 md:px-10 md:py-12 lg:px-12 lg:py-14">
        {/* Greeting Section */}
        <div className="mb-8 space-y-2">
          <p className="text-sm font-semibold text-brand-orange uppercase tracking-wide">
            {role}
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {greeting}, {userName} 👋
          </h1>
          <p className="text-base md:text-lg text-muted-foreground font-medium max-w-2xl">
            Here's the impact you're creating across Teach AI For India
          </p>
        </div>

        {/* Impact Metrics - Only show if provided */}
        {impact && impact.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {impact.map((metric, index) => (
              <MetricCard
                key={index}
                label={metric.label}
                value={metric.value}
                icon={metric.icon}
                trend={metric.trend}
                variant={index === 0 ? 'highlight' : 'default'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Simplified hero for roles without aggregate metrics
 */
interface SimpleHeroProps {
  greeting: string
  userName: string
  description: string
  role: string
  className?: string
}

export function SimpleHero({ 
  greeting, 
  userName, 
  description, 
  role,
  className 
}: SimpleHeroProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-gradient-to-br from-cream-light to-cream-warm border border-brand/10', className)}>
      <NeuralNetworkBackground variant="subtle" />
      
      <div className="relative px-6 py-10 md:px-10 md:py-12">
        <p className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-3">
          {role}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
          {greeting}, {userName} 👋
        </h1>
        <p className="text-base text-muted-foreground font-medium max-w-2xl">
          {description}
        </p>
      </div>
    </div>
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
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground font-medium">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/**
 * "At a Glance" section wrapper for KPIs
 */
interface AtAGlanceProps {
  children: React.ReactNode
  className?: string
}

export function AtAGlance({ children, className }: AtAGlanceProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <h2 className="text-lg font-bold text-foreground">
        At a Glance
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {children}
      </div>
    </div>
  )
}
