'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import { logSchoolVisitSchema } from '@/lib/validations/school-visits'
import { formValues } from '@/lib/actions/form-values'

export type SchoolVisitActionState = {
  error?: string; ok?: boolean; message?: string
  /** Submitted field values, echoed back so the form can repopulate itself after an error. */
  values?: Record<string, string>
}

/**
 * Log an onboarding visit. The DB function enforces role + campus scope,
 * guards the school's status, advances it to visit_completed, and notifies
 * the campus's Campus/Outreach Leads; this just drives it.
 */
export async function logSchoolVisit(
  _prev: SchoolVisitActionState,
  formData: FormData,
): Promise<SchoolVisitActionState> {
  const schoolId = String(formData.get('school_id') ?? '')
  const values = formValues(formData)
  await requireUser(`/dashboard/schools/${schoolId}`)

  const parsed = logSchoolVisitSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message, values }

  const supabase = await createClient()
  const { error } = await supabase.rpc('log_school_visit', {
    p_school_id: parsed.data.school_id,
    p_visited_at: new Date(parsed.data.visited_at).toISOString(),
    p_notes: parsed.data.notes || undefined,
    p_team_member_ids: parsed.data.team_member_ids ?? [],
  })
  if (error) return { error: humanizeDbError(error.message), values }

  revalidatePath(`/dashboard/schools/${schoolId}`)
  revalidatePath(`/admin/schools/${schoolId}`)
  return { ok: true, message: 'Visit logged.' }
}

function humanizeDbError(msg: string): string {
  if (/permission/i.test(msg)) return 'You do not have permission for that action.'
  if (/outreach request must be approved/i.test(msg)) return msg
  if (/visit date\/time is required/i.test(msg)) return 'A visit date/time is required.'
  return msg
}
