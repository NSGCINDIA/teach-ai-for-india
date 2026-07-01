'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { sessionPlanSchema, approvePlanSchema } from '@/lib/validations/plans'

export type PlanActionState = { error?: string; ok?: boolean; message?: string }

/** Empty strings → null so the DB stores NULL, not ''. Leaves booleans/numbers. */
function nullifyStrings<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj }
  for (const k in out) if (out[k] === '') (out as Record<string, unknown>)[k] = null
  return out
}

/**
 * Create or update a school's planning record (the outreach→execution handoff,
 * Team Dashboard PRD Phase 2). One record per school; upsert on school_id.
 */
export async function savePlan(
  _prev: PlanActionState,
  formData: FormData,
): Promise<PlanActionState> {
  const schoolId = String(formData.get('school_id') ?? '')
  const user = await requireUser(`/dashboard/schools/${schoolId}`)
  if (can(user.role, 'edit_school') === false) {
    return { error: 'You do not have permission to edit planning.' }
  }

  const parsed = sessionPlanSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const payload = nullifyStrings({ ...parsed.data, created_by: user.id })

  const supabase = await createClient()
  const { error } = await supabase
    .from('session_plans')
    .upsert(payload, { onConflict: 'school_id' })
  if (error) return { error: error.message }

  revalidatePath(`/dashboard/schools/${schoolId}`)
  revalidatePath(`/admin/schools/${schoolId}`)
  return { ok: true, message: 'Planning saved.' }
}

/**
 * Approve a planning record → create the session, advance the school to
 * session_scheduled, and notify the campus Execution + Volunteer Leads.
 * The DB function enforces role + pipeline state; this just drives it.
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
  if (/Approval Received/i.test(msg)) return 'Move the school to Approval Received before approving planning.'
  if (/permission/i.test(msg)) return 'You do not have permission to approve this planning record.'
  return msg
}
