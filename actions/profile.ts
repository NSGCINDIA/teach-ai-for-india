'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser, hasRole } from '@/lib/auth/user'
import { profileSchema } from '@/lib/validations/profile'
import { formValues } from '@/lib/actions/form-values'

export type ProfileActionState = {
  error?: string; ok?: boolean; message?: string
  /** Submitted field values, echoed back so the form can repopulate itself after an error. */
  values?: Record<string, string>
}

/** Self-service full_name/phone edit — RLS already lets a user update these on
 *  their own row (only role/campus_id/is_active are trigger-guarded, 0009).
 *  Volunteers are blocked here (defense-in-depth for the UI's read-only view):
 *  their details are managed by campus/exec leads instead. */
export async function updateProfile(_prev: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const values = formValues(formData)
  const me = await requireUser('/dashboard/profile')
  if (hasRole(me, 'volunteer')) return { error: 'Volunteers cannot edit their own profile. Contact your campus lead.', values }

  const parsed = profileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message, values }

  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({ full_name: parsed.data.full_name, phone: parsed.data.phone || null })
    .eq('id', me.id)
  if (error) return { error: error.message, values }

  revalidatePath('/dashboard/profile')
  revalidatePath('/', 'layout') // header/sidebar show the user's name
  return { ok: true, message: 'Profile updated.' }
}
