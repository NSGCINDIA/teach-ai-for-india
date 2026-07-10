'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import {
  createOutreachVisitRequestSchema,
  reviewOutreachVisitRequestSchema,
} from '@/lib/validations/outreach-visit-requests'
import { formValues } from '@/lib/actions/form-values'

export type OutreachVisitRequestActionState = {
  error?: string; ok?: boolean; message?: string
  /** Submitted field values, echoed back so the form can repopulate itself after an error. */
  values?: Record<string, string>
}

/**
 * File an outreach visit request. The DB function enforces role + campus
 * scope and notifies the campus's Campus Lead + Finance Lead; this just
 * drives it (same shape as changeSchoolStatus / approvePlan).
 */
export async function createOutreachVisitRequest(
  _prev: OutreachVisitRequestActionState,
  formData: FormData,
): Promise<OutreachVisitRequestActionState> {
  const schoolId = String(formData.get('school_id') ?? '')
  const values = formValues(formData)
  await requireUser(`/dashboard/schools/${schoolId}`)

  const parsed = createOutreachVisitRequestSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message, values }

  const supabase = await createClient()
  const { error } = await supabase.rpc('create_outreach_visit_request', {
    p_school_id: parsed.data.school_id,
    p_purpose: parsed.data.purpose,
    p_proposed_visit_date: parsed.data.proposed_visit_date,
    p_estimated_travel_cost: parsed.data.estimated_travel_cost,
    p_team_member_ids: parsed.data.team_member_ids,
  })
  if (error) return { error: humanizeDbError(error.message), values }

  revalidatePath(`/dashboard/schools/${schoolId}`)
  revalidatePath(`/admin/schools/${schoolId}`)
  return { ok: true, message: 'Visit request submitted — the Campus and Finance Leads have been notified.' }
}

/** Campus Lead reviews school suitability for a visit request. */
export async function reviewOutreachVisitRequestCampus(
  _prev: OutreachVisitRequestActionState,
  formData: FormData,
): Promise<OutreachVisitRequestActionState> {
  const schoolId = String(formData.get('school_id') ?? '')
  const values = formValues(formData)
  await requireUser(`/dashboard/schools/${schoolId}`)

  const parsed = reviewOutreachVisitRequestSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message, values }

  const supabase = await createClient()
  const { error } = await supabase.rpc('review_outreach_visit_request_campus', {
    p_request_id: parsed.data.request_id,
    p_decision: parsed.data.decision,
    p_note: parsed.data.note || undefined,
  })
  if (error) return { error: humanizeDbError(error.message), values }

  revalidatePath(`/dashboard/schools/${schoolId}`)
  revalidatePath(`/admin/schools/${schoolId}`)
  return { ok: true, message: 'Review recorded.' }
}

/** Finance Lead reviews estimated travel cost against the campus budget. */
export async function reviewOutreachVisitRequestFinance(
  _prev: OutreachVisitRequestActionState,
  formData: FormData,
): Promise<OutreachVisitRequestActionState> {
  const schoolId = String(formData.get('school_id') ?? '')
  const values = formValues(formData)
  await requireUser(`/dashboard/schools/${schoolId}`)

  const parsed = reviewOutreachVisitRequestSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message, values }

  const supabase = await createClient()
  const { error } = await supabase.rpc('review_outreach_visit_request_finance', {
    p_request_id: parsed.data.request_id,
    p_decision: parsed.data.decision,
    p_note: parsed.data.note || undefined,
  })
  if (error) return { error: humanizeDbError(error.message), values }

  revalidatePath(`/dashboard/schools/${schoolId}`)
  revalidatePath(`/admin/schools/${schoolId}`)
  return { ok: true, message: 'Review recorded.' }
}

function humanizeDbError(msg: string): string {
  if (/already been reviewed/i.test(msg)) return 'This request has already been reviewed at this stage.'
  if (/permission/i.test(msg)) return 'You do not have permission for that action.'
  if (/reason is required/i.test(msg)) return 'A reason is required when rejecting.'
  if (/No budget allocated|No active budget period/i.test(msg)) return msg
  if (/Insufficient budget/i.test(msg)) return msg
  if (/outreach_visit_requests_one_pending_per_school/i.test(msg)) return 'This school already has an open visit request.'
  if (/not found/i.test(msg)) return 'That visit request could not be found.'
  return msg
}
