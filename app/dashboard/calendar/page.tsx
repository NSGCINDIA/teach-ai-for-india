import { requireAccess } from '@/lib/auth/user'
import { isAdmin } from '@/lib/auth/rbac'
import { listSessionsInRange } from '@/lib/data/calendar'
import { MonthCalendar } from '@/components/calendar/month-calendar'

export const metadata = { title: 'Calendar' }

/** Parse ?month=YYYY-MM, falling back to the current month. */
function resolveMonth(raw: string | undefined): { year: number; month: number } {
  const m = raw && /^\d{4}-\d{2}$/.test(raw) ? raw : null
  if (m) {
    const [y, mm] = m.split('-').map(Number)
    if (mm >= 1 && mm <= 12) return { year: y, month: mm }
  }
  const now = new Date()
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 }
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month: monthParam } = await searchParams
  const user = await requireAccess('/dashboard/calendar')
  const { year, month } = resolveMonth(monthParam)

  // [first of month, first of next month)
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const nextMonth = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 }
  const to = `${nextMonth.y}-${String(nextMonth.m).padStart(2, '0')}-01`

  // Admins see everything; leadership scopes to their campus (RLS also applies).
  const campusId = isAdmin(user.role) ? null : user.campus_id
  const sessions = await listSessionsInRange(from, to, campusId)
  const todayIso = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="mt-1 text-muted-foreground">Scheduled sessions across the month. Click a session to open it.</p>
      </header>
      <MonthCalendar year={year} month={month} sessions={sessions} basePath="/dashboard/calendar" todayIso={todayIso} />
    </div>
  )
}
