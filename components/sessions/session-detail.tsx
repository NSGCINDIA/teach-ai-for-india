import Link from 'next/link'
import { ArrowLeft, CalendarDays, Clock, ClipboardCheck, Images, MapPin, Pencil, UserCheck, Users } from 'lucide-react'
import type { SessionDetail, TeamMember } from '@/lib/data/sessions'
import type { AssignmentWithVolunteer } from '@/lib/data/assignments'
import type { EvidenceListItem } from '@/lib/data/evidence'
import { SESSION_TYPE_META, SESSION_TYPE_FIELD } from '@/lib/constants/sessions'
import { MEDIA_TYPE_META } from '@/lib/constants/evidence'
import { formatDate } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { SessionStatusControl } from '@/components/sessions/session-status-control'
import { AttendanceEditor } from '@/components/sessions/attendance-editor'
import { AssignmentPanel } from '@/components/sessions/assignment-panel'
import { EvidenceUploader } from '@/components/evidence/evidence-uploader'

interface Props {
  session: SessionDetail
  members: TeamMember[]
  assignments: AssignmentWithVolunteer[]
  assignCandidates: TeamMember[]
  canAssign: boolean
  evidence: EvidenceListItem[]
  basePath: string
  schoolBasePath: string
  canEdit: boolean
  canUploadEvidence: boolean
}

export function SessionDetailView({
  session, members, assignments, assignCandidates, canAssign,
  evidence, basePath, schoolBasePath, canEdit, canUploadEvidence,
}: Props) {
  const field = SESSION_TYPE_FIELD[session.session_type]
  const detail = session.type_details?.[field.key] as string | undefined
  const time = [session.start_time, session.end_time].filter(Boolean).map((t) => t!.slice(0, 5)).join(' – ')

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
        <Link href={basePath}><ArrowLeft className="size-4" /> All sessions</Link>
      </Button>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight">{session.topic}</h1>
            <StatusBadge kind="session" status={session.status} />
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" /> {formatDate(session.date)}</span>
            {time && <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> {time}</span>}
            <span>{SESSION_TYPE_META[session.session_type].label} · Session #{session.session_number}</span>
          </p>
          {session.school && (
            <p className="mt-1 flex items-center gap-1.5 text-sm">
              <MapPin className="size-3.5 text-muted-foreground" />
              <Link href={`${schoolBasePath}/${session.school.id}`} className="text-brand hover:underline">
                {session.school.name}
              </Link>
              <span className="text-muted-foreground">· {session.school.district}</span>
            </p>
          )}
        </div>
        {canEdit && (
          <Button asChild variant="outline" size="sm">
            <Link href={`${basePath}/${session.id}/edit`}><Pencil className="size-4" /> Edit / Report</Link>
          </Button>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Report</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Detail label="Students present" value={num(session.student_count)} />
              <Detail label="Volunteers present" value={num(session.volunteer_count)} />
              <Detail label="Campus" value={session.campus?.name} />
              {detail && <Detail label={field.label} value={detail} className="col-span-2 sm:col-span-3" />}
              {session.notes && <Detail label="What happened" value={session.notes} className="col-span-2 sm:col-span-3" />}
              {session.challenges && <Detail label="Challenges" value={session.challenges} className="col-span-2 sm:col-span-3" />}
              {session.next_steps && <Detail label="Next steps" value={session.next_steps} className="col-span-2 sm:col-span-3" />}
              {session.improvement_notes && <Detail label="Improvement notes" value={session.improvement_notes} className="col-span-2 sm:col-span-3" />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ClipboardCheck className="size-4" /> Volunteer attendance</CardTitle></CardHeader>
            <CardContent>
              <AttendanceEditor
                sessionId={session.id}
                members={members}
                existing={session.attendance.map((a) => ({
                  user_id: a.user_id, status: a.status, arrival_time: a.arrival_time, departure_time: a.departure_time,
                }))}
                canEdit={canEdit}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Images className="size-4" /> Evidence</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Reporting needs at least 1 photo and 1 attendance document. {evidence.length} file{evidence.length === 1 ? '' : 's'} attached.
              </p>
              {canUploadEvidence && (
                <EvidenceUploader
                  entityType="session"
                  entityId={session.id}
                  campusId={session.campus_id}
                  schoolId={session.school_id}
                  sessionId={session.id}
                />
              )}
              {evidence.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {evidence.map((m) => (
                    <a
                      key={m.id}
                      href={m.signed_url ?? undefined}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative block aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                      title={`${m.file_name} · ${MEDIA_TYPE_META[m.file_type].label}`}
                    >
                      {m.file_type === 'photo' && m.signed_url && !m.external_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.signed_url} alt={m.caption ?? m.file_name} className="size-full object-cover" loading="lazy" />
                      ) : (
                        <span className="grid size-full place-items-center px-1 text-center text-[10px] text-muted-foreground">
                          {MEDIA_TYPE_META[m.file_type].label}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Lifecycle</CardTitle></CardHeader>
            <CardContent><SessionStatusControl sessionId={session.id} current={session.status} canEdit={canEdit} /></CardContent>
          </Card>

          {(canAssign || assignments.length > 0) && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><UserCheck className="size-4" /> Assigned team</CardTitle></CardHeader>
              <CardContent>
                <AssignmentPanel
                  sessionId={session.id}
                  assignments={assignments}
                  candidates={assignCandidates}
                  canAssign={canAssign}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users className="size-4" /> Team present</CardTitle></CardHeader>
            <CardContent>
              {session.attendance.filter((a) => a.status !== 'absent').length === 0 ? (
                <p className="text-sm text-muted-foreground">No attendance marked yet.</p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {session.attendance.filter((a) => a.status !== 'absent').map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-2">
                      <span>{a.user?.full_name ?? 'Member'}</span>
                      <StatusBadge label={statusLabel(a.status)} tone={a.status === 'present' ? 'success' : 'pending'} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function statusLabel(s: string) {
  return s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
function num(n: number | null) {
  return n == null ? '—' : String(n)
}
function Detail({ label, value, className }: { label: string; value?: string | null; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap font-medium">{value || '—'}</dd>
    </div>
  )
}
