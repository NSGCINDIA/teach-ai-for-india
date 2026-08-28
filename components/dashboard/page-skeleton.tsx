import { Skeleton } from '@/components/ui/skeleton'

/**
 * PageSkeleton — the fallback for the auth round-trip in the dashboard and admin
 * layouts.
 *
 * It stands in for the *whole* shell, not just the page body: the Suspense
 * boundary that uses it wraps the layout itself, so a body-only skeleton meant
 * the sidebar and app bar materialised around the content a beat later. Drawing
 * the chrome here means the frame is already in its final position when the real
 * one arrives, and only the content inside it changes.
 */
export function PageSkeleton() {
  return (
    <div className="min-h-dvh bg-background" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your dashboard…</span>

      {/* Rail */}
      <div className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/60 bg-card lg:flex">
        <div className="flex h-14 items-center border-b border-border/60 px-5">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-2 p-3 pt-4">
          {/* Widths vary to read as words, not as a stack of identical bars. */}
          {[64, 52, 72, 48, 60, 44, 68].map((w, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <Skeleton className="size-[18px] shrink-0 rounded" />
              <Skeleton className="h-3.5" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      </div>

      <div className="lg:pl-64">
        {/* App bar */}
        <div className="flex h-14 items-center justify-between border-b border-border/60 px-3 sm:px-5">
          <Skeleton className="size-9 rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
            <Skeleton className="size-8 rounded-full" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
          {/* Hero */}
          <div className="rounded-2xl border border-brand/12 bg-cream-light px-6 py-8 md:px-9 md:py-10">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="mt-3 h-9 w-72 max-w-full" />
            <Skeleton className="mt-3 h-4 w-96 max-w-full" />
            <div className="mt-8 grid grid-cols-2 gap-6 border-t border-brand/12 pt-6 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2 lg:px-6">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* Two content panels */}
          <div className="grid gap-5 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, panel) => (
              <div key={panel} className="rounded-xl border border-border/50 bg-card shadow-soft">
                <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-52" />
                  </div>
                  <Skeleton className="h-3 w-14" />
                </div>
                <div className="divide-y divide-border/40 px-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 py-3.5">
                      <Skeleton className="size-10 shrink-0 rounded-xl" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-2/5" />
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
      </div>
    </div>
  )
}
