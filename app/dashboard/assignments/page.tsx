import Link from 'next/link'
import { CalendarDays, ClipboardList, UsersRound, School } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { listMyAssignments, listCampusAssignments } from '@/lib/data/assignments'
import { getVolunteerTeamAssignments } from '@/lib/data/school-team'
import { ASSIGNMENT_STATUS_META } from '@/lib/constants/status'
import { formatDate } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { MetricCard } from '@/components/shared/metric-card'
import { EmptyState } from '@/components/shared/states'
import { AssignmentResponse } from '@/components/assignments/assignment-response'
import { VolunteerSessionCard } from '@/components/schools/volunteer-session-card'

export const metadata = { title: 'Assignments' }

export default async function AssignmentsPage() {
  const user = await requireAccess('/dashboard/assignments')
  const isCoordinator = can(user.role, 'assign_volunteers') !== false

  return isCoordinator ? <CoordinatorBoard campusId={user.campus_id} /> : <MyAssignments userId={user.id} />
}

import { getVolunteerLeadQueue } from '@/lib/data/volunteer-lead-queue'

/** Volunteer Lead / Campus Lead coordination board across the campus (Task 25). */
async function CoordinatorBoard({ campusId }: { campusId: string | null }) {
  const queue = await getVolunteerLeadQueue(campusId)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">School Team Coordination</h1>
          <p className="mt-1 text-muted-foreground">School-centric team building and volunteer availability tracking.</p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-4">
        <MetricCard label="Schools Needing Teams" value={queue.schoolsNeedingTeamsCount} icon={School} />
        <MetricCard label="Pending Responses" value={queue.pendingResponsesCount} icon={UsersRound} />
        <MetricCard label="Incomplete Teams" value={queue.incompleteTeamsCount} />
        <MetricCard label="Teams Ready" value={queue.teamsReadyCount} />
      </div>

      {queue.workItems.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No active schools needing teams"
          description="When a school passes onboarding approval, it appears here for team building."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {queue.workItems.map((s) => {
            const isReady = s.confirmed_count >= s.required_volunteers
            return (
              <Card key={s.id} className={`p-4 border space-y-3 ${isReady ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base">
                      <Link href={`/dashboard/schools/${s.id}`} className="hover:underline text-brand">
                        {s.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-muted-foreground">{s.district} · {s.student_strength} students</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${isReady ? 'border-success/30 bg-success/10 text-success' : 'border-warning/30 bg-warning/10 text-warning'}`}>
                    {isReady ? 'TEAM READY' : 'BUILDING TEAM'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs py-1">
                  <div className="rounded border bg-background p-1.5">
                    <span className="block text-[10px] text-muted-foreground">Required</span>
                    <strong className="font-bold text-sm">{s.required_volunteers}</strong>
                  </div>
                  <div className="rounded border bg-success/10 text-success p-1.5">
                    <span className="block text-[10px]">Confirmed</span>
                    <strong className="font-bold text-sm">{s.confirmed_count}</strong>
                  </div>
                  <div className="rounded border bg-warning/10 text-warning p-1.5">
                    <span className="block text-[10px]">Awaiting</span>
                    <strong className="font-bold text-sm">{s.requested_count}</strong>
                  </div>
                  <div className="rounded border bg-destructive/10 text-destructive p-1.5">
                    <span className="block text-[10px]">Unavailable</span>
                    <strong className="font-bold text-sm">{s.unavailable_count}</strong>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Link
                    href={`/dashboard/schools/${s.id}`}
                    className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1"
                  >
                    Manage Team →
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** A volunteer's own assignments with accept/decline controls. */
async function MyAssignments({ userId }: { userId: string }) {
  const [rows, schoolTeamAssignments] = await Promise.all([
    listMyAssignments(userId),
    getVolunteerTeamAssignments(userId),
  ])
  const pending = rows.filter((r) => r.status === 'assigned')
  const responded = rows.filter((r) => r.status !== 'assigned')

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">My assignments</h1>
        <p className="mt-1 text-muted-foreground">School teams and sessions you’ve been asked to help run.</p>
      </header>

      {/* School Team Assignments */}
      {schoolTeamAssignments.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
            <School className="size-4 text-brand" /> School Team Requests
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {schoolTeamAssignments.map((a) => (
              <VolunteerSessionCard
                key={a.id}
                memberId={a.id}
                schoolId={a.school_id}
                schoolName={a.school_name}
                district={a.district}
                status={a.status}
                assignedAt={a.assigned_at}
              />
            ))}
          </div>
        </section>
      )}

      {rows.length === 0 && schoolTeamAssignments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments yet"
          description="When a lead requests you for a school team or session, it shows up here."
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
