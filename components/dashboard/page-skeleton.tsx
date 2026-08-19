import { Skeleton } from '@/components/ui/skeleton'

/**
 * PageSkeleton — Warm TAI-branded loading state.
 * Shape mirrors the common page layout (hero → KPI tiles → content list)
 * so the swap to real content is smooth and non-jarring.
 */
export function PageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading...</span>

      {/* Hero skeleton */}
      <div className="rounded-2xl bg-gradient-to-br from-cream-light to-cream-warm border border-border/50 p-8 md:p-12 space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-5 w-96 max-w-full" />

        {/* KPI tiles inside hero */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-card border border-border/50 p-5 space-y-3">
              <div className="flex items-start justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="size-9 rounded-lg" />
              </div>
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Section header */}
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {/* Content panels */}
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, panel) => (
          <div key={panel} className="rounded-xl bg-card border border-border/50 shadow-soft overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/50">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-52" />
              </div>
              <Skeleton className="h-4 w-14" />
            </div>
            {/* Panel rows */}
            <div className="divide-y divide-border/40 px-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-3.5">
                  <Skeleton className="w-1 h-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-2/5" />
                    <Skeleton className="h-3 w-3/5" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
