'use client'

import { RouteError, type RouteErrorProps } from '@/components/shared/route-error'

/** Admin segment boundary — keeps the admin shell intact around the failure. */
export default function AdminError(props: RouteErrorProps) {
  return (
    <RouteError
      {...props}
      description="We couldn't load this admin page. Trying again usually works — if it doesn't, the reference below will help us track it down."
      homeHref="/admin"
      homeLabel="Back to admin"
    />
  )
}
