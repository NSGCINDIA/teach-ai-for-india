'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import { campusSettingsSchema } from '@/lib/validations/campus-settings'
import { formValues } from '@/lib/actions/form-values'

export type CampusSettingsActionState = {
  error?: string; ok?: boolean; message?: string
  /** Submitted field values, echoed back so the form can repopulate itself after an error. */
  values?: Record<string, string>
}

/** Campus Lead self-service settings (PRD follow-up). DB (migration 0020) also
 *  guards this — RLS scopes the update to the actor's own campus, and a
 *  trigger rejects any column other than description/hero_image_url. */
export async function saveCampusSettings(
  _prev: CampusSettingsActionState,
  formData: FormData,
): Promise<CampusSettingsActionState> {
  const values = formValues(formData)
  const me = await requireUser('/dashboard/settings')
  if (me.role !== 'campus_lead' || !me.campus_id) {
    return { error: 'Only a campus lead can edit campus settings.', values }
  }

  const parsed = campusSettingsSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message, values }
  if (parsed.data.campus_id !== me.campus_id) return { error: 'You can only edit your own campus.', values }

  const supabase = await createClient()
  const { error } = await supabase
    .from('campuses')
    .update({
      description: parsed.data.description || null,
      hero_image_url: parsed.data.hero_image_url || null,
    })
    .eq('id', parsed.data.campus_id)
  if (error) return { error: error.message, values }

  revalidatePath('/dashboard/settings')
  revalidatePath('/campuses') // public listing/detail feed off these fields
  revalidatePath('/', 'layout')
  return { ok: true, message: 'Settings saved.' }
}
