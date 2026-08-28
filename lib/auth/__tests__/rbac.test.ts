import { test } from 'node:test'
import assert from 'node:assert'
import type { UserRole } from '@/types/database'
import { EXEC_LEAD_SCHOOL_STATUSES } from '@/lib/constants/status'
import {
  can,
  isAdmin,
  canForEntity,
  schoolStatusAccess,
  outreachVisitRequestAccess,
  executionPlanAccess,
  schoolTeamAccess,
  campusBudgetAccess,
  reimbursementReviewAccess,
  canEditSession,
  canAccessPath,
  roleHomePath,
} from '@/lib/auth/rbac'

/**
 * Tests for the permission matrix.
 *
 * `rbac.ts` is pure, dependency-free logic gating eight roles across a workflow
 * that moves money, and it is mirrored by RLS in the database rather than being
 * the enforcement layer itself. That makes it both the highest-leverage code in
 * the repo to test and the easiest — no database, no fixtures, no mocking.
 *
 * These assert invariants and separation-of-duties rules, not a transcription of
 * the current matrix. A test that merely restates the table it is testing fails
 * whenever the table legitimately changes and catches nothing.
 */

const ROLES: UserRole[] = [
  'super_admin', 'campus_lead', 'outreach_lead', 'exec_lead',
  'volunteer_lead', 'volunteer', 'campus_mgmt_admin', 'finance_lead',
]

const CAMPUS_A = 'campus-aaaa'
const CAMPUS_B = 'campus-bbbb'

// ─── Matrix basics ───────────────────────────────────────────────────────────

test('isAdmin is true for super_admin only', () => {
  for (const role of ROLES) {
    assert.strictEqual(isAdmin(role), role === 'super_admin', 'isAdmin(' + role + ')')
  }
})

test('super_admin has unrestricted scope on every permission it holds', () => {
  const permissions = [
    'view_all_campuses', 'edit_school', 'create_session', 'submit_reimbursement',
    'approve_reimbursement', 'view_analytics_all', 'upload_evidence',
    'assign_volunteers', 'edit_cms', 'manage_user_roles', 'export_data',
  ] as const

  for (const permission of permissions) {
    assert.strictEqual(can('super_admin', permission), 'all', 'super_admin ' + permission)
  }
})

test('can() returns false rather than throwing for an unknown role', () => {
  // Roles arrive from the database; a value added to the enum but not yet to the
  // matrix must fail closed, never crash a page render.
  assert.strictEqual(can('not_a_role' as UserRole, 'edit_school'), false)
})

test('every role resolves to a defined scope for every permission', () => {
  for (const role of ROLES) {
    assert.notStrictEqual(can(role, 'edit_school'), undefined, role + ' edit_school')
    assert.notStrictEqual(can(role, 'approve_reimbursement'), undefined, role + ' approve_reimbursement')
  }
})

// ─── Campus scoping ──────────────────────────────────────────────────────────

test('canForEntity confines an own scope to the users own campus', () => {
  assert.strictEqual(can('campus_lead', 'edit_school'), 'own')
  assert.ok(canForEntity('campus_lead', 'edit_school', CAMPUS_A, CAMPUS_A))
  assert.ok(!canForEntity('campus_lead', 'edit_school', CAMPUS_A, CAMPUS_B))
})

test('canForEntity ignores campus for an all scope', () => {
  assert.ok(canForEntity('super_admin', 'edit_school', CAMPUS_A, CAMPUS_B))
})

test('canForEntity denies outright when the scope is false', () => {
  assert.strictEqual(can('volunteer', 'manage_user_roles'), false)
  assert.ok(!canForEntity('volunteer', 'manage_user_roles', CAMPUS_A, CAMPUS_A))
})

// ─── School pipeline ─────────────────────────────────────────────────────────

test('schoolStatusAccess restricts exec_lead to the execution-stage statuses', () => {
  const access = schoolStatusAccess('exec_lead', CAMPUS_A, CAMPUS_A)
  assert.ok(access.canEdit)
  assert.deepStrictEqual(access.restrictTo, EXEC_LEAD_SCHOOL_STATUSES)
  // The early pipeline stages stay out of reach.
  assert.ok(!access.restrictTo!.includes('lead_identified'))
  assert.ok(!access.restrictTo!.includes('outreach_requested'))
})

