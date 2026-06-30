import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Two-panel auth layout: brand story on the left (desktop), form on the right.
 * Used by login, forgot/reset password, and invite-accept.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand p-12 text-primary-foreground lg:flex">
        <div className="absolute inset-0 dot-grid opacity-20" aria-hidden />
        <Link href="/" className="relative inline-flex items-center gap-2 font-display text-lg font-bold">
          <Sparkles className="size-5" /> Teach AI for India
        </Link>
        <div className="relative">
          <p className="font-display text-3xl font-bold leading-tight text-balance">
            The operating system for India’s student-led AI education movement.
          </p>
          <p className="mt-4 max-w-md text-primary-foreground/80">
            One place for outreach, sessions, reimbursements, evidence, and impact —
            so the movement runs even when people change.
          </p>
        </div>
        <p className="relative text-sm text-primary-foreground/70">Built by students, for students.</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 font-display text-lg font-bold lg:hidden">
            <Sparkles className="size-5 text-brand" /> Teach AI for India
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
