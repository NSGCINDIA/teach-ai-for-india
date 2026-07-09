'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import {
  createExecutionPlanSchema,
  reviewExecutionPlanSchema,
} from '@/lib/validations/execution-plans'

export type ExecutionPlanActionState = { error?: string; ok?: boolean; message?: string }

/**
 * Execution Lead submits an execution plan. The DB function enforces role +
 * campus scope and notifies the campus's Campus Leads; this just drives it
 * (same shape as createOutreachVisitRequest).
 */
export async function createExecutionPlan(
  _prev: ExecutionPlanActionState,
  formData: FormData,
): Promise<ExecutionPlanActionState> {
  const sessionId = String(formData.get('session_id') ?? '')
  await requireUser(`/dashboard/sessions/${sessionId}`)

  const parsed = createExecutionPlanSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.rpc('create_execution_plan', {
    p_session_id: parsed.data.session_id,
    p_logistics_notes: parsed.data.logistics_notes,
    p_has_laptop: parsed.data.has_laptop,
    p_has_projector: parsed.data.has_projector,
    p_has_hdmi_cable: parsed.data.has_hdmi_cable,
    p_has_extension_board: parsed.data.has_extension_board,
    p_has_speaker: parsed.data.has_speaker,
    p_has_internet_device: parsed.data.has_internet_device,
    p_other_equipment: parsed.data.other_equipment || undefined,
    p_teaching_resources: parsed.data.teaching_resources || undefined,
    p_estimated_transport_cost: parsed.data.estimated_transport_cost,
    p_session_ready: parsed.data.session_ready,
  })
  if (error) return { error: humanizeDbError(error.message) }

  revalidatePath(`/dashboard/sessions/${sessionId}`)
  revalidatePath(`/admin/sessions/${sessionId}`)
  return { ok: true, message: 'Execution plan submitted — the Campus Lead has been notified.' }
}

/** Campus Lead reviews the volunteer team, equipment, logistics, and readiness. */
export async function reviewExecutionPlanCampus(
  _prev: ExecutionPlanActionState,
  formData: FormData,
): Promise<ExecutionPlanActionState> {
  const sessionId = String(formData.get('session_id') ?? '')
  await requireUser(`/dashboard/sessions/${sessionId}`)

  const parsed = reviewExecutionPlanSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.rpc('review_execution_plan_campus', {
    p_plan_id: parsed.data.plan_id,
    p_decision: parsed.data.decision,
    p_note: parsed.data.note || undefined,
  })
  if (error) return { error: humanizeDbError(error.message) }

  revalidatePath(`/dashboard/sessions/${sessionId}`)
  revalidatePath(`/admin/sessions/${sessionId}`)
  return { ok: true, message: 'Review recorded.' }
}

/** Finance Lead reviews estimated transport cost against the campus budget. */
export async function reviewExecutionPlanFinance(
  _prev: ExecutionPlanActionState,
  formData: FormData,
): Promise<ExecutionPlanActionState> {
  const sessionId = String(formData.get('session_id') ?? '')
  await requireUser(`/dashboard/sessions/${sessionId}`)

  const parsed = reviewExecutionPlanSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.rpc('review_execution_plan_finance', {
    p_plan_id: parsed.data.plan_id,
    p_decision: parsed.data.decision,
    p_note: parsed.data.note || undefined,
  })
  if (error) return { error: humanizeDbError(error.message) }

  revalidatePath(`/dashboard/sessions/${sessionId}`)
  revalidatePath(`/admin/sessions/${sessionId}`)
  return { ok: true, message: 'Review recorded.' }
}

function humanizeDbError(msg: string): string {
  if (/already been reviewed/i.test(msg)) return 'This plan has already been reviewed at this stage.'
  if (/Campus Lead must approve/i.test(msg)) return msg
  if (/only available while the session is Planned/i.test(msg)) return msg
  if (/already has an approved execution plan/i.test(msg)) return msg
  if (/Confirm session readiness/i.test(msg)) return msg
  if (/permission/i.test(msg)) return 'You do not have permission for that action.'
  if (/reason is required|Logistics notes are required/i.test(msg)) return msg
  if (/No budget allocated|No active budget period/i.test(msg)) return msg
  if (/Insufficient budget/i.test(msg)) return msg
  if (/execution_plans_one_pending_per_session/i.test(msg)) return 'This session already has an open execution plan.'
  if (/not found/i.test(msg)) return 'That execution plan could not be found.'
  return msg
}