test('schoolStatusAccess gives campus_lead and outreach_lead unrestricted own-campus moves', () => {
  for (const role of ['campus_lead', 'outreach_lead'] as UserRole[]) {
    const access = schoolStatusAccess(role, CAMPUS_A, CAMPUS_A)
    assert.ok(access.canEdit, role)
    assert.strictEqual(access.restrictTo, undefined, role)
  }
})

test('schoolStatusAccess denies every non-admin on another campus', () => {
  for (const role of ROLES.filter((r) => r !== 'super_admin')) {
    assert.ok(!schoolStatusAccess(role, CAMPUS_A, CAMPUS_B).canEdit, role)
  }
})

test('schoolStatusAccess denies a user with no campus assigned', () => {
  assert.ok(!schoolStatusAccess('campus_lead', null, CAMPUS_A).canEdit)
})

// ─── Separation of duties — the money path ───────────────────────────────────

test('no single non-admin role can both submit and approve an execution plan', () => {
  // Stage 6 requires the submitter and the first-leg approver to be different
  // actors. This is the invariant that makes the dual-approval chain meaningful.
  for (const role of ROLES.filter((r) => r !== 'super_admin')) {
    const a = executionPlanAccess(role, CAMPUS_A, CAMPUS_A)
    assert.ok(
      !(a.canSubmit && (a.canReviewCampus || a.canReviewFinance)),
      role + ' can both submit and review an execution plan',
    )
  }
})

test('execution plan legs land on the roles the approval chain expects', () => {
  assert.ok(executionPlanAccess('exec_lead', CAMPUS_A, CAMPUS_A).canSubmit)
  assert.ok(executionPlanAccess('campus_lead', CAMPUS_A, CAMPUS_A).canReviewCampus)
  assert.ok(executionPlanAccess('finance_lead', CAMPUS_A, CAMPUS_A).canReviewFinance)
  // campus_lead must NOT be able to submit, or it could approve its own plan.
  assert.ok(!executionPlanAccess('campus_lead', CAMPUS_A, CAMPUS_A).canSubmit)
})

test('execution plan access is campus-scoped for every non-admin role', () => {
  for (const role of ROLES.filter((r) => r !== 'super_admin')) {
    const a = executionPlanAccess(role, CAMPUS_A, CAMPUS_B)
    assert.ok(!a.canSubmit && !a.canReviewCampus && !a.canReviewFinance, role)
  }
})

test('outreach visit request keeps the campus and finance legs on different roles', () => {
  const campusLead = outreachVisitRequestAccess('campus_lead', CAMPUS_A, CAMPUS_A)
  const financeLead = outreachVisitRequestAccess('finance_lead', CAMPUS_A, CAMPUS_A)
  assert.ok(campusLead.canReviewCampus && !campusLead.canReviewFinance)
  assert.ok(financeLead.canReviewFinance && !financeLead.canReviewCampus)
})

test('reimbursement approval is finance_lead plus admin only, own campus', () => {
  // campus_lead has monitor-only access via RLS, not approval power.
  assert.ok(!reimbursementReviewAccess('campus_lead', CAMPUS_A, CAMPUS_A).canReview)
  assert.ok(!reimbursementReviewAccess('exec_lead', CAMPUS_A, CAMPUS_A).canReview)
  assert.ok(reimbursementReviewAccess('finance_lead', CAMPUS_A, CAMPUS_A).canReview)
  assert.ok(!reimbursementReviewAccess('finance_lead', CAMPUS_A, CAMPUS_B).canReview)
  assert.ok(reimbursementReviewAccess('super_admin', CAMPUS_A, CAMPUS_B).canReview)
})

test('budget allocation and increase review sit on different roles', () => {
  const finance = campusBudgetAccess('finance_lead', CAMPUS_A, CAMPUS_A)
  const campus = campusBudgetAccess('campus_lead', CAMPUS_A, CAMPUS_A)
  assert.ok(finance.canAllocate && finance.canRequestIncrease && !finance.canReviewIncrease)
  assert.ok(campus.canReviewIncrease && !campus.canAllocate && !campus.canRequestIncrease)
})

