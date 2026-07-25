import { createClient } from '@/lib/supabase/server'

export type BlogItem = {
  id: string
  title: string
  body: string
  status: 'draft' | 'pending' | 'published' | 'rejected'
  campus_id: string | null
  posted_by: string | null
  created_at: string
  updated_at: string
  poster: { full_name: string } | null
  campus: { name: string } | null
}

/** Blogs the signed-in user is permitted to see via RLS. */
export async function listBlogs(limit = 100): Promise<BlogItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blogs')
    .select('*, poster:users(full_name), campus:campuses(name)')
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data as unknown as BlogItem[] | null) ?? []
}

/** Get a single blog by ID. */
export async function getBlog(id: string): Promise<BlogItem | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blogs')
    .select('*, poster:users(full_name), campus:campuses(name)')
    .eq('id', id)
    .maybeSingle()
  return data as unknown as BlogItem | null
}

/** Publicly published blogs (visible to anonymous users). */
export async function listPublicBlogs(limit = 100): Promise<BlogItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blogs')
    .select('*, poster:users(full_name), campus:campuses(name)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data as unknown as BlogItem[] | null) ?? []
}
