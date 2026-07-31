import Link from 'next/link'
import { ArrowLeft, BookOpen, ClipboardList, History, Mail, MapPin, MapPinned, Pencil, Phone, Star, Users, Wrench, Calendar } from 'lucide-react'
import type { SchoolDetail } from '@/lib/data/schools'
import type { SchoolStatusAccess, OutreachVisitRequestAccess, ExecutionPlanAccess, SchoolTeamAccess } from '@/lib/auth/rbac'
import type { OutreachVisitRequestRow, CampusBudgetRow, SessionRow } from '@/types/database'
import type { TeamMember } from '@/lib/data/sessions'
import type { SchoolTeamMemberDetail } from '@/lib/data/school-team'
import type { SchoolExecutionPlanDetail } from '@/lib/data/school-execution-plans'
import { SCHOOL_STATUS_META } from '@/lib/constants/status'
import { curriculumStageLabel } from '@/lib/constants/sessions'
import { formatDate, formatDateTime } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { StatusControl } from '@/components/schools/status-control'
import { PlanningPanel } from '@/components/schools/planning-panel'
import { VisitRequestPanel } from '@/components/schools/visit-request-panel'
import { AddContact } from '@/components/schools/add-contact'
import { OperationalProgress } from '@/components/schools/operational-progress'
import { TeamPanel } from '@/components/schools/team-panel'
import { ExecutionPlanPanel } from '@/components/schools/execution-plan-panel'
import { SessionHub } from '@/components/schools/session-hub'

/** Planning becomes relevant once outreach is approved (or registered / running sessions). */
const PLANNING_STATUSES = new Set<SchoolDetail['status']>([
  'outreach_approved', 'registered', 'sessions_active', 'completed',
])

/** Outreach Visit Request is the sole first gate for a fresh lead — it now
 *  drives lead_identified → outreach_requested → outreach_approved on its own
 *  (the separate Outreach Request feature was retired as redundant). */
