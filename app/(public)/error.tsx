'use client'

import { RouteError, type RouteErrorProps } from '@/components/shared/route-error'

/**
 * Public-site boundary. The public routes are ISR and degrade gracefully without
 * Supabase, so reaching this is rare — but a marketing visitor should still get
 * the brand shell rather than a stack trace.
 */
export default function PublicError(props: RouteErrorProps) {
  return (
    <RouteError
      {...props}
      description="We couldn't load this page. Trying again usually works."
      homeHref="/"
      homeLabel="Back to home"
    />
  )
}
