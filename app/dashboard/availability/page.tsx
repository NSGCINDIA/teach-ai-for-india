import { CalendarClock } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { listMyAvailability, listCampusAvailability } from '@/lib/data/availability'
import { AVAILABILITY_META } from '@/lib/constants/workspace'
import { formatDate } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/states'
import { StatusBadge } from '@/components/shared/status-badge'
import { AvailabilityEditor } from '@/components/availability/availability-editor'

export const metadata = { title: 'Availability' }

/** Local YYYY-MM-DD for "today" (request-time). */
function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export default async function AvailabilityPage() {
  const user = await requireAccess('/dashboard/availability')
  const isCoordinator = can(user.role, 'assign_volunteers') !== false
  return isCoordinator ? <CampusBoard campusId={user.campus_id} /> : <MyEditor />
}

/** Volunteer Lead / Campus Lead view of campus availability, grouped by date. */
async function CampusBoard({ campusId }: { campusId: string | null }) {
  const rows = await listCampusAvailability(campusId, today())
  const byDate = new Map<string, typeof rows>()
  for (const r of rows) {
    const list = byDate.get(r.date) ?? []
    list.push(r)
    byDate.set(r.date, list)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Team availability</h1>
        <p className="mt-1 text-muted-foreground">Who’s free on upcoming dates — use it to plan assignments.</p>
      </header>

      {byDate.size === 0 ? (
        <EmptyState icon={CalendarClock} title="No availability yet" description="Volunteers haven’t marked upcoming dates yet." />
      ) : (
        <div className="space-y-4">
          {[...byDate.entries()].map(([date, list]) => (
            <Card key={date}>
              <CardHeader><CardTitle className="text-base">{formatDate(date)}</CardTitle></CardHeader>
              <CardContent>
                <ul className="flex flex-wrap gap-2">
                  {list.map((r) => (
                    <li key={r.id} className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-sm">
                      {r.volunteer?.full_name ?? 'Volunteer'}
                      <StatusBadge label={AVAILABILITY_META[r.status].label} tone={AVAILABILITY_META[r.status].tone} />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

/** A volunteer sets their own availability. */
async function MyEditor() {
  const entries = await listMyAvailability(today())
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">My availability</h1>
        <p className="mt-1 text-muted-foreground">Mark the dates you can help so leads can plan around you.</p>
      </header>
      <Card>
        <CardContent className="pt-6">
          <AvailabilityEditor entries={entries} />
        </CardContent>
      </Card>
    </div>
  )
}
