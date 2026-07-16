import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'

/**
 * Global client providers: toast portal. (Dark mode ThemeProvider removed)
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
    </>
  )
}
