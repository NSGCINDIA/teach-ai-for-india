'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import {
  submitSchoolExecutionPlanSchema,
  reviewSchoolExecutionPlanSchema,
} from '@/lib/validations/school-execution-plans'

export type SchoolExecutionPlanActionState = {
  error?: string
  ok?: boolean
  message?: string
  id?: string
}

/** Submit a school execution plan. */
export async function submitSchoolExecutionPlan(
  _prev: SchoolExecutionPlanActionState,
  formData: FormData,
): Promise<SchoolExecutionPlanActionState> {
  const user = await requireUser('/dashboard/schools')
  const raw = Object.fromEntries(formData)

  const parsed = submitSchoolExecutionPlanSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const d = parsed.data
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('submit_school_execution_plan', {
    p_school_id: d.school_id,
    p_laptops_count: d.laptops_count,
    p_projectors_count: d.projectors_count,
    p_hdmi_cables_count: d.hdmi_cables_count,
    p_extension_boards_count: d.extension_boards_count,
    p_teaching_kits_count: d.teaching_kits_count,
    p_speakers_count: d.speakers_count,
    p_other_equipment: d.other_equipment,
    p_distance_km: d.distance_km,
    p_transport_mode: d.transport_mode,
    p_estimated_travel_cost: d.estimated_travel_cost,
    p_meeting_departure_notes: d.meeting_departure_notes,
    p_transport_budget: d.transport_budget,
    p_materials_budget: d.materials_budget,
    p_equipment_budget: d.equipment_budget,
    p_other_budget: d.other_budget,
  })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/schools/${d.school_id}`)
  revalidatePath(`/admin/schools/${d.school_id}`)
  return { ok: true, message: 'Execution plan submitted for Campus Lead review.', id: data }
}

/** Campus Lead review of school execution plan. */
export async function reviewSchoolExecutionPlanCampus(
  _prev: SchoolExecutionPlanActionState,
  formData: FormData,
): Promise<SchoolExecutionPlanActionState> {
  const user = await requireUser('/dashboard/schools')

  const parsed = reviewSchoolExecutionPlanSchema.safeParse({
    plan_id: formData.get('plan_id'),
    decision: formData.get('decision'),
    comments: formData.get('comments') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('review_school_execution_plan_campus', {
    p_plan_id: parsed.data.plan_id,
    p_decision: parsed.data.decision,
    p_comments: parsed.data.comments,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/schools')
  return {
    ok: true,
    message: parsed.data.decision === 'approved'
      ? 'Approved and forwarded to Finance Lead.'
      : 'Changes requested.',
  }
}

/** Finance Lead review of school execution plan. */
export async function reviewSchoolExecutionPlanFinance(
  _prev: SchoolExecutionPlanActionState,
  formData: FormData,
): Promise<SchoolExecutionPlanActionState> {
  const user = await requireUser('/dashboard/schools')

  const parsed = reviewSchoolExecutionPlanSchema.safeParse({
    plan_id: formData.get('plan_id'),
    decision: formData.get('decision'),
    comments: formData.get('comments') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('review_school_execution_plan_finance', {
    p_plan_id: parsed.data.plan_id,
    p_decision: parsed.data.decision,
    p_comments: parsed.data.comments,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/schools')
  return {
    ok: true,
    message: parsed.data.decision === 'approved'
      ? 'Budget approved! School is now Execution Ready.'
      : 'Changes requested on budget.',
  }
}
