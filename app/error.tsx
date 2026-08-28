'use client'

import { RouteError, type RouteErrorProps } from '@/components/shared/route-error'

/**
 * Root error boundary. Catches anything thrown below the root layout that a
 * nested `error.tsx` did not already handle. Without this, an uncaught server
 * component error — a Supabase timeout, a null in a view row — renders Next.js's
 * raw error screen to a volunteer in the field on a phone.
 */
export default function RootError(props: RouteErrorProps) {
  return <RouteError {...props} />
}
