'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import { can, isAdmin } from '@/lib/auth/rbac'
import {
  claimSchema, claimUpdateSchema, submitClaimSchema, reviewClaimSchema, payClaimSchema,
} from '@/lib/validations/finance'

export type FinanceActionState = { error?: string; ok?: boolean; message?: string }

function humanize(msg: string): string {
  if (/must be linked to a session/i.test(msg)) return 'Pick the session this claim is for.'
  if (/Claim window of .* days has passed/i.test(msg)) return 'The claim window for this session has passed.'
  if (/Illegal reimbursement transition/i.test(msg)) return 'That status change is not allowed.'
  if (/Paid claims can only be modified/i.test(msg)) return 'Paid claims can only be changed by a Super Admin.'
  if (/Only approved claims can be marked as paid/i.test(msg)) return msg
  if (/reason is required when rejecting/i.test(msg)) return 'A reason is required when rejecting.'
  if (/row-level security|permission/i.test(msg)) return 'You do not have permission for that change.'
  return msg
}

export async function createClaim(
  _prev: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  const user = await requireUser('/dashboard/reimbursements')
  if (can(user.role, 'submit_reimbursement') === false) {
    return { error: 'Your role cannot submit reimbursement claims.' }
  }
  const parsed = claimSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const d = parsed.data

  const supabase = await createClient()
  const { data: session } = await supabase.from('sessions').select('campus_id').eq('id', d.session_id).single()

  const { data, error } = await supabase
    .from('reimbursements')
    .insert({
      claimant_id: user.id,
      session_id: d.session_id,
      campus_id: session?.campus_id ?? user.campus_id ?? null,
      amount: d.amount,
      travel_mode: d.travel_mode,
      claim_date: d.claim_date,
      reason: d.reason || null,
      status: 'draft',
    })
    .select('id')
    .single()
  if (error) return { error: humanize(error.message) }

  revalidatePath('/dashboard/reimbursements')
  redirect(`/dashboard/reimbursements/${data.id}`)
}

export async function updateClaim(
  _prev: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  const parsed = claimUpdateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  await requireUser('/dashboard/reimbursements')
  const d = parsed.data

  const supabase = await createClient()
  const { error } = await supabase
    .from('reimbursements')
    .update({
      session_id: d.session_id,
      amount: d.amount,
      travel_mode: d.travel_mode,
      claim_date: d.claim_date,
      reason: d.reason || null,
    })
    .eq('id', d.id)
  if (error) return { error: humanize(error.message) }

  revalidatePath(`/dashboard/reimbursements/${d.id}`)
  revalidatePath('/dashboard/reimbursements')
  return { ok: true, message: 'Claim saved.' }
}

export async function submitClaim(
  _prev: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  const parsed = submitClaimSchema.safeParse({ id: formData.get('id') })
  if (!parsed.success) return { error: 'Invalid claim.' }
  await requireUser('/dashboard/reimbursements')

  const supabase = await createClient()
  // DB enforces eligibility + raises anomaly flags (may auto-route to under_review).
  const { error } = await supabase.from('reimbursements').update({ status: 'submitted' }).eq('id', parsed.data.id)
  if (error) return { error: humanize(error.message) }

  revalidatePath(`/dashboard/reimbursements/${parsed.data.id}`)
  revalidatePath('/dashboard/reimbursements')
  revalidatePath('/admin/finance')
  return { ok: true, message: 'Claim submitted.' }
}

/**
 * Review a claim (approve/reject/hold). Goes through review_reimbursement_finance()
 * — the same RPC serves admins and finance_lead (campus-scoped), matching the
 * Phase 2/3 pattern rather than a parallel finance-lead-only path; this also
 * gives admin reviews an audit_log trail they didn't have before.
 */
export async function reviewClaim(
  _prev: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  const parsed = reviewClaimSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const user = await requireUser()
  if (!isAdmin(user.role) && user.role !== 'finance_lead') {
    return { error: 'Only Finance Lead or management can review claims.' }
  }
  const d = parsed.data

  const supabase = await createClient()
  const { error } = await supabase.rpc('review_reimbursement_finance', {
    p_reimbursement_id: d.id,
    p_decision: d.decision,
    p_note: d.reviewer_note || undefined,
  })
  if (error) return { error: humanize(error.message) }

  revalidatePath(`/admin/finance/claims/${d.id}`)
  revalidatePath('/admin/finance')
  revalidatePath(`/dashboard/reimbursements/${d.id}`)
  revalidatePath('/dashboard/reimbursements')
  revalidatePath('/dashboard/finance')
  return { ok: true, message: 'Decision recorded.' }
}

/** Mark an approved claim as paid, via pay_reimbursement_finance() — same admin/finance_lead RPC pattern as reviewClaim. */
export async function payClaim(
  _prev: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  const parsed = payClaimSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const user = await requireUser()
  if (!isAdmin(user.role) && user.role !== 'finance_lead') {
    return { error: 'Only Finance Lead or management can mark claims paid.' }
  }
  const d = parsed.data

  const supabase = await createClient()
  const { error } = await supabase.rpc('pay_reimbursement_finance', {
    p_reimbursement_id: d.id,
    p_payment_date: d.payment_date || undefined,
    p_payment_reference: d.payment_reference || undefined,
    p_payment_method: d.payment_method || undefined,
  })
  if (error) return { error: humanize(error.message) }

  revalidatePath(`/admin/finance/claims/${d.id}`)
  revalidatePath('/admin/finance')
  revalidatePath(`/dashboard/reimbursements/${d.id}`)
  revalidatePath('/dashboard/reimbursements')
  revalidatePath('/dashboard/finance')
  return { ok: true, message: 'Marked as paid.' }
}
