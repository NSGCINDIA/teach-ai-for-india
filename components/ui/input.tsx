import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-placeholder selection:bg-brand-orange selection:text-white border-input h-10 w-full min-w-0 rounded-lg border-2 bg-card px-4 py-2 text-sm font-medium shadow-sm transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-semibold disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus:border-brand focus:ring-2 focus:ring-brand/20',
        'hover:border-brand/50',
        'aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error/20',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
