'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import { can, canForEntity } from '@/lib/auth/rbac'
import { sessionPlanSchema, approvePlanSchema } from '@/lib/validations/plans'
import { formValues } from '@/lib/actions/form-values'
import type { SessionPlanStatus } from '@/types/database'


export type PlanActionState = {
  error?: string; ok?: boolean; message?: string
  /** Submitted field values, echoed back so the form can repopulate itself after an error. */
  values?: Record<string, string>
}

/** Empty strings → null so the DB stores NULL, not ''. Leaves booleans/numbers. */
function nullifyStrings<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj }
  for (const k in out) if (out[k] === '') (out as Record<string, unknown>)[k] = null
  return out
}

/**
 * Create or update a school's CURRENT OPEN (draft) planning record — the
 * outreach→execution handoff for its next session. A school accumulates one
 * approved session_plans row per session it's run (school lifecycle v2,
 * 0036/0037: session_plans allows only one 'draft' row per school at a time,
 * unlimited approved history), so this finds the existing draft and updates
 * it, or starts a fresh draft — "Plan next session" — when none is open.
 */
export async function savePlan(
  _prev: PlanActionState,
  formData: FormData,
): Promise<PlanActionState> {
  const schoolId = String(formData.get('school_id') ?? '')
  const values = formValues(formData)
  const user = await requireUser(`/dashboard/schools/${schoolId}`)
  if (can(user.role, 'edit_school') === false) {
    return { error: 'Only Outreach Lead or Campus Lead may edit or submit school onboarding details.', values }
  }

  const parsed = sessionPlanSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message, values }

  const payload = nullifyStrings(parsed.data)

  const supabase = await createClient()

  // Target the exact plan the form was rendered from when it tells us which one
  // that is. A school can hold an approved plan *and* a newer draft at the same
  // time (0036: one draft, unlimited approved history), so picking "the latest
  // row" could update a different plan than the one on screen. The id is still
  // scoped by school_id so a caller cannot reach another school's plan.
  const planId = String(formData.get('plan_id') ?? '')
  const { data: existingPlan } = planId
    ? await supabase
        .from('session_plans')
        .select('id, status')
        .eq('id', planId)
        .eq('school_id', schoolId)
        .maybeSingle()
    : await supabase
        .from('session_plans')
        .select('id, status')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

  // Fetch the school's current status
  const { data: school } = await supabase
    .from('schools')
    .select('status')
    .eq('id', schoolId)
    .single()


  const isPendingApproval = existingPlan?.status !== 'approved' && school?.status !== 'sessions_active'

  // Leave an existing plan's status alone. This used to hard-code 'draft', so
  // editing an already-approved plan silently un-approved the school's
  // onboarding — and where the school had since opened another draft it also
  // tripped the session_plans_one_draft_per_school unique index, surfacing a raw
  // duplicate-key error to the user. A brand-new plan still starts as a draft,
  // which is the column default anyway.
  const { error } = existingPlan
    ? await supabase.from('session_plans').update(payload).eq('id', existingPlan.id)
    : await supabase
        .from('session_plans')
        .insert({ ...payload, status: 'draft' satisfies SessionPlanStatus, created_by: user.id })

  if (error) return { error: error.message, values }

  revalidatePath(`/dashboard/schools/${schoolId}`)
  revalidatePath(`/admin/schools/${schoolId}`)
  revalidatePath('/dashboard/schools')
  revalidatePath('/admin/schools')

  const message = isPendingApproval
    ? 'Onboarding details submitted for Campus Lead review & approval! ✓'
    : 'Onboarding details updated.'

  return { ok: true, message }
}

/**
 * Approve a planning record → create the session, advance the school to
 * sessions_active (a no-op if it's already there for a later session), and
 * notify the campus Execution + Volunteer Leads. The DB function enforces
 * role + pipeline state; this just drives it.
 */
export async function approvePlan(
  _prev: PlanActionState,
  formData: FormData,
): Promise<PlanActionState> {
  const parsed = approvePlanSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'Missing planning record.' }
  const schoolId = String(formData.get('school_id') ?? '')
  const user = await requireUser(`/dashboard/schools/${schoolId}`)
  // Task 2: Strict Onboarding Readiness Validation
  const { getSchool } = await import('@/lib/data/schools')
  const { validateSchoolOnboardingReadiness } = await import('@/lib/validations/readiness-gate')
  const school = await getSchool(schoolId)

  if (!school || !canForEntity(user.role, 'approve_school_onboarding', user.campus_id, school.campus_id)) {
    return { error: 'Only the Campus Lead assigned to this school may verify and approve onboarding.' }
  }

  if (school) {
    const readiness = validateSchoolOnboardingReadiness(school, school.plan)
    if (!readiness.ready) {
      return {
        error: `Cannot approve onboarding: Incomplete requirements (${readiness.completed}/${readiness.total} complete). Missing: ${readiness.missing.join(', ')}.`,
      }
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('approve_session_plan', {
    p_plan_id: parsed.data.plan_id,
    p_letter_verified: true,
  })
  if (error) return { error: humanizeDbError(error.message) }

  revalidatePath(`/dashboard/schools/${schoolId}`)
  revalidatePath(`/admin/schools/${schoolId}`)
  revalidatePath('/dashboard/schools')
  revalidatePath('/admin/schools')
  return { ok: true, message: 'Approval letter verified. Onboarding approved and school activated.' }
}

function humanizeDbError(msg: string): string {
  if (/already approved/i.test(msg)) return 'This onboarding plan has already been approved.'
  if (/must be Registered/i.test(msg)) return 'School must be in Registered / Onboarding status before approval.'
  if (/permission/i.test(msg)) return 'You do not have permission to approve this onboarding plan.'
  return msg
}
