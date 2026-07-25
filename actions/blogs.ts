'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import { isAdmin } from '@/lib/auth/rbac'
import { blogFormSchema, reviewBlogSchema } from '@/lib/validations/blog-requests'
import { formValues } from '@/lib/actions/form-values'

export type BlogActionState = {
  error?: string; ok?: boolean; message?: string
  values?: Record<string, string>
}

/** Create or update a blog post. Saving a blog sets status to 'draft' or 'pending' if submitted. */
export async function upsertBlog(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  const values = formValues(formData)
  const user = await requireUser('/dashboard/blog-writing')

  const parsed = blogFormSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message, values }

  const supabase = await createClient()

  // Determine if this is a submission or a draft save
  const submitAction = formData.get('submitAction') === 'submit'
  const newStatus = submitAction ? 'pending' : 'draft'

  if (parsed.data.id) {
    // Update existing blog
    // Check if the user is permitted to update (owner or admin)
    const { data: existingBlog, error: fetchErr } = await supabase
      .from('blogs')
      .select('posted_by, status')
      .eq('id', parsed.data.id)
      .maybeSingle()

    if (fetchErr || !existingBlog) {
      return { error: 'Blog post not found.', values }
    }

    if (!isAdmin(user.role) && existingBlog.posted_by !== user.id) {
      return { error: 'You do not have permission to edit this blog post.', values }
    }

    // Non-admins cannot update published blogs
    if (!isAdmin(user.role) && existingBlog.status === 'published') {
      return { error: 'Published blogs cannot be modified. Contact an admin to unpublish.', values }
    }

    const { error: updateErr } = await supabase
      .from('blogs')
      .update({
        title: parsed.data.title,
        body: parsed.data.body,
        status: isAdmin(user.role) ? undefined : newStatus, // Admin updates don't change status automatically
        updated_at: new Date().toISOString(),
      })
      .eq('id', parsed.data.id)

    if (updateErr) return { error: updateErr.message, values }
  } else {
    // Create new blog
    const { error: insertErr } = await supabase
      .from('blogs')
      .insert({
        title: parsed.data.title,
        body: parsed.data.body,
        status: isAdmin(user.role) ? 'published' : newStatus, // Admin posts are automatically published
        posted_by: user.id,
        campus_id: user.campus_id || null,
      })

    if (insertErr) return { error: insertErr.message, values }
  }

  revalidatePath('/dashboard/blog-writing')
  revalidatePath('/stories')
  return { ok: true, message: submitAction ? 'Blog submitted for review.' : 'Blog draft saved.' }
}

/** Submit an existing draft blog for review. */
export async function submitBlogForReview(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  const user = await requireUser('/dashboard/blog-writing')
  const blogId = formData.get('id') as string

  if (!blogId) return { error: 'Missing blog ID.' }

  const supabase = await createClient()

  // Verify owner
  const { data: blog, error: fetchErr } = await supabase
    .from('blogs')
    .select('posted_by')
    .eq('id', blogId)
    .maybeSingle()

  if (fetchErr || !blog) return { error: 'Blog post not found.' }
  if (!isAdmin(user.role) && blog.posted_by !== user.id) {
    return { error: 'You do not have permission to submit this blog post.' }
  }

  const { error: updateErr } = await supabase
    .from('blogs')
    .update({ status: 'pending' })
    .eq('id', blogId)

  if (updateErr) return { error: updateErr.message }

  revalidatePath('/dashboard/blog-writing')
  return { ok: true, message: 'Submitted for review.' }
}

/** Super Admin review workflow: Approve (published) or Reject (rejected). */
export async function reviewBlog(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  const user = await requireUser('/dashboard/blog-writing')
  if (!isAdmin(user.role)) {
    return { error: 'Unauthorized. Only Super Admins can review blogs.' }
  }

  const parsed = reviewBlogSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()

  const newStatus = parsed.data.decision === 'approved' ? 'published' : 'rejected'

  const { error } = await supabase
    .from('blogs')
    .update({ status: newStatus })
    .eq('id', parsed.data.blog_id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/blog-writing')
  revalidatePath('/stories')
  return { ok: true, message: `Blog post ${newStatus === 'published' ? 'approved & published' : 'rejected'}.` }
}

/** Delete a blog post. */
export async function deleteBlog(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  const user = await requireUser('/dashboard/blog-writing')
  const blogId = formData.get('id') as string

  if (!blogId) return { error: 'Missing blog ID.' }

  const supabase = await createClient()

  // Verify owner/admin
  const { data: blog, error: fetchErr } = await supabase
    .from('blogs')
    .select('posted_by')
    .eq('id', blogId)
    .maybeSingle()

  if (fetchErr || !blog) return { error: 'Blog post not found.' }
  if (!isAdmin(user.role) && blog.posted_by !== user.id) {
    return { error: 'You do not have permission to delete this blog.' }
  }

  const { error } = await supabase.from('blogs').delete().eq('id', blogId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/blog-writing')
  revalidatePath('/stories')
  return { ok: true, message: 'Blog post deleted.' }
}
