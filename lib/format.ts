/** Shared formatters — INR currency, dates, relative time, compact numbers. */

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n)
}

/** Compact (1.8k, 1.2L) for marketing counters. */
export function formatCompact(n: number): string {
  return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function relativeTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(d)
}

/**
 * How long something has been sitting, as a plain duration rather than a
 * timestamp: "3 days", "6 weeks". `relativeTime` above answers "when did this
 * happen" and gives up on anything older than a week; this answers "how long has
 * this been like that", which is the question a stalled school raises and which
 * only gets more interesting the larger it grows.
 *
 * `now` is injectable so the rule is testable without freezing the clock.
 */
export function formatElapsed(
  date: string | Date | null | undefined,
  now: Date = new Date(),
): string | null {
  if (!date) return null
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return null

  const days = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
  if (days < 0) return null
  if (days === 0) return 'today'
  if (days === 1) return '1 day'
  if (days < 14) return `${days} days`

  const weeks = Math.floor(days / 7)
  if (weeks < 9) return `${weeks} weeks`

  const months = Math.floor(days / 30)
  return months === 1 ? '1 month' : `${months} months`
}
