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
import { formValues } from '@/lib/actions/form-values'

import { sanitizeDbError, sanitizeZodError } from '@/lib/errors'

export type SchoolActionState = {
  error?: string
  ok?: boolean
  message?: string
  /** Near-duplicate matches that block creation until acknowledged (PRD §7.3). */
  duplicates?: SimilarSchool[]
  /** Submitted field values, echoed back so the form can repopulate itself after an error. */
  values?: Record<string, string>
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
  const values = formValues(formData)
  const user = await requireUser('/dashboard/schools')
  if (can(user.role, 'edit_school') === false) {
    return { error: 'You do not have permission to add schools.', values }
  }

  const parsed = createSchoolSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: sanitizeZodError(parsed.error), values }
  const { acknowledge_duplicate, ...input } = parsed.data

  // Blocking dedup warning unless the user explicitly acknowledged it.
  if (!acknowledge_duplicate) {
    const dupes = await findSimilarSchools(input.name, input.district)
    if (dupes.length > 0) {
      return {
        error: `${dupes.length} similar school${dupes.length > 1 ? 's' : ''} already exist in ${input.district}. Review before continuing.`,
        duplicates: dupes,
        values,
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
  if (error) return { error: sanitizeDbError(error.message, 'Failed to create school. Please check your inputs.'), values }

  revalidatePath('/dashboard/schools')
  revalidatePath('/admin/schools')
  redirect(`/dashboard/schools/${data.id}`)
}

export async function updateSchool(
  _prev: SchoolActionState,
  formData: FormData,
): Promise<SchoolActionState> {
  const id = String(formData.get('id') ?? '')
  const values = formValues(formData)
  if (!id) return { error: 'Missing school id.', values }
  const user = await requireUser(`/dashboard/schools/${id}`)
  if (can(user.role, 'edit_school') === false) {
    return { error: 'You do not have permission to edit schools.', values }
  }

  const parsed = schoolSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: sanitizeZodError(parsed.error), values }

  const supabase = await createClient()
  const { error } = await supabase.from('schools').update(nullify(parsed.data)).eq('id', id)
  if (error) return { error: sanitizeDbError(error.message, 'Failed to update school.'), values }

  revalidatePath(`/dashboard/schools/${id}`)
  revalidatePath('/dashboard/schools')
  revalidatePath('/admin/schools')
  return { ok: true, message: 'School updated.' }
}

export async function changeSchoolStatus(
  _prev: SchoolActionState,
  formData: FormData,
): Promise<SchoolActionState> {
  const values = formValues(formData)
  const parsed = changeStatusSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: sanitizeZodError(parsed.error), values }
  await requireUser(`/dashboard/schools/${parsed.data.school_id}`)

  const supabase = await createClient()
  const { error } = await supabase.rpc('change_school_status', {
    p_school_id: parsed.data.school_id,
    p_new_status: parsed.data.new_status,
    p_note: parsed.data.note || undefined,
  })
  if (error) return { error: sanitizeDbError(error.message), values }

  revalidatePath(`/dashboard/schools/${parsed.data.school_id}`)
  revalidatePath('/dashboard/schools')
  revalidatePath('/admin/schools')
  return { ok: true, message: 'Status updated.' }
}

export async function addSchoolContact(
  _prev: SchoolActionState,
  formData: FormData,
): Promise<SchoolActionState> {
  const values = formValues(formData)
  const parsed = schoolContactSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: sanitizeZodError(parsed.error), values }
  await requireUser(`/dashboard/schools/${parsed.data.school_id}`)

  const supabase = await createClient()
  const { error } = await supabase.from('school_contacts').insert(nullify(parsed.data))
  if (error) return { error: sanitizeDbError(error.message), values }

  revalidatePath(`/dashboard/schools/${parsed.data.school_id}`)
  return { ok: true, message: 'Contact added.' }
}

export async function initiateSchoolOnboarding(
  schoolId: string,
): Promise<SchoolActionState> {
  const user = await requireUser(`/dashboard/schools/${schoolId}`)
  if (can(user.role, 'edit_school') === false) {
    return { error: 'You do not have permission to initiate onboarding for this school.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('initiate_school_onboarding', {
    p_school_id: schoolId,
  })

  if (error) return { error: sanitizeDbError(error.message) }

  revalidatePath(`/dashboard/schools/${schoolId}`)
  revalidatePath('/dashboard/schools')
  revalidatePath('/admin/schools')
  return { ok: true, message: 'Onboarding initiated! School is now Registered.' }
}

/** Turn raised RAISE EXCEPTION text into something a user can read. */
function humanizeDbError(msg: string): string {
  return sanitizeDbError(msg)
}
