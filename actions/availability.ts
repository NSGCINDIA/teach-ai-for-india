'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import { availabilitySchema, clearAvailabilitySchema } from '@/lib/validations/workspace'
import { formValues } from '@/lib/actions/form-values'

export type AvailabilityActionState = {
  error?: string; ok?: boolean; message?: string
  /** Submitted field values, echoed back so the form can repopulate itself after an error. */
  values?: Record<string, string>
}

/** A volunteer marks (or updates) their availability for a date. */
export async function setAvailability(
  _prev: AvailabilityActionState,
  formData: FormData,
): Promise<AvailabilityActionState> {
  const values = formValues(formData)
  const user = await requireUser('/dashboard/availability')
  const parsed = availabilitySchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message, values }

  const supabase = await createClient()
  const { error } = await supabase.from('volunteer_availability').upsert(
    {
      volunteer_id: user.id,
      date: parsed.data.date,
      status: parsed.data.status,
      note: parsed.data.note || null,
    },
    { onConflict: 'volunteer_id,date' },
  )
  if (error) return { error: error.message, values }

  revalidatePath('/dashboard/availability')
  return { ok: true, message: 'Availability saved.' }
}

export async function clearAvailability(
  _prev: AvailabilityActionState,
  formData: FormData,
): Promise<AvailabilityActionState> {
  const user = await requireUser('/dashboard/availability')
  const parsed = clearAvailabilitySchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'Missing entry.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('volunteer_availability')
    .delete()
    .eq('id', parsed.data.id)
    .eq('volunteer_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/availability')
  return { ok: true, message: 'Entry removed.' }
}
