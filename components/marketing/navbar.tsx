'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hasAuthCookie } from '@/lib/auth/has-auth-cookie'
import type { User } from '@supabase/supabase-js'

const LEFT_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/impact', label: 'Impact' },
  { href: '/campuses', label: 'Campuses' },
] as const

const RIGHT_LINKS = [
  { href: '/stories', label: 'Stories' },
  { href: '/faq', label: 'FAQ' },
] as const

const ALL_LINKS = [...LEFT_LINKS, ...RIGHT_LINKS] as const

/**
 * Sticky marketing navbar — centered wordmark flanked by nav links on desktop
 * (the layout the founding team specifically asked to keep), transparent over
 * the hero and turning to frosted glass once the page scrolls past it.
 */
export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!hasAuthCookie()) return
    let cancelled = false
    const checkUser = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user: sessionUser } } = await supabase.auth.getUser()
      if (!cancelled) setUser(sessionUser)
    }
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

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [open])

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const linkClass = (href: string) =>
    cn(
      'flex h-full items-center px-5 text-sm font-semibold uppercase tracking-wider transition-colors hover:text-brand',
      isActive(href) ? 'text-brand' : 'text-foreground/80',
    )

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 h-16 border-b transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled || open
          ? 'border-border bg-background/90 backdrop-blur-md'
          : 'border-transparent bg-transparent',
      )}
    >
      {/* Mobile / tablet bar */}
      <div className="flex h-16 items-center justify-between px-5 md:px-8 lg:hidden">
        <Link
          href="/"
          className="select-none text-base font-bold uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Teach AI for India — home"
        >
          TEACH <span className="text-brand">AI</span> FOR INDIA
        </Link>
        <button
          type="button"
          className="grid size-10 place-items-center rounded-md text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>

      {/* Desktop bar — links | centered wordmark | links + actions */}
      <nav
        className="tai-container-wide hidden h-full grid-cols-[1fr_auto_1fr] items-stretch lg:grid px-4 sm:px-6"
        aria-label="Primary"
      >
        <div className="flex items-stretch justify-start">
          {LEFT_LINKS.map((link) => (
            <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? 'page' : undefined} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-center px-8">
          <Link
            href="/"
            className="select-none rounded-sm text-base font-bold uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Teach AI for India — home"
          >
            TEACH <span className="text-brand">AI</span> FOR INDIA
          </Link>
        </div>

        <div className="flex items-stretch justify-end">
          {RIGHT_LINKS.map((link) => (
            <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? 'page' : undefined} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}

          <div className="flex items-center gap-2 pl-4">
            {user ? (
              <>
                <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-brand">
                  Dashboard
                </Link>
                <button onClick={handleSignOut} className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-brand">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-brand">
                  Log in
                </Link>
                <Link
                  href="/join"
                  className="inline-flex h-10 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
                >
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col justify-between overflow-y-auto bg-background px-6 py-10 lg:hidden"
          >
            <nav aria-label="Primary" className="flex flex-col gap-1">
              {ALL_LINKS.map((link, i) => (
                <m.div
                  key={link.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 + i * 0.06 }}
                >
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={cn(
                      'block border-b border-border py-4 font-display text-3xl',
                      isActive(link.href) ? 'text-brand' : 'text-foreground',
                    )}
                  >
                    {link.label}
                  </Link>
                </m.div>
              ))}
            </nav>

            <m.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 + ALL_LINKS.length * 0.06 }}
              className="flex flex-col gap-3 pt-8"
            >
              {user ? (
                <>
                  <Link href="/dashboard" className="text-center text-sm font-medium text-foreground/80">Dashboard</Link>
                  <button onClick={handleSignOut} className="text-center text-sm font-medium text-foreground/80">Log out</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-center text-sm font-medium text-foreground/80">Log in</Link>
                  <Link
                    href="/join"
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white"
                  >
                    Join the movement
                  </Link>
                </>
              )}
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  )
}
