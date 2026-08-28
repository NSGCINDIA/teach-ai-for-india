import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * The `<select>` counterpart to `Input`, defined once in globals.css as
 * `.select-field` (see the long note there for why it lives in CSS and carries
 * its chevron as a background-image rather than an icon element).
 *
 * Exported as a bare string as well as a component because most of this app's
 * forms already render their own `<select>` with their own `id`, `name`,
 * `required` and `defaultValue`; those only need the class, not a new element.
 */
export const selectClass = 'select-field'

function NativeSelect({
  className,
  ...props
}: React.ComponentProps<'select'>) {
  return <select data-slot="native-select" className={cn(selectClass, className)} {...props} />
}

export { NativeSelect }
