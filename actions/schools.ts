'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { findSimilarSchools, type SimilarSchool } from '@/lib/data/schools'
import {
  createSchoolSchema,
  schoolSchema,
  schoolContactSchema,
  changeStatusSchema,
} from '@/lib/validations/schools'

export type SchoolActionState = {
  error?: string
  ok?: boolean
  message?: string
  /** Near-duplicate matches that block creation until acknowledged (PRD §7.3). */
  duplicates?: SimilarSchool[]
}

/** Map empty-string optionals to null so the DB stores NULL, not ''. */
function nullify<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj }
  for (const k in out) if (out[k] === '') (out as Record<string, unknown>)[k] = null
  return out
}

export async function createSchool(
  _prev: SchoolActionState,
  formData: FormData,
): Promise<SchoolActionState> {
  const user = await requireUser('/dashboard/schools')
  if (can(user.role, 'edit_school') === false) {
    return { error: 'You do not have permission to add schools.' }
  }

  const parsed = createSchoolSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { acknowledge_duplicate, ...input } = parsed.data

  // Blocking dedup warning unless the user explicitly acknowledged it.
  if (!acknowledge_duplicate) {
    const dupes = await findSimilarSchools(input.name, input.district)
    if (dupes.length > 0) {
      return {
        error: `${dupes.length} similar school${dupes.length > 1 ? 's' : ''} already exist in ${input.district}. Review before continuing.`,
        duplicates: dupes,
      }
    }
  }

  // Campus leads / outreach heads may only file under their own campus.
  const payload = nullify({
    ...input,
    campus_id: can(user.role, 'edit_school') === 'own' ? user.campus_id : input.campus_id || null,
    created_by: user.id,
  })

  const supabase = await createClient()
  const { data, error } = await supabase.from('schools').insert(payload).select('id').single()
  if (error) return { error: error.message }

  revalidatePath('/dashboard/schools')
  revalidatePath('/admin/schools')
  redirect(`/dashboard/schools/${data.id}`)
}

export async function updateSchool(
  _prev: SchoolActionState,
  formData: FormData,
): Promise<SchoolActionState> {
  const id = String(formData.get('id') ?? '')
  if (!id) return { error: 'Missing school id.' }
  const user = await requireUser(`/dashboard/schools/${id}`)
  if (can(user.role, 'edit_school') === false) {
    return { error: 'You do not have permission to edit schools.' }
  }

  const parsed = schoolSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.from('schools').update(nullify(parsed.data)).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath(`/dashboard/schools/${id}`)
  revalidatePath('/dashboard/schools')
  revalidatePath('/admin/schools')
  return { ok: true, message: 'School updated.' }
}

export async function changeSchoolStatus(
  _prev: SchoolActionState,
  formData: FormData,
): Promise<SchoolActionState> {
  const parsed = changeStatusSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  await requireUser(`/dashboard/schools/${parsed.data.school_id}`)

  const supabase = await createClient()
  const { error } = await supabase.rpc('change_school_status', {
    p_school_id: parsed.data.school_id,
    p_new_status: parsed.data.new_status,
    p_note: parsed.data.note || undefined,
  })
  if (error) return { error: humanizeDbError(error.message) }

  revalidatePath(`/dashboard/schools/${parsed.data.school_id}`)
  revalidatePath('/dashboard/schools')
  revalidatePath('/admin/schools')
  return { ok: true, message: 'Status updated.' }
}

export async function addSchoolContact(
  _prev: SchoolActionState,
  formData: FormData,
): Promise<SchoolActionState> {
  const parsed = schoolContactSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  await requireUser(`/dashboard/schools/${parsed.data.school_id}`)

  const supabase = await createClient()
  const { error } = await supabase.from('school_contacts').insert(nullify(parsed.data))
  if (error) return { error: humanizeDbError(error.message) }

  revalidatePath(`/dashboard/schools/${parsed.data.school_id}`)
  return { ok: true, message: 'Contact added.' }
}

/** Turn raised RAISE EXCEPTION text into something a user can read. */
function humanizeDbError(msg: string): string {
  if (/Illegal school transition/.test(msg)) return 'That status change is not allowed from the current stage.'
  if (/permission|reopen an archived/i.test(msg)) return 'You do not have permission for that change.'
  if (/requires a reason/i.test(msg)) return 'A reason note is required for this change.'
  return msg
}
