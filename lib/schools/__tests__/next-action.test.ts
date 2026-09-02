import { test } from 'node:test'
import assert from 'node:assert'
import type { OperationalPhase, SchoolStatus } from '@/types/database'
import type { SchoolDetail } from '@/lib/data/schools'
import type { SchoolTeamMemberDetail } from '@/lib/data/school-team'
import type { SchoolExecutionPlanDetail } from '@/lib/data/school-execution-plans'
import { deriveSchoolNextAction } from '@/lib/schools/next-action'
import { formatElapsed } from '@/lib/format'

/**
 * These pin the owner/action strings the School Detail page has always printed,
 * so lifting the derivation out of the component cannot silently reword the one
 * sentence the whole page is built around. The `tab` assertions pin where the
 * work lives, which is what the default tab and the primary button follow.
 */

function school(
  status: SchoolStatus,
  operational_phase: OperationalPhase | null = null,
  overrides: Partial<SchoolDetail> = {},
): SchoolDetail {
  return {
    status,
    operational_phase,
    required_volunteers: 2,
    campus_id: 'campus-1',
    plan: null,
    contacts: [],
    history: [],
    progress: null,
    ...overrides,
  } as unknown as SchoolDetail
}

const derive = (
  s: SchoolDetail,
  opts: {
    confirmed?: number
    execPlan?: SchoolExecutionPlanDetail | null
    team?: SchoolTeamMemberDetail[]
  } = {},
) =>
  deriveSchoolNextAction({
    school: s,
    team: opts.team ?? [],
    confirmedVolunteers: opts.confirmed ?? 0,
    execPlan: opts.execPlan ?? null,
  })

const execPlan = (status: SchoolExecutionPlanDetail['status']) =>
  ({ status }) as SchoolExecutionPlanDetail

test('a fresh lead is owned by the Outreach Lead', () => {
  const r = derive(school('lead_identified'))
  assert.equal(r.owner, 'Outreach Lead')
  assert.equal(r.action, 'Submit Outreach Visit Request')
  assert.equal(r.tab, 'outreach')
})

test('a requested outreach visit is waiting on two reviewers', () => {
  const r = derive(school('outreach_requested'))
  assert.equal(r.owner, 'Campus Lead & Finance Lead')
  assert.equal(r.action, 'Awaiting Outreach Visit Approval')
  assert.equal(r.tab, 'outreach')
})

test('an approved outreach visit points at onboarding', () => {
  const r = derive(school('outreach_approved'))
  assert.equal(r.action, 'Initiate School Onboarding')
  assert.equal(r.tab, 'onboarding')
})

test('a registered school is completing its onboarding details', () => {
  const r = derive(school('registered'))
  assert.equal(r.owner, 'Campus Lead / Outreach Lead')
  assert.equal(r.action, 'Complete Onboarding Details & Approval Letter')
  assert.equal(r.tab, 'onboarding')
})

test('team preparation counts confirmed volunteers into the sentence', () => {
  const r = derive(school('sessions_active', 'team_preparation', { required_volunteers: 3 } as Partial<SchoolDetail>), {
    confirmed: 1,
  })
  assert.equal(r.owner, 'Volunteer Lead')
  assert.equal(r.action, 'Build Volunteer Team (1/3 confirmed)')
  assert.equal(r.tab, 'team')
  assert.equal(r.gate?.kind, 'team')
})

test('execution planning follows the execution plan status', () => {
  const base = school('sessions_active', 'execution_planning')

  assert.equal(derive(base).action, 'Submit School Execution & Budget Plan')
  assert.equal(derive(base, { execPlan: execPlan('submitted') }).owner, 'Campus Lead')
  assert.equal(
    derive(base, { execPlan: execPlan('submitted') }).action,
    'Awaiting Campus Lead Execution Plan Review',
  )
  assert.equal(derive(base, { execPlan: execPlan('campus_approved') }).owner, 'Finance Lead')
  assert.equal(
    derive(base, { execPlan: execPlan('campus_changes_requested') }).action,
    'Resubmit Execution Plan (Changes Requested)',
  )
  assert.equal(derive(base).tab, 'execution')
  assert.equal(derive(base).gate?.kind, 'execution')
})

test('an approved execution plan schedules Session 1', () => {
  const r = derive(school('sessions_active', 'execution_ready'))
  assert.equal(r.action, 'Schedule Session 1 Delivery')
  assert.equal(r.tab, 'sessions')
})

test('a submitted session report is waiting on the Campus Lead', () => {
  for (const phase of ['session_2_submitted', 'session_2_report_required'] as OperationalPhase[]) {
    const r = derive(school('sessions_active', phase))
    assert.equal(r.owner, 'Campus Lead')
    assert.equal(r.action, 'Review & Verify Session Delivery Report')
  }
})

test('a verified session schedules the next one, and the fourth closes out', () => {
  assert.equal(
    derive(school('sessions_active', 'session_1_verified')).action,
    'Schedule Session 2 Delivery',
  )
  assert.equal(
    derive(school('sessions_active', 'session_4_verified')).action,
    'All 4 Sessions Verified — Closing Out School Program',
  )
})

test('a session in progress stays in the execution story', () => {
  // Regression: this phase (set by the delivery trigger when a session moves
  // planned → in_progress) matched none of the phase families, so the page fell
  // back to the fresh-lead copy and told a school mid-delivery to "Submit
  // Outreach Visit Request".
  const r = derive(school('sessions_active', 'session_3_in_progress'))
  assert.equal(r.owner, 'Execution Lead')
  assert.equal(r.action, 'Deliver Scheduled Session')
  assert.equal(r.tab, 'sessions')
})

test('a completed school celebrates and gates nothing', () => {
  const r = derive(school('completed'))
  assert.equal(r.owner, 'All Teams')
  assert.equal(r.action, 'School Program Successfully Completed! 🎓')
  assert.equal(r.tab, 'overview')
  assert.equal(r.gate, null)
})

// ── formatElapsed ────────────────────────────────────────────────────────────
// Lives here rather than in its own file because the only thing that reads it is
// the command bar's "in this stage for …" line.

test('formatElapsed reads as a duration, not a timestamp', () => {
  const now = new Date('2026-08-31T12:00:00Z')
  const ago = (days: number) =>
    formatElapsed(new Date(now.getTime() - days * 86_400_000).toISOString(), now)

  assert.equal(ago(0), 'today')
  assert.equal(ago(1), '1 day')
  assert.equal(ago(9), '9 days')
  assert.equal(ago(21), '3 weeks')
  assert.equal(ago(120), '4 months')
})

test('formatElapsed returns null for missing or future dates', () => {
  const now = new Date('2026-08-31T12:00:00Z')
  assert.equal(formatElapsed(null, now), null)
  assert.equal(formatElapsed('not a date', now), null)
  assert.equal(formatElapsed('2026-09-30T00:00:00Z', now), null)
})

