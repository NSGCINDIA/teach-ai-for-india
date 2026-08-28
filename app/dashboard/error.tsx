'use client'

import { RouteError, type RouteErrorProps } from '@/components/shared/route-error'

/**
 * Dashboard segment boundary. Renders inside the dashboard layout, so the
 * sidebar and app bar survive the failure and the user can navigate away
 * instead of losing the whole shell.
 */
export default function DashboardError(props: RouteErrorProps) {
  return (
    <RouteError
      {...props}
      description="We couldn't load this part of your dashboard. Trying again usually works — if it doesn't, the reference below will help us track it down."
      homeHref="/dashboard"
      homeLabel="Back to dashboard"
    />
  )
}
