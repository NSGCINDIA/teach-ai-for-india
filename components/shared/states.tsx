import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { NeuralDecoration } from './neural-network-background'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: { label: string; href?: string; onClick?: () => void }
  className?: string
}

/** 
 * Empty state — Warm, encouraging TAI brand treatment.
 * Makes the user feel supported and motivated to take action.
 */
export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand/20 bg-gradient-to-br from-cream-light/50 to-secondary/10 px-6 py-16 text-center',
      className
    )}>
      <div className="relative mb-5">
        {/* Background decoration */}
        <div className="absolute inset-0 -m-4">
          <NeuralDecoration className="w-full h-full opacity-20" />
        </div>
        
        {/* Icon */}
        <span className="relative grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-orange/20 to-brand-gold/20 text-brand-orange border border-brand-orange/30">
          <Icon className="size-8" strokeWidth={1.5} aria-hidden />
        </span>
      </div>
      
      <h3 className="font-bold text-lg text-foreground mb-2">{title}</h3>
      
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground font-medium leading-relaxed">
          {description}
        </p>
      )}
      
      {action && (
        action.href ? (
          <Button asChild className="mt-6" variant="gradient">
            <a href={action.href}>{action.label}</a>
          </Button>
        ) : (
          <Button className="mt-6" onClick={action.onClick} variant="gradient">
            {action.label}
          </Button>
        )
      )}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

/** 
 * Error state — Warm, supportive treatment that doesn't blame the user.
 * Provides clear path forward with encouraging tone.
 */
export function ErrorState({
  title = 'Something went wrong',
  description = "We couldn't load this right now. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center rounded-2xl border-2 border-error/20 bg-gradient-to-br from-error/5 via-cream-light to-background px-6 py-14 text-center',
      className
    )}>
      <div className="relative mb-5">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 -m-6 opacity-10">
          <NeuralDecoration className="w-full h-full" />
        </div>
        
        {/* Error icon */}
        <span className="relative grid size-16 place-items-center rounded-2xl bg-error/10 text-error border-2 border-error/30">
          <AlertTriangle className="size-8" strokeWidth={2} aria-hidden />
        </span>
      </div>
      
      <h3 className="font-bold text-lg text-foreground mb-2">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground font-medium leading-relaxed mb-6">
        {description}
      </p>
      
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="border-2">
          Try again
        </Button>
      )}
    </div>
  )
}

/**
 * Compact empty state for smaller spaces like widgets
 */
interface CompactEmptyProps {
  message: string
  icon?: LucideIcon
}

export function CompactEmpty({ message, icon: Icon = Inbox }: CompactEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-cream-light text-brand-orange/60 mb-3">
        <Icon className="size-6" strokeWidth={1.5} aria-hidden />
      </span>
      <p className="text-sm text-muted-foreground font-medium">{message}</p>
    </div>
  )
}
