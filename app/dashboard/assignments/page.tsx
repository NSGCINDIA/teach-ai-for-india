import Link from 'next/link'
import { CalendarDays, ClipboardList, UsersRound } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { listMyAssignments, listCampusAssignments } from '@/lib/data/assignments'
import { ASSIGNMENT_STATUS_META } from '@/lib/constants/status'
import { formatDate } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { MetricCard } from '@/components/shared/metric-card'
import { EmptyState } from '@/components/shared/states'
import { AssignmentResponse } from '@/components/assignments/assignment-response'

export const metadata = { title: 'Assignments' }

export default async function AssignmentsPage() {
  const user = await requireAccess('/dashboard/assignments')
  const isCoordinator = can(user.role, 'assign_volunteers') !== false

  return isCoordinator ? <CoordinatorBoard campusId={user.campus_id} /> : <MyAssignments />
}

/** Volunteer Lead / Campus Lead coordination board across the campus. */
async function CoordinatorBoard({ campusId }: { campusId: string | null }) {
  const rows = await listCampusAssignments(campusId)
  const pending = rows.filter((r) => r.status === 'assigned').length
  const needsAction = rows.filter((r) => r.status === 'declined' || r.status === 'replacement_requested').length

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Assignments</h1>
        <p className="mt-1 text-muted-foreground">Every volunteer assignment across your campus.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Total assignments" value={rows.length} icon={UsersRound} />
        <MetricCard label="Awaiting reply" value={pending} />
        <MetricCard label="Needs your action" value={needsAction} />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments yet"
          description="Assign volunteers from any scheduled session’s detail page."
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="p-3 font-medium">Volunteer</th>
                <th className="p-3 font-medium">Session</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-accent/40">
                  <td className="p-3 font-medium">{r.volunteer?.full_name ?? '—'}</td>
                  <td className="p-3">
                    {r.session ? (
                      <Link href={`/dashboard/sessions/${r.session.id}`} className="text-brand hover:underline">
                        {r.session.school?.name ?? r.session.topic}
                      </Link>
                    ) : '—'}
                  </td>
                  <td className="p-3 text-muted-foreground">{formatDate(r.session?.date)}</td>
                  <td className="p-3">
                    <StatusBadge label={ASSIGNMENT_STATUS_META[r.status].label} tone={ASSIGNMENT_STATUS_META[r.status].tone} />
                  </td>
                  <td className="p-3 text-muted-foreground">{r.note ? `“${r.note}”` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

/** A volunteer's own assignments with accept/decline controls. */
async function MyAssignments() {
  const rows = await listMyAssignments()
  const pending = rows.filter((r) => r.status === 'assigned')
  const responded = rows.filter((r) => r.status !== 'assigned')

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">My assignments</h1>
        <p className="mt-1 text-muted-foreground">Sessions you’ve been asked to help run. Confirm your availability.</p>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments yet"
          description="When a lead assigns you to a session, it shows up here to accept or decline."
        />
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Needs your reply</h2>
              {pending.map((r) => (
                <Card key={r.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {r.session ? (
                        <Link href={`/dashboard/sessions/${r.session.id}`} className="text-brand hover:underline">
                          {r.session.school?.name ?? r.session.topic}
                        </Link>
                      ) : 'Session'}
                    </CardTitle>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarDays className="size-3.5" /> {formatDate(r.session?.date)}
                      {r.session?.school ? ` · ${r.session.school.district}` : ''}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <AssignmentResponse assignmentId={r.id} />
                  </CardContent>
                </Card>
              ))}
            </section>
          )}

          {responded.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Responded</h2>
              <Card className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="p-3 font-medium">Session</th>
                      <th className="p-3 font-medium">Date</th>
                      <th className="p-3 font-medium">Your response</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responded.map((r) => (
                      <tr key={r.id} className="border-b last:border-0 hover:bg-accent/40">
                        <td className="p-3 font-medium">
                          {r.session ? (
                            <Link href={`/dashboard/sessions/${r.session.id}`} className="text-brand hover:underline">
                              {r.session.school?.name ?? r.session.topic}
                            </Link>
                          ) : '—'}
                        </td>
                        <td className="p-3 text-muted-foreground">{formatDate(r.session?.date)}</td>
                        <td className="p-3">
                          <StatusBadge label={ASSIGNMENT_STATUS_META[r.status].label} tone={ASSIGNMENT_STATUS_META[r.status].tone} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