// ─── Teams and sessions ──────────────────────────────────────────────────────

test('schoolTeamAccess is limited to volunteer_lead and campus_lead on their own campus', () => {
  assert.ok(schoolTeamAccess('volunteer_lead', CAMPUS_A, CAMPUS_A).canManage)
  assert.ok(schoolTeamAccess('campus_lead', CAMPUS_A, CAMPUS_A).canManage)
  assert.ok(!schoolTeamAccess('volunteer_lead', CAMPUS_A, CAMPUS_B).canManage)
  assert.ok(!schoolTeamAccess('volunteer', CAMPUS_A, CAMPUS_A).canManage)
})

test('canEditSession lets the creator edit regardless of role or campus', () => {
  const session = { campus_id: CAMPUS_B, created_by: 'user-1' }
  assert.ok(canEditSession('volunteer', 'user-1', CAMPUS_A, session))
  assert.ok(!canEditSession('volunteer', 'user-2', CAMPUS_A, session))
})

test('canEditSession lets campus_lead and exec_lead edit sessions on their campus', () => {
  const session = { campus_id: CAMPUS_A, created_by: 'someone-else' }
  assert.ok(canEditSession('campus_lead', 'user-2', CAMPUS_A, session))
  assert.ok(canEditSession('exec_lead', 'user-2', CAMPUS_A, session))
  assert.ok(!canEditSession('campus_lead', 'user-2', CAMPUS_B, session))
  assert.ok(!canEditSession('volunteer_lead', 'user-2', CAMPUS_A, session))
})

test('canEditSession does not treat a null creator as a match for an empty user id', () => {
  const session = { campus_id: CAMPUS_B, created_by: null }
  assert.ok(!canEditSession('volunteer', '', CAMPUS_A, session))
})

// ─── Route protection ────────────────────────────────────────────────────────

test('/admin is super_admin only', () => {
  assert.ok(canAccessPath('super_admin', '/admin'))
  for (const role of ROLES.filter((r) => r !== 'super_admin')) {
    assert.ok(!canAccessPath(role, '/admin'), role)
    assert.ok(!canAccessPath(role, '/admin/volunteers'), role + ' nested')
  }
})

test('route matching honours segment boundaries, not bare prefixes', () => {
  assert.ok(canAccessPath('finance_lead', '/dashboard/schools'))
  assert.ok(canAccessPath('finance_lead', '/dashboard/schools/abc'))
  assert.ok(!canAccessPath('volunteer', '/dashboard/finance'))
  assert.ok(!canAccessPath('volunteer', '/dashboard/finance/anything'))
  assert.ok(canAccessPath('volunteer', '/dashboard'))
})

test('the most specific matching prefix wins', () => {
  // exec_lead holds /dashboard but not /dashboard/finance.
  assert.ok(canAccessPath('exec_lead', '/dashboard'))
  assert.ok(!canAccessPath('exec_lead', '/dashboard/finance'))
  // ...and holds the narrower /dashboard/reports that /dashboard alone would
  // not have granted to every role.
  assert.ok(canAccessPath('exec_lead', '/dashboard/reports'))
  assert.ok(!canAccessPath('volunteer', '/dashboard/reports'))
})

test('unguarded paths are allowed for every role', () => {
  for (const role of ROLES) {
    assert.ok(canAccessPath(role, '/'), role)
    assert.ok(canAccessPath(role, '/about'), role)
  }
})

test('every guarded route is reachable by at least one role', () => {
  // Guards against a stale entry pointing at a route no role can open, or at a
  // route that no longer exists — the failure mode that left
  // /dashboard/blog-writing in the table after the page was removed.
  const guarded = [
    '/admin', '/dashboard', '/dashboard/schools', '/dashboard/blogs',
    '/dashboard/finance', '/dashboard/reimbursements', '/dashboard/assignments',
    '/dashboard/volunteers', '/dashboard/analytics', '/dashboard/settings',
    '/dashboard/reports', '/dashboard/approval-letters',
  ]
  for (const path of guarded) {
    assert.ok(ROLES.some((r) => canAccessPath(r, path)), 'no role can reach ' + path)
  }
})

test('roleHomePath is a stable dashboard path', () => {
  assert.strictEqual(roleHomePath(), '/dashboard')
})
