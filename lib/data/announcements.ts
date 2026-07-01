import { createClient } from '@/lib/supabase/server'
import type { AnnouncementRow } from '@/types/database'

export type AnnouncementItem = AnnouncementRow & {
  poster: { full_name: string } | null
  campus: { name: string } | null
}

/** Announcements the signed-in user may see (RLS: org-wide + own campus). */
export async function listAnnouncements(limit = 100): Promise<AnnouncementItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('announcements')
    .select('*, poster:users!announcements_posted_by_fkey(full_name), campus:campuses(name)')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data as unknown as AnnouncementItem[] | null) ?? []
}
