'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import { isAdmin } from '@/lib/auth/rbac'
import { upsertBlogSchema, reviewBlogSchema } from '@/lib/validations/blogs'
import { formValues } from '@/lib/actions/form-values'

export type BlogActionState = {
  error?: string; ok?: boolean; message?: string
  values?: Record<string, string>
}

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `${base}-${Math.random().toString(36).substring(2, 7)}`
}

export async function saveBlog(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  const values = formValues(formData)
  const user = await requireUser('/dashboard/blogs')
  
  const parsed = upsertBlogSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message, values }

  const d = parsed.data
  const id = d.id || null

  // Calculate reading time: approx 200 words per minute
  const words = d.content.trim().split(/\s+/).length
  const reading_time_minutes = Math.max(1, Math.round(words / 200))

  const supabase = await createClient()

  if (id) {
    // Check ownership or admin privilege
    const { data: existing } = await supabase.from('blogs').select('author_id, status').eq('id', id).single()
    if (!existing) return { error: 'Blog not found.', values }
    if (existing.author_id !== user.id && !isAdmin(user.role)) {
      return { error: 'You do not have permission to edit this blog.', values }
    }
    if (existing.status !== 'draft' && existing.status !== 'rejected' && !isAdmin(user.role)) {
      return { error: 'You can only edit draft or rejected blogs.', values }
    }

    const { error } = await supabase
      .from('blogs')
      .update({
        title: d.title,
        summary: d.summary,
        content: d.content,
        cover_image: d.cover_image || null,
        category: d.category,
        tags: d.tags,
        reading_time_minutes,
        seo_title: d.seo_title || null,
        meta_description: d.meta_description || null,
        keywords: d.keywords,
        og_image: d.og_image || null,
        canonical_url: d.canonical_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) return { error: error.message, values }
  } else {
    // Create a new blog draft
    const slug = generateSlug(d.title)
    const { error } = await supabase.from('blogs').insert({
      title: d.title,
      slug,
      summary: d.summary,
      content: d.content,
      cover_image: d.cover_image || null,
      category: d.category,
      tags: d.tags,
      reading_time_minutes,
      author_id: user.id,
      campus_id: user.campus_id || null,
      seo_title: d.seo_title || null,
      meta_description: d.meta_description || null,
      keywords: d.keywords,
      og_image: d.og_image || null,
      canonical_url: d.canonical_url || null,
      status: 'draft',
    })

    if (error) return { error: error.message, values }
  }

  revalidatePath('/dashboard/blogs')
  redirect('/dashboard/blogs')
}

export async function submitBlog(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  const user = await requireUser('/dashboard/blogs')
  const id = String(formData.get('id') ?? '')
  if (!id) return { error: 'Missing blog ID.' }

  const supabase = await createClient()
  const { data: existing } = await supabase.from('blogs').select('author_id, status').eq('id', id).single()
  if (!existing) return { error: 'Blog not found.' }
  if (existing.author_id !== user.id && !isAdmin(user.role)) {
    return { error: 'You do not have permission to submit this blog.' }
  }

  const { error } = await supabase
    .from('blogs')
    .update({ status: 'submitted', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/blogs')
  return { ok: true, message: 'Submitted for review.' }
}

export async function deleteBlog(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  const user = await requireUser('/dashboard/blogs')
  const id = String(formData.get('id') ?? '')
  if (!id) return { error: 'Missing blog ID.' }

  const supabase = await createClient()
  const { data: existing } = await supabase.from('blogs').select('author_id, status').eq('id', id).single()
  if (!existing) return { error: 'Blog not found.' }
  if (existing.author_id !== user.id && !isAdmin(user.role)) {
    return { error: 'You do not have permission to delete this blog.' }
  }
  if (existing.status !== 'draft' && existing.status !== 'rejected' && !isAdmin(user.role)) {
    return { error: 'You can only delete draft or rejected blogs.' }
  }

  const { error } = await supabase.from('blogs').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/blogs')
  return { ok: true, message: 'Blog deleted.' }
}

export async function reviewBlog(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  const user = await requireUser('/dashboard/blogs')
  if (!isAdmin(user.role)) {
    return { error: 'Only administrators can review blogs.' }
  }

  const parsed = reviewBlogSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { id, status, rejected_reason } = parsed.data
  const supabase = await createClient()

  const payload: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'published' || status === 'approved') {
    payload.published_at = new Date().toISOString()
  } else if (status === 'rejected') {
    payload.rejected_reason = rejected_reason || null
  }

  const { error } = await supabase.from('blogs').update(payload).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/blogs')
  revalidatePath('/stories')
  revalidatePath('/')
  return { ok: true, message: `Blog status updated to ${status}.` }
}