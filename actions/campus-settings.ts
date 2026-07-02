'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import { campusSettingsSchema } from '@/lib/validations/campus-settings'

export type CampusSettingsActionState = { error?: string; ok?: boolean; message?: string }

/** Campus Lead self-service settings (PRD follow-up). DB (migration 0020) also
 *  guards this — RLS scopes the update to the actor's own campus, and a
 *  trigger rejects any column other than description/hero_image_url. */
export async function saveCampusSettings(
  _prev: CampusSettingsActionState,
  formData: FormData,
): Promise<CampusSettingsActionState> {
  const me = await requireUser('/dashboard/settings')
  if (me.role !== 'campus_lead' || !me.campus_id) {
    return { error: 'Only a campus lead can edit campus settings.' }
  }

  const parsed = campusSettingsSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  if (parsed.data.campus_id !== me.campus_id) return { error: 'You can only edit your own campus.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('campuses')
    .update({
      description: parsed.data.description || null,
      hero_image_url: parsed.data.hero_image_url || null,
    })
    .eq('id', parsed.data.campus_id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings')
  revalidatePath('/campuses') // public listing/detail feed off these fields
  revalidatePath('/', 'layout')
  return { ok: true, message: 'Settings saved.' }
}
