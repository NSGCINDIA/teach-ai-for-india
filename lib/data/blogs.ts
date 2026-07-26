import { createClient } from '@/lib/supabase/server'
import type { BlogRow } from '@/types/database'
import { getSessionUser } from '@/lib/auth/user'
import { isAdmin } from '@/lib/auth/rbac'

export type BlogItem = BlogRow & {
  author: { full_name: string; role: string } | null
  campus: { name: string } | null
}

/**
 * List blogs for the dashboard based on the signed-in user's role and scopes.
 * - Super Admins see all blogs (review queue + database).
 * - Chapter members see their own drafts/submissions + any reviewed/published blogs from their own campus.
 */
export async function listBlogsForDashboard(): Promise<BlogItem[]> {
  const user = await getSessionUser()
  if (!user) return []

  const supabase = await createClient()
  
  let query = supabase
    .from('blogs')
    .select('*, author:users!blogs_author_id_fkey(full_name, role), campus:campuses(name)')

  if (!isAdmin(user.role)) {
    // Team member: authored by them, OR matches their campus and is NOT a draft
    if (user.campus_id) {
      query = query.or(`author_id.eq.${user.id},and(campus_id.eq.${user.campus_id},status.neq.draft)`)
    } else {
      query = query.eq('author_id', user.id)
    }
  }

  const { data } = await query.order('created_at', { ascending: false })
  return (data as unknown as BlogItem[] | null) ?? []
}

/** Get a single blog detail by ID */
export async function getBlogDetail(id: string): Promise<BlogItem | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blogs')
    .select('*, author:users!blogs_author_id_fkey(full_name, role), campus:campuses(name)')
    .eq('id', id)
    .single()
  return (data as unknown as BlogItem | null)
}

/** List all approved and published blogs for the public site */
export async function listPublishedBlogs(): Promise<BlogItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blogs')
    .select('*, author:users!blogs_author_id_fkey(full_name, role), campus:campuses(name)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })
  return (data as unknown as BlogItem[] | null) ?? []
}