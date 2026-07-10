'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import {
  allocateCampusBudgetSchema,
  createBudgetIncreaseRequestSchema,
  reviewBudgetIncreaseRequestSchema,
} from '@/lib/validations/budget-requests'
import { formValues } from '@/lib/actions/form-values'

export type BudgetRequestActionState = {
  error?: string; ok?: boolean; message?: string
  /** Submitted field values, echoed back so the form can repopulate itself after an error. */
  values?: Record<string, string>
}

/** Finance Lead sets the initial budget for their campus's current period. */
export async function allocateCampusBudget(
  _prev: BudgetRequestActionState,
  formData: FormData,
): Promise<BudgetRequestActionState> {
  await requireUser('/dashboard/finance')
  const values = formValues(formData)

  const parsed = allocateCampusBudgetSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message, values }

  const supabase = await createClient()
  const { error } = await supabase.rpc('finance_allocate_campus_budget', {
    p_campus_id: parsed.data.campus_id,
    p_allocated_amount: parsed.data.allocated_amount,
    p_note: parsed.data.note || undefined,
  })
  if (error) return { error: humanizeDbError(error.message), values }

  revalidatePath('/dashboard/finance')
  return { ok: true, message: 'Budget allocated.' }
}

/** Finance Lead requests additional budget; notifies the campus's Campus Lead. */
export async function createBudgetIncreaseRequest(
  _prev: BudgetRequestActionState,
  formData: FormData,
): Promise<BudgetRequestActionState> {
  await requireUser('/dashboard/finance')
  const values = formValues(formData)

  const parsed = createBudgetIncreaseRequestSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message, values }

  const supabase = await createClient()
  const { error } = await supabase.rpc('create_budget_increase_request', {
    p_campus_id: parsed.data.campus_id,
    p_requested_amount: parsed.data.requested_amount,
    p_reason: parsed.data.reason,
  })
  if (error) return { error: humanizeDbError(error.message), values }

  revalidatePath('/dashboard/finance')
  revalidatePath('/dashboard')
  return { ok: true, message: 'Budget increase request submitted — the Campus Lead has been notified.' }
}

/** Campus Lead reviews a budget increase request; approval increments campus_budgets.allocated_amount. */
export async function reviewBudgetIncreaseRequest(
  _prev: BudgetRequestActionState,
  formData: FormData,
): Promise<BudgetRequestActionState> {
  await requireUser('/dashboard')
  const values = formValues(formData)

  const parsed = reviewBudgetIncreaseRequestSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message, values }

  const supabase = await createClient()
  const { error } = await supabase.rpc('review_budget_increase_request', {
    p_request_id: parsed.data.request_id,
    p_decision: parsed.data.decision,
    p_note: parsed.data.note || undefined,
  })
  if (error) return { error: humanizeDbError(error.message), values }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/finance')
  return { ok: true, message: 'Review recorded.' }
}

function humanizeDbError(msg: string): string {
  if (/already been reviewed/i.test(msg)) return 'This request has already been reviewed.'
  if (/permission/i.test(msg)) return 'You do not have permission for that action.'
  if (/reason is required/i.test(msg)) return 'A reason is required when rejecting.'
  if (/already been allocated/i.test(msg)) return msg
  if (/No budget exists yet/i.test(msg)) return msg
  if (/No active budget period/i.test(msg)) return msg
  if (/anymore/i.test(msg)) return msg
  if (/budget_increase_requests_one_pending_per/i.test(msg)) {
    return 'This campus already has an open budget increase request for this period.'
  }
  if (/not found/i.test(msg)) return 'That budget request could not be found.'
  return msg
}
