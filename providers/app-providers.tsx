'use client'

import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { MotionConfig } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'

/**
 * Global client providers: TanStack Query (stale-while-revalidate data, PRD §13.1),
 * next-themes (dark mode, PRD §12), and the toast portal.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000, // 1 min — SWR-style freshness
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
        // Explicit type marks the anti-flash inline script as an executable data block,
        // so React 19 doesn't warn "Encountered a script tag while rendering" on the client.
        scriptProps={{ type: 'text/javascript' }}
      >
        {/* reducedMotion="user" honors the OS setting WITHOUT branching the React
            tree per component, so SSR and client markup stay identical (no
            hydration mismatch from useReducedMotion). */}
        <MotionConfig reducedMotion="user">
          {children}
          <Toaster richColors position="top-right" />
        </MotionConfig>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
