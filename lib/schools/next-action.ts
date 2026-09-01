import type { SchoolDetail } from '@/lib/data/schools'
import type { SchoolTeamMemberDetail } from '@/lib/data/school-team'
import type { SchoolExecutionPlanDetail } from '@/lib/data/school-execution-plans'
import type { GateResult } from '@/lib/validations/readiness-gate'
import { validateSchoolOnboardingReadiness } from '@/lib/validations/readiness-gate'
import { validateSchoolTeamReadiness } from '@/lib/validations/team-readiness'
import { validateSchoolExecutionReadiness } from '@/lib/validations/execution-readiness'

/**
 * The tabs of the School Detail workspace. Ordered as they appear.
 */
export type SchoolTabId =
  | 'overview' | 'outreach' | 'onboarding' | 'team' | 'execution' | 'sessions' | 'activity'

export interface SchoolNextAction {
  /** Which team/role the ball is with, e.g. "Campus Lead". */
  owner: string
  /** The one sentence answering "what has to happen next". */
  action: string
  /** The tab that owns this action — used for the default tab and the primary link. */
  tab: SchoolTabId
  /**
   * The readiness gate that is relevant *right now*, or null when nothing is
   * gated (fresh lead, closed-out school). Never a new rule: this is one of the
   * three existing validators, chosen inside the same branch that chooses the
   * owner and the action, so the banner and the tab can never disagree.
   */
  gate: GateResult | null
}

export interface SchoolNextActionInput {
  readonly school: SchoolDetail
  /** Every school_team_members row for this school (active and inactive). */
  readonly team: readonly SchoolTeamMemberDetail[]
  /** Active members counted as confirmed — 'confirmed' or the post-program 'completed'. */
  readonly confirmedVolunteers: number
  readonly execPlan: SchoolExecutionPlanDetail | null
}

/**
 * "Where is this school, and what has to happen next?"
 *
 * Lifted verbatim out of the OperationalMissionCard that used to live inside
 * school-detail.tsx, so the strings the product has always shown are unchanged.
 * Two fields were added — `tab` and `gate` — and both are navigation/presentation
 * only: `tab` says where the work lives, `gate` reuses an existing validator.
 * Nothing here decides anything the database or RBAC decides.
 */
export function deriveSchoolNextAction({
  school,
  team,
  confirmedVolunteers,
  execPlan,
}: Readonly<SchoolNextActionInput>): SchoolNextAction {
  const activeMembers = team.filter((m) => m.is_active)
  const requiredVolunteers = school.required_volunteers ?? 2

  const onboardingGate = () =>
    school.plan ? validateSchoolOnboardingReadiness(school, school.plan) : null
  const teamGate = () => validateSchoolTeamReadiness(requiredVolunteers, activeMembers)

  switch (school.status) {
    case 'outreach_requested':
      return {
        owner: 'Campus Lead & Finance Lead',
        action: 'Awaiting Outreach Visit Approval',
        tab: 'outreach',
        gate: null,
      }

    case 'outreach_approved':
      return {
        owner: 'Outreach Lead / Campus Lead',
        action: 'Initiate School Onboarding',
        tab: 'onboarding',
        gate: onboardingGate(),
      }

    case 'registered':
      return {
        owner: 'Campus Lead / Outreach Lead',
        action: 'Complete Onboarding Details & Approval Letter',
        tab: 'onboarding',
        gate: onboardingGate(),
      }

    case 'sessions_active':
      return deriveSessionsActiveNextAction(school, confirmedVolunteers, execPlan, teamGate)

    case 'completed':
      return {
        owner: 'All Teams',
        action: 'School Program Successfully Completed! 🎓',
        tab: 'overview',
        gate: null,
      }

    // lead_identified, archived, and anything else: the pipeline starts at outreach.
    default:
      return { owner: 'Outreach Lead', action: 'Submit Outreach Visit Request', tab: 'outreach', gate: null }
  }
}

function deriveSessionsActiveNextAction(
  school: SchoolDetail,
  confirmedVolunteers: number,
  execPlan: SchoolExecutionPlanDetail | null,
  teamGate: () => GateResult,
): SchoolNextAction {
  const phase = school.operational_phase ?? 'team_preparation'

  if (phase === 'team_preparation') {
    return {
      owner: 'Volunteer Lead',
      action: `Build Volunteer Team (${confirmedVolunteers}/${school.required_volunteers ?? 2} confirmed)`,
      tab: 'team',
      gate: teamGate(),
    }
  }

  if (phase === 'team_ready' || phase === 'execution_planning') {
    // The team is past its own gate by definition here, which is what
    // ExecutionPlanPanel itself assumes (isTeamReady).
    return deriveExecutionPlanNextAction(execPlan, validateSchoolExecutionReadiness(execPlan, true))
  }

  if (phase === 'execution_ready') {
    return { owner: 'Execution Lead', action: 'Schedule Session 1 Delivery', tab: 'sessions', gate: null }
  }

  if (phase.endsWith('_planning') || phase.endsWith('_ready')) {
    return { owner: 'Execution Lead', action: 'Deliver Scheduled Session', tab: 'sessions', gate: null }
  }

  if (phase.endsWith('_submitted') || phase.endsWith('_report_required')) {
    return { owner: 'Campus Lead', action: 'Review & Verify Session Delivery Report', tab: 'sessions', gate: null }
  }

  if (phase.endsWith('_verified')) {
    return deriveVerifiedSessionNextAction(phase)
  }

  // Any phase the five families above do not cover keeps the sessions_active
  // default rather than falling through to the fresh-lead copy.
  return { owner: 'Execution Lead', action: 'Deliver Scheduled Session', tab: 'sessions', gate: null }
}

function deriveExecutionPlanNextAction(
  execPlan: SchoolExecutionPlanDetail | null,
  gate: GateResult,
): SchoolNextAction {
  if (execPlan?.status === 'submitted') {
    return { owner: 'Campus Lead', action: 'Awaiting Campus Lead Execution Plan Review', tab: 'execution', gate }
  }
  if (execPlan?.status === 'campus_approved') {
    return { owner: 'Finance Lead', action: 'Awaiting Finance Lead Budget Approval', tab: 'execution', gate }
  }
  if (execPlan?.status === 'campus_changes_requested' || execPlan?.status === 'finance_changes_requested') {
    return { owner: 'Execution Lead', action: 'Resubmit Execution Plan (Changes Requested)', tab: 'execution', gate }
  }
  return { owner: 'Execution Lead', action: 'Submit School Execution & Budget Plan', tab: 'execution', gate }
}

// A verified session either unlocks the next one or closes the program out.
// Never fall through to the outreach default here.
function deriveVerifiedSessionNextAction(phase: string): SchoolNextAction {
  const verifiedNumber = Number(/^session_(\d)_verified$/.exec(phase)?.[1] ?? 0)
  if (verifiedNumber > 0 && verifiedNumber < 4) {
    return {
      owner: 'Execution Lead',
      action: `Schedule Session ${verifiedNumber + 1} Delivery`,
      tab: 'sessions',
      gate: null,
    }
  }
  return {
    owner: 'Campus Lead',
    action: 'All 4 Sessions Verified — Closing Out School Program',
    tab: 'sessions',
    gate: null,
  }
}
