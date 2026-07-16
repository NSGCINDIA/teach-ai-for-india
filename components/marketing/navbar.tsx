'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { motion } from 'framer-motion'
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
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8)
    }

    const checkUser = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user: sessionUser } } = await supabase.auth.getUser()
      setUser(sessionUser)
    }
    checkUser()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
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
      className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white shadow-soft"
    >
      {/* Mobile & Tablet Navbar (below lg) */}
      <div className="flex h-16 items-center justify-between px-5 md:px-8 lg:hidden">
        <Link href="/" className="flex items-center shrink-0 group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" aria-label="Teach AI For India home">
          <motion.div className="flex items-center gap-2.5" whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Teach_Ai_1_page-0001-removebg-preview-ZJzf3R1J38t7BLntCYEUuQMl2LbJdV.png"
              alt="Teach AI For India Logo"
              width={210}
              height={70}
              className="object-contain -translate-x-2 dark:brightness-110"
              style={{ width: 'auto', height: '70px' }}
              priority
              loading="eager"
            />
          </motion.div>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:text-brand hover:bg-slate-50 dark:text-slate-600 dark:hover:text-brand dark:hover:bg-slate-50">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button onClick={handleSignOut} variant="ghost" size="sm" className="text-slate-600 hover:text-brand hover:bg-slate-50 dark:text-slate-600 dark:hover:text-brand dark:hover:bg-slate-50">
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-slate-600 hover:text-brand hover:bg-slate-50 dark:text-slate-600 dark:hover:text-brand dark:hover:bg-slate-50">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="hidden bg-brand text-white hover:bg-brand/90 sm:inline-flex rounded-full px-5 dark:bg-brand dark:text-white dark:hover:bg-brand/90">
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
                className="lg:hidden border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-brand bg-white dark:border-slate-200 dark:text-slate-600 dark:hover:bg-slate-50 dark:hover:text-brand dark:bg-white"
                aria-label="Open menu"
              >
                <Menu className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-white text-slate-900 border-l border-slate-200 dark:bg-white dark:text-slate-900 dark:border-slate-200">
              <SheetHeader>
                <SheetTitle className="font-display text-lg font-extrabold text-slate-900 dark:text-slate-900">Teach AI for India</SheetTitle>
              </SheetHeader>
              <ul className="flex flex-col gap-1 px-4 mt-6">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <SheetClose asChild>
                      <Link
                        href={link.href}
                        aria-current={isActive(link.href) ? 'page' : undefined}
                        className={cn(
                          'block rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-slate-100 hover:text-brand dark:hover:bg-slate-100 dark:hover:text-brand',
                          isActive(link.href) ? 'text-brand dark:text-brand font-semibold' : 'text-slate-700 dark:text-slate-700',
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
                      <Button asChild variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-brand bg-white dark:border-slate-200 dark:text-slate-700 dark:hover:bg-slate-50 dark:hover:text-brand dark:bg-white">
                        <Link href="/dashboard">Dashboard</Link>
                      </Button>
                    </SheetClose>
                    <Button onClick={handleSignOut} variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-brand bg-white dark:border-slate-200 dark:text-slate-700 dark:hover:bg-slate-50 dark:hover:text-brand dark:bg-white">
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-brand bg-white dark:border-slate-200 dark:text-slate-700 dark:hover:bg-slate-50 dark:hover:text-brand dark:bg-white">
                        <Link href="/login">Log in</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full bg-brand text-white hover:bg-brand/90 dark:bg-brand dark:text-white dark:hover:bg-brand/90">
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
      <nav className="container-wide hidden lg:grid grid-cols-[1fr_auto_1fr] h-20 items-stretch border-l border-r border-slate-200/60 bg-white" aria-label="Primary">
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
                  'flex items-center px-6 h-full text-xs font-semibold uppercase tracking-wider transition-colors hover:text-brand hover:bg-slate-50 dark:hover:bg-slate-50 focus-visible:outline-none focus-visible:bg-slate-100',
                  showBorder ? 'border-r border-slate-200/60' : '',
                  isActive(link.href) ? 'text-brand' : 'text-slate-600 dark:text-slate-600',
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Center Logo */}
        <div className="flex items-center justify-center px-8 border-r border-slate-200/60">
          <Link href="/" className="flex items-center shrink-0 group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" aria-label="Teach AI For India home">
            <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Teach_Ai_1_page-0001-removebg-preview-ZJzf3R1J38t7BLntCYEUuQMl2LbJdV.png"
                alt="Teach AI For India Logo"
                width={264}
                height={80}
                className="object-contain -translate-x-3.5 dark:brightness-110"
                style={{ width: 'auto', height: '80px' }}
                priority
                loading="eager"
              />
            </motion.div>
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
                  'flex items-center px-6 h-full text-xs font-semibold uppercase tracking-wider transition-colors border-r border-slate-200/60 hover:text-brand hover:bg-slate-50 dark:hover:bg-slate-50 focus-visible:outline-none focus-visible:bg-slate-100',
                  isActive(link.href) ? 'text-brand' : 'text-slate-600 dark:text-slate-600',
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 pl-6 pr-4">
            {user ? (
              <>
                <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:text-brand hover:bg-slate-50 dark:text-slate-600 dark:hover:text-brand dark:hover:bg-slate-50">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button onClick={handleSignOut} variant="ghost" size="sm" className="text-slate-600 hover:text-brand hover:bg-slate-50 dark:text-slate-600 dark:hover:text-brand dark:hover:bg-slate-50">
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:text-brand hover:bg-slate-50 dark:text-slate-600 dark:hover:text-brand dark:hover:bg-slate-50">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild size="sm" className="bg-brand text-white hover:bg-brand/90 rounded-full px-5 dark:bg-brand dark:text-white dark:hover:bg-brand/90">
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