const VISIT_REQUEST_STATUSES = new Set<SchoolDetail['status']>([
  'lead_identified', 'outreach_requested',
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
  canApproveOnboarding: boolean
  isAdmin: boolean
  team?: SchoolTeamMemberDetail[]
  execPlan?: SchoolExecutionPlanDetail | null
  sessions?: SessionRow[]
  execPlanAccess?: ExecutionPlanAccess
  teamAccess?: SchoolTeamAccess
  canVerifySession?: boolean
}

const TYPE_LABEL: Record<string, string> = {
  government: 'Government', government_aided: 'Government Aided', private: 'Private',
}

export function SchoolDetailView({
  school, basePath, canEdit, statusAccess, visitRequests, roster, budget, visitAccess,
  canApproveOnboarding, isAdmin,
  team = [], execPlan = null, sessions = [],
  execPlanAccess = { canSubmit: false, canReviewCampus: false, canReviewFinance: false },
  teamAccess = { canManage: false },
  canVerifySession = false,
}: SchoolDetailProps) {
  const isSessionsActiveOrDone = school.status === 'sessions_active' || school.status === 'completed'
  const confirmedVolunteers = team.filter((t) => t.is_active && t.status === 'confirmed').length

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
            {' · '}{TYPE_LABEL[school.school_type] ?? school.school_type} · {school.board?.toUpperCase() ?? '—'}
          </p>
          {school.progress && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <BookOpen className="size-3.5" />
              Session {school.progress.latest_session_number} — {curriculumStageLabel(school.progress.latest_session_number)}
            </p>
          )}
        </div>
        {canEdit && (
          <Button asChild variant="outline" size="sm">
            <Link href={`${basePath}/${school.id}/edit`}><Pencil className="size-4" /> Edit</Link>
          </Button>
        )}
      </header>

      {/* Full-width Pipeline Stepper */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusControl
            schoolId={school.id}
            current={school.status}
            canEdit={statusAccess.canEdit}
            restrictTo={statusAccess.restrictTo}
            isAdmin={isAdmin}
          />
        </CardContent>
      </Card>

      {/* Operational Mission & Next Action Card */}
      <OperationalMissionCard
        school={school}
        confirmedVolunteers={confirmedVolunteers}
        execPlan={execPlan}
        sessions={sessions}
      />

      {/* Operational Phase Sub-Workflow Progress */}
      {isSessionsActiveOrDone && (
        <OperationalProgress
          status={school.status}
          operationalPhase={school.operational_phase ?? null}
          requiredVolunteers={school.required_volunteers ?? 0}
          confirmedVolunteers={confirmedVolunteers}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Detail label="DISE code" value={school.dise_code} />
              <Detail label="Cluster" value={school.cluster} />
              <Detail label="Sessions" value={String(school.total_sessions)} />
              <Detail label="Students reached" value={String(school.total_students)} />
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
                  schoolStatus={school.status}
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
                  <ClipboardList className="size-4" /> School onboarding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PlanningPanel
                  schoolId={school.id}
                  schoolStatus={school.status}
                  schoolDetail={school}
                  plan={school.plan}
                  hasPriorSession={!!school.progress}
                  canEdit={canEdit}
                  canApprove={canApproveOnboarding}
                />
              </CardContent>
            </Card>
          )}

          {/* School Volunteer Team Panel */}
          {isSessionsActiveOrDone && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="size-4" /> School Volunteer Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TeamPanel
                  schoolId={school.id}
                  team={team}
                  roster={roster}
                  requiredVolunteers={school.required_volunteers ?? 0}
                  canManage={teamAccess.canManage}
                  schoolStatus={school.status}
                />
              </CardContent>
            </Card>
          )}

          {/* School Execution & Budget Plan Panel */}
          {isSessionsActiveOrDone && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wrench className="size-4" /> Execution & Budget Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ExecutionPlanPanel
                  schoolId={school.id}
                  plan={execPlan}
                  onboardingPlan={school.plan}
                  teamConfirmed={confirmedVolunteers >= (school.required_volunteers ?? 2)}
                  access={execPlanAccess}
                  schoolStatus={school.status}
                  operationalPhase={school.operational_phase ?? null}
                />
              </CardContent>
            </Card>
          )}

          {/* Sessions 1–4 Delivery Hub */}
          {isSessionsActiveOrDone && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="size-4" /> Bounded 4-Session Program
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SessionHub
                  schoolId={school.id}
                  sessions={sessions}
                  team={team}
                  canManage={statusAccess.canEdit || teamAccess.canManage}
                  canVerify={canVerifySession}
                  schoolStatus={school.status}
                  operationalPhase={school.operational_phase ?? null}
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

function OperationalMissionCard({
  school,
  confirmedVolunteers,
  execPlan,
  sessions,
}: {
  school: SchoolDetail
  confirmedVolunteers: number
  execPlan: any
  sessions: SessionRow[]
}) {
  let owner = 'Outreach Lead'
  let nextAction = 'Submit Outreach Visit Request'

  if (school.status === 'outreach_requested') {
    owner = 'Campus Lead & Finance Lead'
    nextAction = 'Awaiting Outreach Visit Approval'
  } else if (school.status === 'outreach_approved') {
    owner = 'Outreach Lead / Campus Lead'
    nextAction = 'Initiate School Onboarding'
  } else if (school.status === 'registered') {
    owner = 'Campus Lead / Outreach Lead'
    nextAction = 'Complete Onboarding Details & Approval Letter'
  } else if (school.status === 'sessions_active') {
    const phase = school.operational_phase ?? 'team_preparation'
    if (phase === 'team_preparation') {
      owner = 'Volunteer Lead'
      nextAction = `Build Volunteer Team (${confirmedVolunteers}/${school.required_volunteers ?? 2} confirmed)`
    } else if (phase === 'team_ready' || phase === 'execution_planning') {
      owner = 'Execution Lead'
      nextAction = 'Submit School Execution & Budget Plan'
    } else if (phase === 'execution_ready') {
      owner = 'Execution Lead'
      nextAction = 'Schedule Session 1 Delivery'
    } else if (phase.endsWith('_planning') || phase.endsWith('_ready')) {
      owner = 'Execution Lead'
      nextAction = 'Deliver Scheduled Session'
    } else if (phase.endsWith('_submitted') || phase.endsWith('_report_required')) {
      owner = 'Campus Lead'
      nextAction = 'Review & Verify Session Delivery Report'
    }
  } else if (school.status === 'completed') {
    owner = 'All Teams'
    nextAction = 'School Program Successfully Completed! 🎓'
  }

  return (
    <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 shadow-sm space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-brand">Current Operational Mission</span>
          <h3 className="text-base font-bold text-foreground leading-tight mt-0.5">
            {SCHOOL_STATUS_META[school.status]?.label ?? school.status}
            {school.operational_phase ? ` · ${school.operational_phase.replace(/_/g, ' ')}` : ''}
          </h3>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-medium">Owner</span>
            <strong className="font-semibold text-foreground">{owner}</strong>
          </div>
        </div>
      </div>

      <div className="border-t border-brand/10 pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-muted-foreground font-medium">Next Required Action:</span>{' '}
          <strong className="text-brand font-bold">{nextAction}</strong>
        </div>
      </div>
    </div>
  )
}
