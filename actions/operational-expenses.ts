'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import { z } from 'zod'

export type OperationalExpenseActionState = {
  error?: string
  ok?: boolean
  message?: string
  id?: string
}

const recordExpenseSchema = z.object({
  school_id: z.string().uuid('School ID is required'),
  session_id: z.string().uuid().optional(),
  category: z.enum(['transport', 'materials', 'equipment', 'printing', 'food', 'logistics', 'school_visit', 'other']),
  amount: z.coerce.number().gt(0, 'Amount must be greater than zero'),
  description: z.string().optional(),
  expense_date: z.string().optional(),
  bill_url: z.string().optional(),
  vendor_name: z.string().optional(),
  reference_number: z.string().optional(),
})

export async function recordOperationalExpense(
  _prev: OperationalExpenseActionState,
  formData: FormData,
): Promise<OperationalExpenseActionState> {
  const user = await requireUser('/dashboard/schools')
  const raw = Object.fromEntries(formData)

  const parsed = recordExpenseSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const d = parsed.data
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('record_operational_expense', {
    p_school_id: d.school_id,
    p_session_id: d.session_id || undefined,
    p_category: d.category as any,
    p_amount: d.amount,
    p_description: d.description || undefined,
    p_expense_date: d.expense_date || undefined,
    p_bill_url: d.bill_url || undefined,
    p_vendor_name: d.vendor_name || undefined,
    p_reference_number: d.reference_number || undefined,
  })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/schools/${d.school_id}`)
  if (d.session_id) {
    revalidatePath(`/dashboard/sessions/${d.session_id}`)
  }
  revalidatePath('/dashboard/finance')
  return { ok: true, message: `Operational expense of ₹${d.amount} recorded.`, id: data }
}

export async function verifyOperationalExpense(
  _prev: OperationalExpenseActionState,
  formData: FormData,
): Promise<OperationalExpenseActionState> {
  const user = await requireUser('/dashboard/finance')
  const expenseId = formData.get('expense_id') as string
  const schoolId = formData.get('school_id') as string

  if (!expenseId) return { error: 'Expense ID is required' }

  const supabase = await createClient()
  const { error } = await supabase.rpc('verify_operational_expense', {
    p_expense_id: expenseId,
  })

  if (error) return { error: error.message }

  if (schoolId) revalidatePath(`/dashboard/schools/${schoolId}`)
  revalidatePath('/dashboard/finance')
  return { ok: true, message: 'Expense receipt verified by Finance Lead.' }
}
