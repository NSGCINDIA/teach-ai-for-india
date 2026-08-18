import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'shimmer rounded-lg bg-gradient-to-r from-cream-light via-cream-warm to-cream-light',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
