import Link from 'next/link'
import { ArrowLeft, ClipboardList, History, Mail, MapPin, MapPinned, Pencil, Phone, Star, Users } from 'lucide-react'
import type { SchoolDetail } from '@/lib/data/schools'
import type { SchoolStatusAccess, OutreachVisitRequestAccess } from '@/lib/auth/rbac'
import type { OutreachVisitRequestRow, CampusBudgetRow } from '@/types/database'
import type { TeamMember } from '@/lib/data/sessions'
import { SCHOOL_STATUS_META } from '@/lib/constants/status'
import { formatDate, formatDateTime } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { StatusControl } from '@/components/schools/status-control'
import { PlanningPanel } from '@/components/schools/planning-panel'
import { VisitRequestPanel } from '@/components/schools/visit-request-panel'
import { AddContact } from '@/components/schools/add-contact'

/** Planning becomes relevant once approval is received (or already started). */
const PLANNING_STATUSES = new Set<SchoolDetail['status']>([
  'approval_received', 'session_scheduled', 'session_in_progress', 'completed',
])

/** A visit request is relevant while a school is still early in the pipeline. */
const VISIT_REQUEST_STATUSES = new Set<SchoolDetail['status']>([
  'lead_identified', 'contacted', 'followup_pending', 'approval_requested',
])

interface SchoolDetailProps {
  school: SchoolDetail
  basePath: string
  /** May the signed-in user edit the profile / contacts / planning (campus-scoped)? */
  canEdit: boolean
  /** Separate, possibly-narrower access to the pipeline status control (e.g. exec_lead). */
  statusAccess: SchoolStatusAccess
  visitRequests: OutreachVisitRequestRow[]
  roster: TeamMember[]
  budget: CampusBudgetRow | null
  visitAccess: OutreachVisitRequestAccess
}

const TYPE_LABEL: Record<string, string> = {
  government: 'Government', government_aided: 'Government Aided', private: 'Private',
}

export function SchoolDetailView({
  school, basePath, canEdit, statusAccess, visitRequests, roster, budget, visitAccess,
}: SchoolDetailProps) {
  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link href={basePath}><ArrowLeft className="size-4" /> All schools</Link>
        </Button>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight">{school.name}</h1>
            <StatusBadge kind="school" status={school.status} />
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {[school.mandal, school.district, school.state].filter(Boolean).join(', ')}
            {' · '}{TYPE_LABEL[school.school_type]} · {school.board.toUpperCase()}
          </p>
        </div>
        {canEdit && (
          <Button asChild variant="outline" size="sm">
            <Link href={`${basePath}/${school.id}/edit`}><Pencil className="size-4" /> Edit</Link>
          </Button>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Detail label="Campus" value={school.campus?.name} />
              <Detail label="DISE code" value={school.dise_code} />
              <Detail label="Cluster" value={school.cluster} />
              <Detail label="Sessions" value={String(school.total_sessions)} />
              <Detail label="Students reached" value={String(school.total_students)} />
              <Detail label="Next action" value={formatDate(school.next_action_date)} />
              {school.notes && <Detail label="Notes" value={school.notes} className="col-span-2 sm:col-span-3" />}
            </CardContent>
          </Card>

          {(VISIT_REQUEST_STATUSES.has(school.status) || visitRequests.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPinned className="size-4" /> Outreach visit request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VisitRequestPanel
                  schoolId={school.id}
                  requests={visitRequests}
                  roster={roster}
                  budget={budget}
                  quarter={school.campus?.quarter ?? null}
                  access={visitAccess}
                />
              </CardContent>
            </Card>
          )}

          {(PLANNING_STATUSES.has(school.status) || school.plan) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardList className="size-4" /> Session planning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PlanningPanel
                  schoolId={school.id}
                  schoolStatus={school.status}
                  plan={school.plan}
                  canEdit={canEdit}
                  basePath={basePath}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base"><Users className="size-4" /> Contacts</CardTitle>
              {canEdit && <AddContact schoolId={school.id} />}
            </CardHeader>
            <CardContent className="space-y-3">
              {school.contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contacts recorded yet.</p>
              ) : (
                school.contacts.map((c) => (
                  <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
                    <div>
                      <p className="flex items-center gap-1.5 font-medium">
                        {c.is_primary && <Star className="size-3.5 fill-warning text-warning" />}
                        {c.name}
                        <span className="font-normal text-muted-foreground">· {c.designation}</span>
                      </p>
                      <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                        {c.phone && <span className="flex items-center gap-1"><Phone className="size-3" /> {c.phone}</span>}
                        {c.email && <span className="flex items-center gap-1"><Mail className="size-3" /> {c.email}</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Pipeline</CardTitle></CardHeader>
            <CardContent>
              <StatusControl
                schoolId={school.id}
                current={school.status}
                canEdit={statusAccess.canEdit}
                restrictTo={statusAccess.restrictTo}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><History className="size-4" /> Visit log</CardTitle></CardHeader>
            <CardContent>
              {school.history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No status changes yet.</p>
              ) : (
                <ol className="relative space-y-4 border-l border-border pl-4">
                  {school.history.map((h) => (
                    <li key={h.id} className="relative">
                      <span className="absolute -left-[1.4rem] top-1 size-2.5 rounded-full bg-brand ring-4 ring-background" aria-hidden />
                      <p className="text-sm">
                        {h.previous_status
                          ? <>Moved to <strong>{statusLabel(h.new_status)}</strong></>
                          : <>Created as <strong>{statusLabel(h.new_status)}</strong></>}
                      </p>
                      {h.note && <p className="mt-0.5 text-xs text-muted-foreground">“{h.note}”</p>}
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(h.created_at)}</p>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function statusLabel(raw: string): string {
  return SCHOOL_STATUS_META[raw as keyof typeof SCHOOL_STATUS_META]?.label ?? raw
}

function Detail({ label, value, className }: { label: string; value?: string | null; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value || '—'}</dd>
    </div>
  )
}
