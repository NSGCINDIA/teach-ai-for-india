'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'

export type NotificationActionState = { error?: string; ok?: boolean }

/** Mark one notification read (RLS ensures it's the caller's own). */
export async function markNotificationRead(id: string): Promise<NotificationActionState> {
  const me = await requireUser('/dashboard/notifications')
  const supabase = await createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('recipient_id', me.id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/notifications')
  return { ok: true }
}

export async function markAllNotificationsRead(): Promise<NotificationActionState> {
  const me = await requireUser('/dashboard/notifications')
  const supabase = await createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('recipient_id', me.id)
    .eq('is_read', false)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/notifications')
  return { ok: true }
}
