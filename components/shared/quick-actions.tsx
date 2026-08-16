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
 * Quick Actions — Mission-driven, task-oriented CTAs with warm TAI styling.
 * Replaces generic icon+label links with friendly, purposeful interactions.
 */
export function QuickActions({ 
  title = "What Do You Want To Do?",
  description,
  actions, 
  columns = 3,
  className 
}: QuickActionsProps) {
  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={className}>
      {/* Header */}
      {(title || description) && (
        <div className="mb-5">
          {title && (
            <h2 className="text-lg font-bold text-foreground mb-1">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground font-medium">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Actions Grid */}
      <div className={cn('grid gap-3', gridCols[columns])}>
        {actions.map((action, index) => (
          <QuickActionCard key={index} {...action} />
        ))}
      </div>
    </div>
  )
}

/**
 * Individual Quick Action Card
 */
function QuickActionCard({ 
  label, 
  description, 
  href, 
  icon: Icon, 
  variant = 'default' 
}: QuickAction) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
        variant === 'highlight'
          ? 'bg-gradient-to-br from-brand/5 via-brand-orange/5 to-brand-gold/5 border-brand/20 hover:border-brand/40 hover:shadow-warm'
          : 'bg-card border-border/50 hover:border-brand-orange/40 hover:shadow-soft'
      )}
    >
      {/* Background decoration for highlight variant */}
      {variant === 'highlight' && (
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-brand-orange/10 blur-2xl transition-all group-hover:bg-brand-orange/20" />
      )}

      <div className="relative p-5 flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          "grid size-12 place-items-center rounded-xl shrink-0 transition-all duration-300",
          variant === 'highlight'
            ? 'bg-gradient-to-br from-brand-orange to-brand-gold text-white group-hover:scale-110'
            : 'bg-cream-light text-brand-orange group-hover:bg-brand-orange/10 group-hover:scale-110'
        )}>
          <Icon className="size-6" strokeWidth={2} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-base text-foreground group-hover:text-brand transition-colors">
              {label}
            </h3>
            <ArrowRight className="size-4 text-brand-orange opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0 mt-1" />
          </div>
          
          {description && (
            <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2">
              {description}
            </p>
          )}
        </div>
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
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-border/50 bg-card text-sm font-semibold text-foreground transition-all hover:border-brand-orange/40 hover:bg-cream-light hover:text-brand hover:shadow-soft',
        className
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  )
}

/**
 * Preset quick actions for common dashboard needs
 */
export const COMMON_ACTIONS = {
  addSchool: {
    label: 'Add School',
    description: 'Register a new school to the Teach AI For India network',
    icon: 'School' as any, // Will need to pass actual icon component
  },
  createSession: {
    label: 'Schedule Session',
    description: 'Plan your next AI education workshop',
    icon: 'CalendarPlus' as any,
  },
  recordVisit: {
    label: 'Record Visit',
    description: 'Document your school outreach visit',
    icon: 'MapPin' as any,
  },
  updateImpact: {
    label: 'Report Session',
    description: 'Share what happened in your latest session',
    icon: 'FileCheck' as any,
  },
  inviteVolunteer: {
    label: 'Invite Volunteer',
    description: 'Grow the Teach AI For India team',
    icon: 'UserPlus' as any,
  },
}
