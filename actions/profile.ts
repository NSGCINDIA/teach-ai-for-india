'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import { profileSchema } from '@/lib/validations/profile'

export type ProfileActionState = { error?: string; ok?: boolean; message?: string }

/** Self-service full_name/phone edit — RLS already lets a user update these on
 *  their own row (only role/campus_id/is_active are trigger-guarded, 0009). */
export async function updateProfile(_prev: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const me = await requireUser('/dashboard/profile')

  const parsed = profileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({ full_name: parsed.data.full_name, phone: parsed.data.phone || null })
    .eq('id', me.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile')
  revalidatePath('/', 'layout') // header/sidebar show the user's name
  return { ok: true, message: 'Profile updated.' }
}
