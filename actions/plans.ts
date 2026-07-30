'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { sessionPlanSchema, approvePlanSchema } from '@/lib/validations/plans'
import { formValues } from '@/lib/actions/form-values'

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
    return { error: 'You do not have permission to edit onboarding.', values }
  }

  const parsed = sessionPlanSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message, values }

  const payload = nullifyStrings(parsed.data)

  const supabase = await createClient()
  
  // Find the latest plan (whether draft or approved)
  const { data: existingPlan } = await supabase
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

  const isNewOnboarding = school?.status === 'registered'

  // If new onboarding, we automatically approve the plan
  const finalStatus = isNewOnboarding ? 'approved' : (existingPlan?.status ?? 'approved')
  const approvalFields = isNewOnboarding ? {
    approved_by: user.id,
    approved_at: new Date().toISOString(),
  } : {}

  const payloadWithStatus = {
    ...payload,
    status: finalStatus,
    ...approvalFields,
  }

  const { error } = existingPlan
    ? await supabase.from('session_plans').update(payloadWithStatus).eq('id', existingPlan.id)
    : await supabase.from('session_plans').insert({ ...payloadWithStatus, created_by: user.id })

  if (error) return { error: error.message, values }

  if (isNewOnboarding) {
    // Transition the school status to sessions_active (Active School)
    const { error: statusError } = await supabase.rpc('change_school_status', {
      p_school_id: schoolId,
      p_new_status: 'sessions_active',
      p_note: 'School onboarding completed',
    })
    if (statusError) {
      console.error('Failed to transition school status to sessions_active:', statusError.message)
    }
  }

  revalidatePath(`/dashboard/schools/${schoolId}`)
  revalidatePath(`/admin/schools/${schoolId}`)
  revalidatePath('/dashboard/schools')
  revalidatePath('/admin/schools')
  
  return { ok: true, message: isNewOnboarding ? 'School onboarded successfully.' : 'Onboarding details updated.' }
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
  if (can(user.role, 'edit_school') === false) {
    return { error: 'You do not have permission to approve planning.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('approve_session_plan', { p_plan_id: parsed.data.plan_id })
  if (error) return { error: humanizeDbError(error.message) }

  revalidatePath(`/dashboard/schools/${schoolId}`)
  revalidatePath(`/admin/schools/${schoolId}`)
  revalidatePath('/dashboard/sessions')
  revalidatePath('/admin/sessions')
  return { ok: true, message: 'Planning approved — session created and the team has been notified.' }
}

function humanizeDbError(msg: string): string {
  if (/already approved/i.test(msg)) return 'This planning record has already been approved.'
  if (/must be Registered/i.test(msg)) return 'Move the school to Registered before approving planning.'
  if (/permission/i.test(msg)) return 'You do not have permission to approve this planning record.'
  return msg
}
