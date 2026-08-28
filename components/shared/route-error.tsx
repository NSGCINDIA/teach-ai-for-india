'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/shared/states'

export interface RouteErrorProps {
  /** The error Next.js caught. `digest` is the server-side correlation id. */
  error: Error & { digest?: string }
  /** Re-renders the segment. Next.js supplies this to every error boundary. */
  reset: () => void
  title?: string
  description?: string
  /** Where "go back" should lead — differs per segment. */
  homeHref?: string
  homeLabel?: string
}

/**
 * The body every `error.tsx` in the app renders.
 *
 * Error boundaries must be client components and each segment needs its own
 * file, so without a shared body the same markup would be copied four times and
 * drift. `sanitizeDbError` already keeps technical detail away from users; this
 * does the same for uncaught errors while still surfacing `digest`, which is the
 * only handle support has for correlating a user's report with a server log.
 */
export function RouteError({
  error,
  reset,
  title = 'Something went wrong',
  description = "We couldn't load this page. Trying again usually works — if it doesn't, the reference below will help us track it down.",
  homeHref = '/',
  homeLabel = 'Go home',
}: RouteErrorProps) {
  useEffect(() => {
    // The only observability channel this project has today is the platform's
    // runtime log. Emitting here means a field failure is at least diagnosable
    // from Vercel's dashboard via the digest the user can read off the screen.
    console.error('[route-error]', { digest: error.digest, message: error.message, stack: error.stack })
  }, [error])

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 py-16 sm:px-6">
      <ErrorState title={title} description={description} onRetry={reset} />

      <div className="mt-6 flex flex-col items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={homeHref}>{homeLabel}</Link>
        </Button>

        {error.digest && (
          <p className="text-xs text-muted-foreground">
            Reference:{' '}
            <code className="rounded bg-cream-light px-1.5 py-0.5 font-mono">{error.digest}</code>
          </p>
        )}
      </div>
    </div>
  )
}
