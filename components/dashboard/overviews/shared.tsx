/**
 * Building blocks shared by the per-role dashboard overviews.
 *
 * Split out of the former single 1,059-line overviews.tsx: nine role dashboards
 * in one file meant any two people touching different roles touched the same
 * file. Each role now lives in its own module and imports what it needs here.
 */
import { MetricCard } from '@/components/shared/metric-card'
import { StatusBadge } from '@/components/shared/status-badge'
import type { SchoolLite, SessionLite } from '@/lib/data/dashboard'
import { formatCurrency, formatDate } from '@/lib/format'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'

/** Panel widget with consistent header, warm border, clean internal padding */
export function Widget({
  title,
  subtitle,
  href,
  hrefLabel = 'View all',
  children,
  className = '',
}: {
  title: string
  subtitle?: string
  href?: string
  hrefLabel?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-xl border border-border/50 bg-card shadow-soft ${className}`}>
      <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
        <div>
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground font-medium mt-0.5">{subtitle}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-deep transition-colors"
          >
            {hrefLabel}
            <ArrowRight className="size-3" />
          </Link>
        )}
      </div>
      <div className="px-5 pb-5">{children}</div>
    </div>
  )
}

/** Divider list of sessions with strong visual hierarchy */
export function SessionRows({
  sessions,
  empty,
  emptySubtext,
}: {
  sessions: SessionLite[]
  empty: string
  emptySubtext?: string
}) {
  if (sessions.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm font-semibold text-foreground">{empty}</p>
        {emptySubtext && (
          <p className="text-xs text-muted-foreground mt-1">{emptySubtext}</p>
        )}
      </div>
    )
  }
  return (
    <ul className="divide-y divide-border/50">
      {sessions.map((s) => (
        <li key={s.id}>
          <Link
            href={`/dashboard/sessions/${s.id}`}
            className="group flex items-center gap-3 py-3 transition-opacity hover:opacity-80"
          >
            {/* Colour stripe */}
            <span className="w-1 h-8 rounded-full bg-brand-orange/40 shrink-0 group-hover:bg-brand-orange transition-colors" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{s.topic}</p>
              <p className="truncate text-xs text-muted-foreground font-medium">
                {s.school_name} · {formatDate(s.date)}
                {s.start_time ? ` · ${s.start_time.slice(0, 5)}` : ''}
              </p>
            </div>
            <StatusBadge kind="session" status={s.status} />
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** Divider list of schools */
export function SchoolRows({
  schools,
  empty,
  emptySubtext,
}: {
  schools: SchoolLite[]
  empty: string
  emptySubtext?: string
}) {
  if (schools.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm font-semibold text-foreground">{empty}</p>
        {emptySubtext && (
          <p className="text-xs text-muted-foreground mt-1">{emptySubtext}</p>
        )}
      </div>
    )
  }
  return (
    <ul className="divide-y divide-border/50">
      {schools.map((s) => (
        <li key={s.id}>
          <Link
            href={`/dashboard/schools/${s.id}`}
            className="group flex items-center gap-3 py-3 transition-opacity hover:opacity-80"
          >
            <span className="w-1 h-8 rounded-full bg-brand/30 shrink-0 group-hover:bg-brand transition-colors" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{s.name}</p>
              <p className="truncate text-xs text-muted-foreground font-medium">
                {s.district}
                {s.next_action_date ? ` · Follow up ${formatDate(s.next_action_date)}` : ''}
              </p>
            </div>
            {s.latest_session_number ? (
              <span className="shrink-0 text-xs font-semibold text-brand-orange bg-brand-orange/10 rounded-full px-2.5 py-1 border border-brand-orange/20">
                Session {s.latest_session_number}
              </span>
            ) : (
              <StatusBadge kind="school" status={s.status} />
            )}
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** Reimbursement row */
export function ReimbursementRows({
  items,
}: {
  items: { id: string; claimant_name: string; reference_number: string; amount: number }[]
}) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm font-semibold text-foreground">All clear! 🎉</p>
        <p className="text-xs text-muted-foreground mt-1">No claims awaiting review.</p>
      </div>
    )
  }
  return (
    <ul className="divide-y divide-border/50">
      {items.map((r) => (
        <li key={r.id} className="flex items-center gap-3 py-3">
          <span className="w-1 h-8 rounded-full bg-brand-gold/40 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{r.claimant_name}</p>
            <p className="truncate text-xs text-muted-foreground font-medium">{r.reference_number}</p>
          </div>
          <span className="text-sm font-bold tabular-nums text-brand-deep">{formatCurrency(r.amount)}</span>
        </li>
      ))}
    </ul>
  )
}

/** Reusable KPI shorthand */
export function Kpi({ label, value, icon, variant }: {
  label: string
  value: string | number
  icon: LucideIcon
  variant?: 'default' | 'highlight'
}) {
  return <MetricCard label={label} value={value} icon={icon} variant={variant} />
}


/** Work-queue card used by Volunteer Lead, Exec Lead, Finance Lead */
export function WorkQueueCard({
  title,
  subtitle,
  icon: Icon,
  href,
  hrefLabel,
  children,
  emptyMessage,
  empty,
}: {
  title: string
  subtitle?: string
  icon: LucideIcon
  href: string
  hrefLabel: string
  children?: React.ReactNode
  emptyMessage?: string
  empty: boolean
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-soft overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b border-border/50 bg-cream-light/40">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-brand/10 text-brand shrink-0">
            <Icon className="size-5" />
          </span>
          <div>
            <h3 className="font-bold text-base text-foreground">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground font-medium mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <Link href={href} className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-deep transition-colors mt-1">
          {hrefLabel} <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Body */}
      <div className="p-5">
        {empty ? (
          <div className="py-8 text-center">
            <div className="grid size-12 place-items-center rounded-xl bg-success/10 text-success mx-auto mb-3">
              <CheckCircle2 className="size-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

/** School-team card for Volunteer Lead + Exec Lead work queues */
export function SchoolTeamCard({
  item,
  statusBadge,
  statsRow,
  actionHref,
  actionLabel,
  accentClass,
}: {
  item: any
  statusBadge: React.ReactNode
  statsRow: React.ReactNode
  actionHref: string
  actionLabel: string
  accentClass: string
}) {
  return (
    <div className={`p-4 rounded-xl border space-y-3 text-sm ${accentClass}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-bold text-base leading-tight">
            <Link href={actionHref} className="hover:underline text-brand">
              {item.name}
            </Link>
          </h4>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            {item.district} · {item.student_strength} students
          </p>
        </div>
        {statusBadge}
      </div>
      <div className="flex items-center justify-between border-t border-border/50 pt-2.5 text-xs text-muted-foreground font-medium">
        {statsRow}
      </div>
      <div className="flex justify-end">
        <Link href={actionHref} className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-1">
          {actionLabel} <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  )
}

// ─── Campus Lead ─────────────────────────────────────────────────────────────
