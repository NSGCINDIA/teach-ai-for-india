'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import {
  requestTeamAvailabilitySchema,
  respondTeamAvailabilitySchema,
  confirmSchoolTeamSchema,
  replaceTeamMemberSchema,
} from '@/lib/validations/school-team'

export type SchoolTeamActionState = {
  error?: string
  ok?: boolean
  message?: string
  count?: number
}

/** Request volunteer availability for a school team. */
export async function requestSchoolTeamAvailability(
  _prev: SchoolTeamActionState,
  formData: FormData,
): Promise<SchoolTeamActionState> {
  const user = await requireUser('/dashboard/schools')

  const volunteerIdsRaw = formData.getAll('volunteer_ids')
  const volunteer_ids = volunteerIdsRaw.map(String).filter(Boolean)
  const reqVol = formData.get('required_volunteers')

  const parsed = requestTeamAvailabilitySchema.safeParse({
    school_id: formData.get('school_id'),
    volunteer_ids,
    required_volunteers: reqVol ? Number(reqVol) : undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('request_school_team_availability', {
    p_school_id: parsed.data.school_id,
    p_volunteer_ids: parsed.data.volunteer_ids,
    p_required_volunteers: parsed.data.required_volunteers ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/schools/${parsed.data.school_id}`)
  revalidatePath(`/admin/schools/${parsed.data.school_id}`)
  return { ok: true, message: `Availability requested from ${data ?? 0} volunteers.`, count: data ?? 0 }
}

/** Volunteer responds to availability request. */
export async function respondSchoolTeamAvailability(
  _prev: SchoolTeamActionState,
  formData: FormData,
): Promise<SchoolTeamActionState> {
  const user = await requireUser('/dashboard/assignments')

  const parsed = respondTeamAvailabilitySchema.safeParse({
    member_id: formData.get('member_id'),
    available: formData.get('available') === 'true',
    note: formData.get('note') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('respond_school_team_availability', {
    p_member_id: parsed.data.member_id,
    p_available: parsed.data.available,
    p_note: parsed.data.note ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/assignments')
  revalidatePath('/dashboard/schools')
  return { ok: true, message: 'Response recorded. Thank you!' }
}

/** Confirm team members for a school. */
export async function confirmSchoolTeam(
  _prev: SchoolTeamActionState,
  formData: FormData,
): Promise<SchoolTeamActionState> {
  const user = await requireUser('/dashboard/schools')

  const memberIdsRaw = formData.getAll('member_ids')
  const member_ids = memberIdsRaw.map(String).filter(Boolean)

  const parsed = confirmSchoolTeamSchema.safeParse({
    school_id: formData.get('school_id'),
    member_ids,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('confirm_school_team', {
    p_school_id: parsed.data.school_id,
    p_member_ids: parsed.data.member_ids,
  })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/schools/${parsed.data.school_id}`)
  revalidatePath(`/admin/schools/${parsed.data.school_id}`)
  return { ok: true, message: 'School team confirmed.' }
}

/** Replace a team member. */
export async function replaceSchoolTeamMember(
  _prev: SchoolTeamActionState,
  formData: FormData,
): Promise<SchoolTeamActionState> {
  const user = await requireUser('/dashboard/schools')

  const parsed = replaceTeamMemberSchema.safeParse({
    member_id: formData.get('member_id'),
    replacement_volunteer_id: formData.get('replacement_volunteer_id'),
    reason: formData.get('reason'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('replace_school_team_member', {
    p_member_id: parsed.data.member_id,
    p_replacement_volunteer_id: parsed.data.replacement_volunteer_id,
    p_reason: parsed.data.reason ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/schools')
  return { ok: true, message: 'Team member replaced and availability requested for replacement.' }
}

/** Mark temporary session absence for a single session (Task 12). */
export async function markSessionAbsence(
  sessionId: string,
  userId: string,
  status: 'absent' | 'excused',
  notes?: string,
): Promise<SchoolTeamActionState> {
  await requireUser(`/dashboard/sessions/${sessionId}`)

  const supabase = await createClient()
  const { error } = await supabase.rpc('mark_temporary_session_absence', {
    p_session_id: sessionId,
    p_user_id: userId,
    p_status: status,
    p_notes: notes ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/sessions/${sessionId}`)
  return { ok: true, message: `Session status marked as ${status}.` }
}
