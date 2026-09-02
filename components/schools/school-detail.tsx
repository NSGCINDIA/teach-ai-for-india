import Link from 'next/link'
import { ArrowLeft, BookOpen, History, Mail, MapPin, Pencil, Phone, Star, Users } from 'lucide-react'
import type { SchoolDetail } from '@/lib/data/schools'
import type { SchoolStatusAccess, OutreachVisitRequestAccess, ExecutionPlanAccess, SchoolTeamAccess } from '@/lib/auth/rbac'
import type { OutreachVisitRequestRow, CampusBudgetRow, SessionRow } from '@/types/database'
import type { TeamMember } from '@/lib/data/sessions'
import type { SchoolTeamMemberDetail } from '@/lib/data/school-team'
import type { SchoolExecutionPlanDetail } from '@/lib/data/school-execution-plans'
import type { EvidenceListItem } from '@/lib/data/evidence'
import type { ActivityTimelineItem } from '@/lib/data/operational-expenses'
import { SCHOOL_STATUS_META } from '@/lib/constants/status'
import { curriculumStageLabel } from '@/lib/constants/sessions'
import { formatDateTime } from '@/lib/format'
import { deriveSchoolNextAction, type SchoolTabId } from '@/lib/schools/next-action'
import { Button } from '@/components/ui/button'
import { Tabs, type TabDef } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/shared/status-badge'
import { EntityMonogram } from '@/components/shared/entity-monogram'
import { SchoolCommandBar, TAB_LABELS } from '@/components/schools/school-command-bar'
import { LifecycleRail } from '@/components/schools/lifecycle-rail'
import { PlanningPanel } from '@/components/schools/planning-panel'
import { VisitRequestPanel } from '@/components/schools/visit-request-panel'
import { AddContact } from '@/components/schools/add-contact'
import { TeamPanel } from '@/components/schools/team-panel'
import { ExecutionPlanPanel } from '@/components/schools/execution-plan-panel'
import { SessionHub } from '@/components/schools/session-hub'
import { ActivityTimeline } from '@/components/schools/activity-timeline'

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
  readonly school: SchoolDetail
  readonly basePath: string
  /** May the signed-in user edit the profile / contacts / planning (campus-scoped)? */
  readonly canEdit: boolean
  /** Separate, possibly-narrower access to the pipeline status control (e.g. exec_lead). */
  readonly statusAccess: SchoolStatusAccess
  readonly visitRequests: readonly OutreachVisitRequestRow[]
  readonly roster: readonly TeamMember[]
  readonly budget: CampusBudgetRow | null
  readonly visitAccess: OutreachVisitRequestAccess
  readonly canApproveOnboarding: boolean
  readonly isAdmin: boolean
  readonly team?: readonly SchoolTeamMemberDetail[]
  readonly execPlan?: SchoolExecutionPlanDetail | null
  readonly sessions?: readonly SessionRow[]
  readonly execPlanAccess?: ExecutionPlanAccess
  readonly teamAccess?: SchoolTeamAccess
  readonly canVerifySession?: boolean
  readonly activityTimeline?: readonly ActivityTimelineItem[]
  /** Evidence (Drive/Docs links + uploads) for every session at this school. */
  readonly sessionEvidence?: readonly EvidenceListItem[]
}

const TYPE_LABEL: Record<string, string> = {
  government: 'Government', government_aided: 'Government Aided', private: 'Private',
}

/**
 * The School workspace.
 *
 * This page used to be one column containing every operational area at once —
 * pipeline, mission, details, visit request, onboarding, team, execution plan,
 * sessions, activity and contacts, each in its own card, all expanded, always.
 * The four questions someone actually opens a school to answer (where is it,
 * what is happening, what is blocked, what is next) were spread over several
 * screens of scrolling and three separate progress visualisations.
 *
 * The shape now is: header → command bar → lifecycle rail → tabs. The first two
 * screenfuls answer the four questions; the tabs hold the work. Nothing was
 * removed and no permission changed: every panel below is the same component
 * receiving the same props under the same condition it had before, and the tab
 * that holds it appears exactly when that section used to.
 */
