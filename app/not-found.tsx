import Link from 'next/link'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Page not found' }

/**
 * Custom 404. Renders inside the root layout, so it keeps the site's fonts and
 * tokens — unlike `global-error.tsx`, which has to inline everything.
 *
 * Both destinations are offered because this route is reached from two very
 * different places: a mistyped public URL, and a stale dashboard link a
 * volunteer followed after a route was renamed.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col items-center justify-center px-5 py-20 text-center">
      <span
        aria-hidden
        className="grid size-16 place-items-center rounded-2xl border border-brand/25 bg-cream-light text-brand"
      >
        <Compass className="size-8" strokeWidth={1.5} />
      </span>

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        404
      </p>
      <h1 className="mt-3 font-poster text-poster-brand text-4xl text-balance md:text-5xl">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-4 max-w-md text-pretty text-muted-foreground">
        The link may be out of date, or the page may have moved. Both routes below are good places
        to pick things back up.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="gradient">
          <Link href="/">Back to home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </main>
  )
}
