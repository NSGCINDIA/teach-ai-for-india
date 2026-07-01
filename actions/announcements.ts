'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import { isAdmin } from '@/lib/auth/rbac'
import { announcementSchema, deleteAnnouncementSchema } from '@/lib/validations/workspace'

export type AnnouncementActionState = { error?: string; ok?: boolean; message?: string }

const CAN_POST = new Set(['campus_lead', 'outreach_head', 'exec_lead', 'volunteer_lead'])

/** Post an announcement. Leads → their campus; admins → org-wide (campus_id NULL). */
export async function postAnnouncement(
  _prev: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  const user = await requireUser('/dashboard/announcements')
  if (!isAdmin(user.role) && !CAN_POST.has(user.role)) {
    return { error: 'You do not have permission to post announcements.' }
  }

  const parsed = announcementSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  // Non-admins are pinned to their own campus; admins broadcast org-wide.
  const campus_id = isAdmin(user.role) ? null : user.campus_id
  if (!isAdmin(user.role) && !campus_id) {
    return { error: 'You need a campus to post an announcement.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('announcements').insert({
    title: parsed.data.title,
    body: parsed.data.body,
    pinned: parsed.data.pinned,
    campus_id,
    posted_by: user.id,
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/announcements')
  return { ok: true, message: 'Announcement posted.' }
}

export async function deleteAnnouncement(
  _prev: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  await requireUser('/dashboard/announcements')
  const parsed = deleteAnnouncementSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'Missing announcement.' }

  const supabase = await createClient()
  const { error } = await supabase.from('announcements').delete().eq('id', parsed.data.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/announcements')
  return { ok: true, message: 'Announcement removed.' }
}