export function SchoolDetailView({
  school, basePath, canEdit, statusAccess, visitRequests, roster, budget, visitAccess,
  canApproveOnboarding, isAdmin,
  team = [], execPlan = null, sessions = [],
  execPlanAccess = { canSubmit: false, canReviewCampus: false, canReviewFinance: false },
  teamAccess = { canManage: false },
  canVerifySession = false,
  activityTimeline = [],
  sessionEvidence = [],
}: SchoolDetailProps) {
  const isSessionsActiveOrDone = school.status === 'sessions_active' || school.status === 'completed'
  // 'completed' is the post-program state of a confirmed member (set when the
  // school closes out), so it still counts toward the confirmed team size.
  const confirmedVolunteers = team.filter(
    (t) => t.is_active && (t.status === 'confirmed' || t.status === 'completed'),
  ).length

  const next = deriveSchoolNextAction({ school, team, confirmedVolunteers, execPlan })

  // Every condition below is the one that gated the same section before the
  // rework — see the note on the component. The single addition is the
  // permission clause on Onboarding, which is *stricter*: PlanningPanel already
  // refused to render for those users and printed a "no permission" message
  // where a working section should have been.
  const showOutreach = VISIT_REQUEST_STATUSES.has(school.status) || visitRequests.length > 0
  const showOnboarding =
    (PLANNING_STATUSES.has(school.status) || !!school.plan) && (canEdit || canApproveOnboarding)

  // Overview is where a school with nothing outstanding points — a finished or
  // archived one. It is never where work happens, so it gets neither the
  // attention dot nor a "go to the work" button: both would be pointing at the
  // page you are already looking at.
  const hasOpenWork = next.tab !== 'overview'

  const tabs: TabDef[] = []
  const push = (id: SchoolTabId, content: React.ReactNode, extra?: Partial<TabDef>) => {
    tabs.push({ id, label: TAB_LABELS[id], content, attention: hasOpenWork && next.tab === id, ...extra })
  }

  push('overview', (
    <OverviewTab school={school} canEdit={canEdit} />
  ))

  if (showOutreach) {
    push('outreach', (
      <VisitRequestPanel
        schoolId={school.id}
        schoolStatus={school.status}
        requests={visitRequests}
        roster={roster}
        budget={budget}
        quarter={school.campus?.quarter ?? null}
        access={visitAccess}
      />
    ))
  }

  if (showOnboarding) {
    push('onboarding', (
      <PlanningPanel
        schoolId={school.id}
        schoolStatus={school.status}
        schoolDetail={school}
        plan={school.plan}
        canEdit={canEdit}
        canApprove={canApproveOnboarding}
      />
    ))
  }

  if (isSessionsActiveOrDone) {
    push('team', (
      <TeamPanel
        schoolId={school.id}
        team={team}
        roster={roster}
        requiredVolunteers={school.required_volunteers ?? 0}
        canManage={teamAccess.canManage}
      />
    ), { hint: `${confirmedVolunteers}/${school.required_volunteers ?? 2}` })

    push('execution', (
      <ExecutionPlanPanel
        schoolId={school.id}
        plan={execPlan}
        onboardingPlan={school.plan}
        teamConfirmed={confirmedVolunteers >= (school.required_volunteers ?? 2)}
        access={execPlanAccess}
        operationalPhase={school.operational_phase ?? null}
      />
    ))

    const verifiedSessions = sessions.filter((x) => x.status === 'verified').length
    push('sessions', (
      <SessionHub
        schoolId={school.id}
        sessions={sessions}
        evidence={sessionEvidence}
        team={team}
        canManage={statusAccess.canEdit || teamAccess.canManage}
        canVerify={canVerifySession}
        operationalPhase={school.operational_phase ?? null}
        isExecPlanApproved={execPlan?.status === 'approved' || school.status === 'completed' || school.operational_phase === 'execution_ready' || (!!school.operational_phase && school.operational_phase.startsWith('session_'))}
      />
    ), { hint: `${verifiedSessions}/4` })
  }

  push('activity', <ActivityTimeline items={activityTimeline} />, {
    hint: activityTimeline.length > 0 ? String(activityTimeline.length) : undefined,
  })

  const availableTabs = tabs.map((t) => t.id as SchoolTabId)
  const canOpenActionTab = availableTabs.includes(next.tab)
  // Land on the work, not on the summary — unless this viewer has no tab for it.
  const defaultTab: SchoolTabId = canOpenActionTab ? next.tab : 'overview'

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
        <Link href={basePath}><ArrowLeft className="size-4" /> All schools</Link>
      </Button>

      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-start gap-3">
          <EntityMonogram name={school.name} size="lg" className="mt-0.5" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 className="font-display text-2xl font-bold tracking-tight">{school.name}</h1>
              <StatusBadge kind="school" status={school.status} />
            </div>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
              <MapPin aria-hidden className="size-3.5 shrink-0" />
              <span>
                {[school.mandal, school.district, school.state].filter(Boolean).join(', ')}
                {' · '}{TYPE_LABEL[school.school_type] ?? school.school_type}
                {' · '}{school.board?.toUpperCase() ?? '—'}
                {school.campus?.name && <> · {school.campus.name}</>}
              </span>
            </p>
            {school.progress && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <BookOpen aria-hidden className="size-3.5 shrink-0" />
                Session {school.progress.latest_session_number} — {curriculumStageLabel(school.progress.latest_session_number)}
              </p>
            )}
          </div>
        </div>

        {canEdit && (
          <Button asChild variant="outline" size="sm">
            <Link href={`${basePath}/${school.id}/edit`}><Pencil className="size-4" /> Edit</Link>
          </Button>
        )}
      </header>

      <SchoolCommandBar
        status={school.status}
        operationalPhase={school.operational_phase ?? null}
        next={next}
        actionTabLabel={hasOpenWork && canOpenActionTab ? TAB_LABELS[next.tab] : null}
        stageSince={school.history[0]?.created_at ?? null}
      />

      <LifecycleRail
        schoolId={school.id}
        status={school.status}
        operationalPhase={school.operational_phase ?? null}
        requiredVolunteers={school.required_volunteers ?? 0}
        confirmedVolunteers={confirmedVolunteers}
        isAdmin={isAdmin}
        availableTabs={availableTabs}
      />

      <Tabs tabs={tabs} defaultTab={defaultTab} sticky />
    </div>
  )
}

