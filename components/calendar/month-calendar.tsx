import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarSession } from '@/lib/data/calendar'
import { SESSION_STATUS_META } from '@/lib/constants/status'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface Props {
  /** 4-digit year and 1-based month. */
  year: number
  month: number
  sessions: CalendarSession[]
  basePath: string
  todayIso: string
}

/** Server-rendered month grid of scheduled sessions. Navigation via ?month=. */
export function MonthCalendar({ year, month, sessions, basePath, todayIso }: Props) {
  const byDate = new Map<string, CalendarSession[]>()
  for (const s of sessions) {
    const list = byDate.get(s.date) ?? []
    list.push(s)
    byDate.set(s.date, list)
  }

  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 }
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 }
  const key = (y: number, m: number) => `${y}-${String(m).padStart(2, '0')}`

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">{MONTHS[month - 1]} {year}</h2>
        <div className="flex gap-1">
          <NavLink href={`${basePath}?month=${key(prev.y, prev.m)}`} label="Previous month"><ChevronLeft className="size-4" /></NavLink>
          <NavLink href={`${basePath}?month=${key(next.y, next.m)}`} label="Next month"><ChevronRight className="size-4" /></NavLink>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border text-sm">
        {WEEKDAYS.map((d) => (
          <div key={d} className="bg-muted px-2 py-1.5 text-center text-xs font-medium text-muted-foreground">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="min-h-24 bg-card/50" />
          const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const items = byDate.get(iso) ?? []
          const isToday = iso === todayIso
          return (
            <div key={i} className="min-h-24 bg-card p-1.5">
              <span className={cn('inline-flex size-6 items-center justify-center rounded-full text-xs', isToday && 'bg-brand font-semibold text-white')}>
                {day}
              </span>
              <ul className="mt-1 space-y-1">
                {items.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/dashboard/sessions/${s.id}`}
                      className="block truncate rounded bg-brand/10 px-1.5 py-0.5 text-[11px] text-brand hover:bg-brand/20"
                      title={`${s.school?.name ?? s.topic} · ${SESSION_STATUS_META[s.status].label}`}
                    >
                      {s.start_time ? `${s.start_time.slice(0, 5)} ` : ''}{s.school?.name ?? s.topic}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function NavLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="grid size-8 place-items-center rounded-md border border-border text-muted-foreground hover:bg-muted"
    >
      {children}
    </Link>
  )
}
