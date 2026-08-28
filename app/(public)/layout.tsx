import type { ReactNode } from 'react'
import { Instrument_Serif, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { SmoothScrollProvider } from '@/components/marketing/smooth-scroll-provider'
import { FloatingDoodles } from '@/components/marketing/floating-doodles'
import { EnableAnimations } from '@/components/shared/enable-animations'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

/**
 * Public marketing layout — "The Living Classroom" rebuild.
 *
 * `.tai-public` carries a scoped design-token override (see globals.css) so
 * this route group gets its own warm editorial palette and typography without
 * touching the TAI brand tokens the admin dashboard and volunteer portal read
 * from :root. Framer Motion stays scoped here via LazyMotion (only the
 * marketing tree ever imports it); GSAP + Lenis are added underneath via
 * SmoothScrollProvider for the scroll-linked reveals described in the rebuild
 * spec. FloatingDoodles restores the site's original hand-drawn floating icon
 * background (robot, rocket, lightbulb, etc.) — the founding team explicitly
 * asked to keep this rather than the fully-stripped-down look the written
 * spec called for — recolored to the new warm editorial palette.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`tai-public ${instrumentSerif.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <LazyMotion features={domAnimation}>
        <MotionConfig reducedMotion="user">
          <SmoothScrollProvider>
            <div className="relative flex min-h-screen flex-col bg-background text-foreground">
              <EnableAnimations />
              <FloatingDoodles />
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
              >
                Skip to content
              </a>
              <Navbar />
              <main id="main" className="relative z-10 flex flex-1 flex-col pt-16">
                <div className="flex-1">{children}</div>
                <Footer />
              </main>
            </div>
          </SmoothScrollProvider>
        </MotionConfig>
      </LazyMotion>
    </div>
  )
}
