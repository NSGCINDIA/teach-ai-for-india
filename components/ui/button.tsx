import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default: 'bg-brand text-primary-foreground hover:bg-brand-deep shadow-sm active:scale-[0.98]',
        gradient: 'bg-gradient-brand text-white hover:opacity-90 shadow-soft active:scale-[0.98]',
        destructive: 'bg-destructive text-white hover:bg-destructive/90 shadow-sm',
        outline: 'border-2 border-border bg-background hover:bg-cream-light hover:border-brand/30',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-cream-light hover:text-brand',
        link: 'text-brand underline-offset-4 hover:underline font-medium',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-md gap-1.5 px-3 text-xs',
        lg: 'h-12 rounded-lg px-7 text-base',
        icon: 'size-10',
        'icon-sm': 'size-8',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
