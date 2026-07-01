import { CalendarCheck } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { listMyAttendance } from '@/lib/data/attendance'
import { ATTENDANCE_META, PRESENT_STATUSES } from '@/lib/constants/sessions'
import { formatDate } from '@/lib/format'
import { StatusBadge } from '@/components/shared/status-badge'
import { MetricCard } from '@/components/shared/metric-card'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/states'

export const metadata = { title: 'My Attendance' }

export default async function AttendancePage() {
  const user = await requireAccess('/dashboard/attendance')
  const records = await listMyAttendance(user.id)
  const attended = records.filter((r) => PRESENT_STATUSES.includes(r.status)).length
  const rate = records.length > 0 ? Math.round((attended / records.length) * 100) : 0

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">My attendance</h1>
        <p className="mt-1 text-muted-foreground">Every session you were rostered on (PRD §7.5).</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Sessions rostered" value={records.length} icon={CalendarCheck} />
        <MetricCard label="Attended" value={attended} />
        <MetricCard label="Attendance rate" value={`${rate}%`} />
      </div>

      {records.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No attendance yet" description="Once you're added to a session roster, it shows up here." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Session</th>
                <th className="p-3 font-medium">School</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-accent/40">
                  <td className="p-3 text-muted-foreground">{formatDate(r.session?.date)}</td>
                  <td className="p-3 font-medium">{r.session?.topic ?? '—'}</td>
                  <td className="p-3 text-muted-foreground">
                    {r.session?.school ? `${r.session.school.name}, ${r.session.school.district}` : '—'}
                  </td>
                  <td className="p-3">
                    <StatusBadge label={ATTENDANCE_META[r.status].label} tone={ATTENDANCE_META[r.status].tone} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
