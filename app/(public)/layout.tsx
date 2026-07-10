import type { ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'

/**
 * Public marketing layout (Pillar 1). Nested inside the root layout, so it adds
 * only the chrome: a skip link, the sticky navbar, the main landmark, and footer.
 * framer-motion is scoped here (not the root providers) since the authenticated
 * dashboard/admin product never imports it.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    // reducedMotion="user" honors the OS setting WITHOUT branching the React
    // tree per component, so SSR and client markup stay identical (no
    // hydration mismatch from useReducedMotion).
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </MotionConfig>
  )
}