/**
 * Overview — the school itself rather than the work on it: its record, who to
 * call, and how it got to where it is. The stage history used to sit in a right
 * rail, which on a phone put it below every operational panel on the page.
 */
function OverviewTab({ school, canEdit }: Readonly<{ school: SchoolDetail; canEdit: boolean }>) {
  return (
    <div className="space-y-6">
      {/* The programme's numbers, at the size they deserve. These were four
          identical small key/value pairs in a row — the same treatment the page
          gave a phone number — even though on a finished school they are the
          whole outcome. Set in the display face with tabular figures so the
          column reads as a result rather than as metadata. */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
        <Metric label="Students reached" value={school.total_students} />
        <Metric label="Sessions delivered" value={school.total_sessions} />
        <Metric label="Volunteers required" value={school.required_volunteers ?? 2} />
        <Detail label="Cluster" value={school.cluster} />
      </dl>

      <section className="space-y-3 border-t border-border/60 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Users aria-hidden className="size-4 text-muted-foreground" /> Contacts
          </h3>
          {canEdit && <AddContact schoolId={school.id} />}
        </div>

        {school.contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No contacts recorded yet.</p>
        ) : (
          <ul className="divide-y divide-border/60 rounded-xl border border-border/60 bg-paper">
            {school.contacts.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  {c.is_primary && <Star aria-hidden className="size-3.5 fill-warning text-warning" />}
                  {c.name}
                  <span className="font-normal text-muted-foreground">· {c.designation}</span>
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="flex items-center gap-1 hover:text-brand">
                      <Phone aria-hidden className="size-3" /> {c.phone}
                    </a>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-brand">
                      <Mail aria-hidden className="size-3" /> {c.email}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3 border-t border-border/60 pt-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <History aria-hidden className="size-4 text-muted-foreground" /> Stage history
        </h3>
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
                {h.note && <p className="mt-0.5 text-xs text-muted-foreground">&ldquo;{h.note}&rdquo;</p>}
                <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(h.created_at)}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}

function statusLabel(raw: string): string {
  return SCHOOL_STATUS_META[raw as keyof typeof SCHOOL_STATUS_META]?.label ?? raw
}

function Metric({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div>
      <dt className="field-label">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-bold leading-none tabular-nums text-foreground">
        {value.toLocaleString('en-IN')}
      </dd>
    </div>
  )
}

function Detail({ label, value }: Readonly<{ label: string; value?: string | null }>) {
  return (
    <div>
      <dt className="field-label">{label}</dt>
      <dd className="mt-1 font-medium">{value || '—'}</dd>
    </div>
  )
}
