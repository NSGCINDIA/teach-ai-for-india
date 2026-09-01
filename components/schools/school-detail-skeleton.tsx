import { Skeleton } from '@/components/ui/skeleton'

/**
 * The School workspace while its eight queries are in flight.
 *
 * The route had no loading state at all, so opening a school from the list left
 * the previous page on screen until every fetch resolved. This draws the shape
 * the page is about to take — header, command bar, lifecycle rail, tab strip —
 * so the layout is already settled when the content lands and nothing jumps.
 */
export function SchoolDetailSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading school…</span>

      <Skeleton className="h-8 w-28" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <Skeleton className="size-12 shrink-0 rounded-xl" />
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-56 max-w-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>

      {/* Command bar */}
      <div className="space-y-3 rounded-2xl border border-brand/20 bg-brand/5 p-5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-64 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {/* Lifecycle rail */}
      <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-4">
        <Skeleton className="h-3 w-20" />
        <div className="flex gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 flex-1 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Tab strip */}
      <div className="flex gap-4 border-b border-border pb-2.5 pt-1">
        {[64, 56, 72, 44, 68, 60].map((w, i) => (
          <Skeleton key={i} className="h-4" style={{ width: w }} />
        ))}
      </div>

      <div className="space-y-4 pt-3">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </div>
  )
}
