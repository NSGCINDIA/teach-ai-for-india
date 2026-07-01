'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import {
  assignVolunteersSchema,
  respondAssignmentSchema,
  unassignSchema,
} from '@/lib/validations/assignments'

export type AssignmentActionState = { error?: string; ok?: boolean; message?: string }

/** Volunteer Lead / Campus Lead assigns volunteers to a session. */
export async function assignVolunteers(
  _prev: AssignmentActionState,
  formData: FormData,
): Promise<AssignmentActionState> {
  const user = await requireUser('/dashboard/sessions')
  if (can(user.role, 'assign_volunteers') === false) {
    return { error: 'You do not have permission to assign volunteers.' }
  }

  const parsed = assignVolunteersSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('assign_volunteers', {
    p_session_id: parsed.data.session_id,
    p_volunteer_ids: parsed.data.volunteer_ids,
  })
  if (error) return { error: humanizeDbError(error.message) }

  revalidatePath(`/dashboard/sessions/${parsed.data.session_id}`)
  revalidatePath(`/admin/sessions/${parsed.data.session_id}`)
  revalidatePath('/dashboard/assignments')
  const n = (data as number) ?? 0
  return { ok: true, message: n === 0 ? 'No new volunteers assigned.' : `Assigned ${n} volunteer${n === 1 ? '' : 's'}.` }
}

/** A volunteer accepts / declines / requests replacement on their assignment. */
export async function respondToAssignment(
  _prev: AssignmentActionState,
  formData: FormData,
): Promise<AssignmentActionState> {
  await requireUser('/dashboard/assignments')
  const parsed = respondAssignmentSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.rpc('respond_to_assignment', {
    p_assignment_id: parsed.data.assignment_id,
    p_status: parsed.data.status,
    p_note: parsed.data.note || undefined,
  })
  if (error) return { error: humanizeDbError(error.message) }

  revalidatePath('/dashboard/assignments')
  return { ok: true, message: 'Response recorded.' }
}

/** Leader removes an assignment (e.g. after a decline). */
export async function unassignVolunteer(
  _prev: AssignmentActionState,
  formData: FormData,
): Promise<AssignmentActionState> {
  const user = await requireUser('/dashboard/sessions')
  if (can(user.role, 'assign_volunteers') === false) {
    return { error: 'You do not have permission to remove assignments.' }
  }
  const parsed = unassignSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'Missing assignment.' }
  const sessionId = String(formData.get('session_id') ?? '')

  const supabase = await createClient()
  const { error } = await supabase.from('session_assignments').delete().eq('id', parsed.data.assignment_id)
  if (error) return { error: humanizeDbError(error.message) }

  revalidatePath(`/dashboard/sessions/${sessionId}`)
  revalidatePath(`/admin/sessions/${sessionId}`)
  revalidatePath('/dashboard/assignments')
  return { ok: true, message: 'Assignment removed.' }
}

function humanizeDbError(msg: string): string {
  if (/reason is required/i.test(msg)) return 'A reason is required when declining or requesting a replacement.'
  if (/only respond to your own/i.test(msg)) return 'You can only respond to your own assignment.'
  if (/permission/i.test(msg)) return 'You do not have permission for that change.'
  return msg
}
