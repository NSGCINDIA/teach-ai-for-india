'use client'

import type { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'

/**
 * Global client providers: next-themes (dark mode, PRD §12) and the toast portal.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      // Explicit type marks the anti-flash inline script as an executable data block,
      // so React 19 doesn't warn "Encountered a script tag while rendering" on the client.
      scriptProps={{ type: 'text/javascript' }}
    >
      {children}
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  )
}
