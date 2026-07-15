import type { ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { Background3D } from '@/components/marketing/bg-3d'

/**
 * Public marketing layout (Pillar 1). Nested inside the root layout, so it adds
 * only the chrome: a skip link, the sticky navbar, the main landmark, and footer.
 * framer-motion is scoped here (not the root providers) since the authenticated
 * dashboard/admin product never imports it.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col relative bg-background overflow-hidden">
        <Background3D />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex-1 z-10 relative pt-20 flex flex-col justify-between">
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </MotionConfig>
  )
}
