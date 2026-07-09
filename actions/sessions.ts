'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { SESSION_TYPE_FIELD, PRESENT_STATUSES } from '@/lib/constants/sessions'
import {
  sessionSchema,
  sessionUpdateSchema,
  changeSessionStatusSchema,
  attendanceSchema,
} from '@/lib/validations/sessions'
import type { SessionType, AttendanceStatus, SessionRow } from '@/types/database'

export type SessionActionState = { error?: string; ok?: boolean; message?: string }

export async function createSession(
  _prev: SessionActionState,
  formData: FormData,
): Promise<SessionActionState> {
  const user = await requireUser('/dashboard/sessions')
  if (can(user.role, 'create_session') === false) {
    return { error: 'You do not have permission to plan sessions.' }
  }

  const parsed = sessionSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      school_id: parsed.data.school_id,
      session_type: parsed.data.session_type,
      date: parsed.data.date,
      start_time: parsed.data.start_time || null,
      end_time: parsed.data.end_time || null,
      topic: parsed.data.topic,
      created_by: user.id,
    })
    .select('id')
    .single()
  if (error) return { error: error.message }

  revalidatePath('/dashboard/sessions')
  revalidatePath('/admin/sessions')
  redirect(`/dashboard/sessions/${data.id}`)
}

export async function updateSession(
  _prev: SessionActionState,
  formData: FormData,
): Promise<SessionActionState> {
  const id = String(formData.get('id') ?? '')
  if (!id) return { error: 'Missing session id.' }
  await requireUser(`/dashboard/sessions/${id}`)

  const parsed = sessionUpdateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const d = parsed.data

  // Merge the one type-specific field into type_details (jsonb).
  const field = SESSION_TYPE_FIELD[d.session_type as SessionType]
  const type_details = d.type_detail ? { [field.key]: d.type_detail } : {}

  const supabase = await createClient()
  const { error } = await supabase
    .from('sessions')
    .update({
      school_id: d.school_id,
      session_type: d.session_type,
      date: d.date,
      start_time: d.start_time || null,
      end_time: d.end_time || null,
      topic: d.topic,
      student_count: d.student_count ?? null,
      volunteer_count: d.volunteer_count ?? null,
      notes: d.notes || null,
      challenges: d.challenges || null,
      next_steps: d.next_steps || null,
      improvement_notes: d.improvement_notes || null,
      type_details,
    })
    .eq('id', id)
  if (error) return { error: error.message }

  revalidatePath(`/dashboard/sessions/${id}`)
  revalidatePath('/dashboard/sessions')
  revalidatePath('/admin/sessions')
  return { ok: true, message: 'Session saved.' }
}

export async function changeSessionStatus(
  _prev: SessionActionState,
  formData: FormData,
): Promise<SessionActionState> {
  const parsed = changeSessionStatusSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  await requireUser(`/dashboard/sessions/${parsed.data.session_id}`)
  const { session_id, new_status, note } = parsed.data

  const supabase = await createClient()
  // Cancellation needs a reason in notes (the DB trigger enforces this too).
  const payload: Partial<SessionRow> = { status: new_status }
  if (new_status === 'cancelled') {
    if (!note) return { error: 'A reason is required to cancel a session.' }
    payload.notes = note
  }

  const { error } = await supabase.from('sessions').update(payload).eq('id', session_id)
  if (error) return { error: humanizeDbError(error.message) }

  revalidatePath(`/dashboard/sessions/${session_id}`)
  revalidatePath('/dashboard/sessions')
  revalidatePath('/admin/sessions')
  return { ok: true, message: 'Status updated.' }
}

export async function markAttendance(
  _prev: SessionActionState,
  formData: FormData,
): Promise<SessionActionState> {
  const parsed = attendanceSchema.safeParse({
    session_id: formData.get('session_id'),
    roster: formData.get('roster'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const user = await requireUser(`/dashboard/sessions/${parsed.data.session_id}`)
  const { session_id, roster } = parsed.data

  const supabase = await createClient()
  if (roster.length > 0) {
    const { error } = await supabase.from('attendance_records').upsert(
      roster.map((r) => ({
        session_id,
        user_id: r.user_id,
        status: r.status,
        arrival_time: r.arrival_time || null,
        departure_time: r.departure_time || null,
        marked_by: user.id,
      })),
      { onConflict: 'session_id,user_id' },
    )
    if (error) return { error: humanizeDbError(error.message) }
  }

  // Roster of who actually attended drives the team list + volunteer count.
  const present = roster.filter((r) => PRESENT_STATUSES.includes(r.status as AttendanceStatus))
  const { error: sErr } = await supabase
    .from('sessions')
    .update({ team_members_present: present.map((r) => r.user_id), volunteer_count: present.length })
    .eq('id', session_id)
  if (sErr) return { error: humanizeDbError(sErr.message) }

  revalidatePath(`/dashboard/sessions/${session_id}`)
  return { ok: true, message: 'Attendance saved.' }
}

function humanizeDbError(msg: string): string {
  if (/execution plan must be approved/i.test(msg))
    return 'This session needs an approved execution plan before it can start.'
  if (/Illegal session transition/.test(msg)) return 'That status change is not allowed from the current stage.'
  if (/at least 1 photo and 1 attendance document/.test(msg))
    return 'To report, upload at least 1 photo and 1 attendance document first (Evidence).'
  if (/student count, volunteer count and topic/.test(msg))
    return 'Fill in student count, volunteer count and topic before reporting.'
  if (/Only Campus Lead or above may cancel/.test(msg)) return 'Only a Campus Lead or above may cancel a session.'
  if (/Cancellation requires a reason/.test(msg)) return 'A reason is required to cancel.'
  if (/permission|row-level security/i.test(msg)) return 'You do not have permission for that change.'
  return msg
}
