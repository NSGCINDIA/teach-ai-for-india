'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { m } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'

import { BrandLogo } from '@/components/ui/brand-logo'
import type { User } from '@supabase/supabase-js'

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/impact', label: 'Impact' },
  { href: '/campuses', label: 'Campuses' },
  { href: '/stories', label: 'Stories' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
] as const

const LEFT_NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/impact', label: 'Impact' },
  { href: '/campuses', label: 'Campuses' },
  { href: '/stories', label: 'Stories' },
] as const

const RIGHT_NAV_LINKS = [
  { href: '/gallery', label: 'Gallery' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
] as const

/** Sticky marketing navbar — turns to glass on scroll, collapses to a Sheet drawer on mobile. */
export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // Resolving the session pulls in ~240 KB of supabase-js and costs a network
  // round trip, but only swaps two buttons in the corner. Defer it past
  // hydration so it never competes with the LCP paint on the marketing pages.
  useEffect(() => {
    let cancelled = false

    const checkUser = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user: sessionUser } } = await supabase.auth.getUser()
      if (!cancelled) setUser(sessionUser)
    }

    // requestIdleCallback only reached Safari in 17.4, so keep a timer fallback.
    const hasIdle = typeof window.requestIdleCallback === 'function'
    const handle = hasIdle
      ? window.requestIdleCallback(() => void checkUser(), { timeout: 2000 })
      : window.setTimeout(() => void checkUser(), 200)

    return () => {
      cancelled = true
      if (hasIdle) window.cancelIdleCallback(handle)
      else window.clearTimeout(handle)
    }
  }, [])

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header
      className="fixed top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-soft dark:border-slate-800 dark:bg-slate-950/90"
    >
      {/* Mobile & Tablet Navbar (below lg) */}
      <div className="flex h-16 items-center justify-between px-5 md:px-8 lg:hidden">
        <Link href="/" className="flex items-center shrink-0 group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" aria-label="TEACHAIFORINDIA home">
          <m.div className="flex items-center py-1" whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
            <BrandLogo size="lg" />
          </m.div>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="text-slate-700 hover:text-[#881337] hover:bg-rose-50 dark:text-slate-200 dark:hover:text-[#be123c] dark:hover:bg-slate-800">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button onClick={handleSignOut} variant="ghost" size="sm" className="text-slate-700 hover:text-[#881337] hover:bg-rose-50 dark:text-slate-200 dark:hover:text-[#be123c] dark:hover:bg-slate-800">
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-slate-700 hover:text-[#881337] hover:bg-rose-50 dark:text-slate-200 dark:hover:text-[#be123c] dark:hover:bg-slate-800">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="hidden bg-[#881337] text-white hover:bg-[#701a28] sm:inline-flex rounded-full px-5 shadow-sm shadow-rose-900/25 font-semibold">
                <Link href="/join">Join</Link>
              </Button>
            </>
          )}

          {/* Mobile drawer */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-[#881337] bg-white dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-[#be123c] dark:bg-slate-900"
                aria-label="Open menu"
              >
                <Menu className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-white text-slate-900 border-l border-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800">
              <SheetHeader>
                <SheetTitle className="font-display text-lg font-extrabold text-slate-900 dark:text-white">
                  <BrandLogo size="md" />
                </SheetTitle>
              </SheetHeader>
              <ul className="flex flex-col gap-1 px-4 mt-6">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <SheetClose asChild>
                      <Link
                        href={link.href}
                        aria-current={isActive(link.href) ? 'page' : undefined}
                        className={cn(
                          'block rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-rose-50 hover:text-[#881337] dark:hover:bg-slate-900 dark:hover:text-[#be123c]',
                          isActive(link.href) ? 'text-[#881337] dark:text-[#be123c] font-semibold bg-rose-50/50 dark:bg-slate-900/50' : 'text-slate-700 dark:text-slate-300',
                        )}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-2 p-4">
                {user ? (
                  <>
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-[#881337] bg-white dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-[#be123c] dark:bg-slate-900">
                        <Link href="/dashboard">Dashboard</Link>
                      </Button>
                    </SheetClose>
                    <Button onClick={handleSignOut} variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-[#881337] bg-white dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-[#be123c] dark:bg-slate-900">
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-[#881337] bg-white dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-[#be123c] dark:bg-slate-900">
                        <Link href="/login">Log in</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full bg-[#881337] text-white hover:bg-[#701a28] shadow-sm shadow-rose-900/25 font-semibold">
                        <Link href="/join">Join the movement</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Navbar (lg and up) */}
      <nav className="container-wide hidden lg:grid grid-cols-[1fr_auto_1fr] h-20 items-stretch border-l border-r border-slate-200/60 bg-white/95 dark:border-slate-800/80 dark:bg-slate-950/90" aria-label="Primary">
        {/* Left Links */}
        <div className="flex items-stretch justify-start">
          {LEFT_NAV_LINKS.map((link) => {
            const showBorder = link.href !== '/about' && link.href !== '/impact'
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'flex items-center px-6 h-full text-xs font-semibold uppercase tracking-wider transition-colors hover:text-[#881337] hover:bg-rose-50/50 dark:hover:bg-slate-900/50 dark:hover:text-[#be123c] focus-visible:outline-none focus-visible:bg-slate-100',
                  showBorder ? 'border-r border-slate-200/60 dark:border-slate-800/60' : '',
                  isActive(link.href) ? 'text-[#881337] dark:text-[#be123c] font-bold' : 'text-slate-600 dark:text-slate-400',
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Center Logo */}
        <div className="flex items-center justify-center px-8 border-r border-slate-200/60 dark:border-slate-800/60">
          <Link href="/" className="flex items-center shrink-0 group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" aria-label="TEACHAIFORINDIA home">
            <m.div className="flex items-center py-2" whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <BrandLogo size="xl" />
            </m.div>
          </Link>
        </div>

        {/* Right Links & Actions */}
        <div className="flex items-stretch justify-end">
          <div className="flex items-stretch">
            {RIGHT_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'flex items-center px-6 h-full text-xs font-semibold uppercase tracking-wider transition-colors border-r border-slate-200/60 dark:border-slate-800/60 hover:text-[#881337] hover:bg-rose-50/50 dark:hover:bg-slate-900/50 dark:hover:text-[#be123c] focus-visible:outline-none focus-visible:bg-slate-100',
                  isActive(link.href) ? 'text-[#881337] dark:text-[#be123c] font-bold' : 'text-slate-600 dark:text-slate-400',
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 pl-6 pr-4">
            {user ? (
              <>
                <Button asChild variant="ghost" size="sm" className="text-slate-700 hover:text-[#881337] hover:bg-rose-50 dark:text-slate-300 dark:hover:text-[#be123c] dark:hover:bg-slate-900">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button onClick={handleSignOut} variant="ghost" size="sm" className="text-slate-700 hover:text-[#881337] hover:bg-rose-50 dark:text-slate-300 dark:hover:text-[#be123c] dark:hover:bg-slate-900">
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="text-slate-700 hover:text-[#881337] hover:bg-rose-50 dark:text-slate-300 dark:hover:text-[#be123c] dark:hover:bg-slate-900">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild size="sm" className="bg-[#881337] text-white hover:bg-[#701a28] rounded-full px-5 shadow-sm shadow-rose-900/25 font-semibold">
                  <Link href="/join">Join</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
