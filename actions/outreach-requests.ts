'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import {
  createOutreachRequestSchema,
  reviewOutreachRequestSchema,
} from '@/lib/validations/outreach-requests'

export type OutreachRequestActionState = { error?: string; ok?: boolean; message?: string }

/**
 * File an outreach request for a school still at Lead Identified. The DB
 * function enforces role + campus scope, guards the school's status, and
 * notifies the campus's Campus Lead(s); this just drives it (same shape as
 * createOutreachVisitRequest / approvePlan).
 */
export async function createOutreachRequest(
  _prev: OutreachRequestActionState,
  formData: FormData,
): Promise<OutreachRequestActionState> {
  const schoolId = String(formData.get('school_id') ?? '')
  await requireUser(`/dashboard/schools/${schoolId}`)

  const parsed = createOutreachRequestSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.rpc('create_outreach_request', {
    p_school_id: parsed.data.school_id,
    p_reason: parsed.data.reason,
    p_proposed_approach: parsed.data.proposed_approach || undefined,
  })
  if (error) return { error: humanizeDbError(error.message) }

  revalidatePath(`/dashboard/schools/${schoolId}`)
  revalidatePath(`/admin/schools/${schoolId}`)
  return { ok: true, message: 'Outreach request filed — the Campus Lead has been notified.' }
}

/** Campus Lead approves/rejects an outreach request (single reviewer). */
export async function reviewOutreachRequest(
  _prev: OutreachRequestActionState,
  formData: FormData,
): Promise<OutreachRequestActionState> {
  const schoolId = String(formData.get('school_id') ?? '')
  await requireUser(`/dashboard/schools/${schoolId}`)

  const parsed = reviewOutreachRequestSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.rpc('review_outreach_request', {
    p_request_id: parsed.data.request_id,
    p_decision: parsed.data.decision,
    p_note: parsed.data.note || undefined,
  })
  if (error) return { error: humanizeDbError(error.message) }

  revalidatePath(`/dashboard/schools/${schoolId}`)
  revalidatePath(`/admin/schools/${schoolId}`)
  return { ok: true, message: 'Review recorded.' }
}

function humanizeDbError(msg: string): string {
  if (/already been reviewed/i.test(msg)) return 'This request has already been reviewed.'
  if (/permission/i.test(msg)) return 'You do not have permission for that action.'
  if (/reason is required/i.test(msg)) return 'A reason is required when rejecting.'
  if (/must be at Lead Identified/i.test(msg)) return msg
  if (/outreach_requests_one_pending_per_school/i.test(msg)) return 'This school already has an open outreach request.'
  if (/not found/i.test(msg)) return 'That outreach request could not be found.'
  return msg
}
