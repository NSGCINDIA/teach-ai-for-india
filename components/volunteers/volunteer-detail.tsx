import Link from 'next/link'
import { Award, CalendarCheck, ClipboardList, IndianRupee, UserRound } from 'lucide-react'
import type { AdminUser } from '@/lib/data/admin'
import type { MyAttendanceItem } from '@/lib/data/attendance'
import type { MyAssignment } from '@/lib/data/assignments'
import type { CertificateItem } from '@/lib/data/certificates'
import type { ReimbursementListItem } from '@/lib/data/finance'
import type { VolunteerData } from '@/lib/data/dashboard'
import { roleLabel } from '@/lib/auth/roles'
import { ATTENDANCE_META } from '@/lib/constants/sessions'
import { ASSIGNMENT_STATUS_META } from '@/lib/constants/status'
import { CERTIFICATE_KIND_META } from '@/lib/constants/workspace'
import { formatDate, formatCurrency } from '@/lib/format'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricCard } from '@/components/shared/metric-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/states'

interface Props {
  volunteer: AdminUser
  attendance: MyAttendanceItem[]
  assignments: MyAssignment[]
  certificates: CertificateItem[]
  reimbursements: ReimbursementListItem[]
  summary: VolunteerData
}

export function VolunteerDetailView({ volunteer, attendance, assignments, certificates, reimbursements, summary }: Props) {
  const presentCount = attendance.filter((a) => a.status === 'present' || a.status === 'late').length

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Avatar className="size-14">
          <AvatarImage src={volunteer.avatar_url ?? undefined} alt={volunteer.full_name} />
          <AvatarFallback className="text-lg">{volunteer.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{volunteer.full_name}</h1>
          <p className="mt-0.5 text-muted-foreground">
            {roleLabel(volunteer.role)}{volunteer.campus ? ` · ${volunteer.campus.name}` : ''}
            {!volunteer.is_active && <span className="ml-2 text-error">· Inactive</span>}
          </p>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border p-4 text-sm sm:grid-cols-3">
        <div><dt className="text-xs text-muted-foreground">Email</dt><dd className="font-medium">{volunteer.email}</dd></div>
        {volunteer.niat_id && (
          <div><dt className="text-xs text-muted-foreground">NIAT ID</dt><dd className="font-medium">{volunteer.niat_id}</dd></div>
        )}
        <div><dt className="text-xs text-muted-foreground">Last login</dt><dd className="font-medium">{formatDate(volunteer.last_login_at)}</dd></div>
      </dl>

      <div className="grid gap-4 sm:grid-cols-4">
        <MetricCard label="Sessions attended" value={summary.kpis.pastSessions} icon={CalendarCheck} />
        <MetricCard label="Hours contributed" value={summary.kpis.hoursContributed} icon={UserRound} />
        <MetricCard label="Upcoming sessions" value={summary.kpis.upcomingCount} icon={ClipboardList} />
        <MetricCard label="Reimbursement claims" value={summary.kpis.myClaims} icon={IndianRupee} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Attendance history</CardTitle></CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <EmptyState icon={CalendarCheck} title="No attendance yet" description="Sessions this volunteer attends will show up here." />
          ) : (
            <>
              <p className="mb-3 text-xs text-muted-foreground">{presentCount} of {attendance.length} sessions attended</p>
              <ul className="space-y-2">
                {attendance.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium">{a.session?.school?.name ?? a.session?.topic ?? 'Session'}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(a.session?.date)}</p>
                    </div>
                    <StatusBadge label={ATTENDANCE_META[a.status].label} tone={ATTENDANCE_META[a.status].tone} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Session assignments</CardTitle></CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No assignments yet" description="Sessions this volunteer is asked to help run will show up here." />
          ) : (
            <ul className="space-y-2">
              {assignments.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <div className="min-w-0">
                    {a.session ? (
                      <Link href={`/dashboard/sessions/${a.session.id}`} className="font-medium text-brand hover:underline">
                        {a.session.school?.name ?? a.session.topic}
                      </Link>
                    ) : <p className="font-medium">Session</p>}
                    <p className="text-xs text-muted-foreground">{formatDate(a.session?.date)}</p>
                  </div>
                  <StatusBadge label={ASSIGNMENT_STATUS_META[a.status].label} tone={ASSIGNMENT_STATUS_META[a.status].tone} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Certificates</CardTitle></CardHeader>
        <CardContent>
          {certificates.length === 0 ? (
            <EmptyState icon={Award} title="No certificates yet" description="Certificates issued to this volunteer will show up here." />
          ) : (
            <ul className="space-y-2">
              {certificates.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <Link href={`/dashboard/certificates/${c.id}`} className="font-medium text-brand hover:underline">
                      {c.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{CERTIFICATE_KIND_META[c.kind].label} · {formatDate(c.issued_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Reimbursement claims</CardTitle></CardHeader>
        <CardContent>
          {reimbursements.length === 0 ? (
            <EmptyState icon={IndianRupee} title="No claims yet" description="Reimbursement claims filed by this volunteer will show up here." />
          ) : (
            <ul className="space-y-2">
              {reimbursements.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <Link href={`/dashboard/reimbursements/${r.id}`} className="font-medium text-brand hover:underline">
                      {formatCurrency(r.amount)}
                    </Link>
                    <p className="text-xs text-muted-foreground">{r.reference_number} · {formatDate(r.claim_date)}</p>
                  </div>
                  <StatusBadge kind="reimbursement" status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
