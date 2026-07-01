import { createClient } from '@/lib/supabase/server'
import type { NotificationRow } from '@/types/database'

/** The signed-in user's notifications, newest first (RLS scopes to recipient). */
export async function listNotifications(limit = 100): Promise<NotificationRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data as NotificationRow[] | null) ?? []
}

export async function unreadNotificationCount(): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false)
  return count ?? 0
}
