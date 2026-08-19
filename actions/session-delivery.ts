'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import {
  createSessionDeliveryPlanSchema,
  submitSessionReportSchema,
} from '@/lib/validations/session-delivery'
import type { SessionType } from '@/types/database'

import { sanitizeDbError, sanitizeZodError } from '@/lib/errors'
import { validateFutureSchedule } from '@/lib/validations/schedule'

export type SessionDeliveryActionState = {
  error?: string
  ok?: boolean
  message?: string
  id?: string
}

/** Roles that run the Session Hub for a school (schedule + report delivery). */
const SESSION_MANAGER_ROLES = ['campus_lead', 'exec_lead', 'outreach_lead'] as const

/** File names used for the two auto-recorded Google Drive evidence links. */
const PHOTO_EVIDENCE_NAME = 'Session Photo (Google Drive)'
const DOCUMENT_EVIDENCE_NAME = 'Attendance/Report Document (Google Drive)'

/** Mirrors the sessions RLS write policy: Super Admin, or a campus-scoped lead. */
function canManageSessions(
  role: string,
  userCampusId: string | null,
  schoolCampusId: string | null,
): boolean {
  if (['super_admin', 'mgmt_admin'].includes(role)) return true
  return (
    (SESSION_MANAGER_ROLES as readonly string[]).includes(role) &&
    !!userCampusId &&
    userCampusId === schoolCampusId
  )
}

/** Create/schedule a session delivery plan (Session 1–4). */
export async function createSessionDeliveryPlan(
  _prev: SessionDeliveryActionState,
  formData: FormData,
): Promise<SessionDeliveryActionState> {
  const user = await requireUser('/dashboard/schools')
  const raw = Object.fromEntries(formData)

  const parsed = createSessionDeliveryPlanSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: sanitizeZodError(parsed.error) }
  }

  const d = parsed.data

  // Validate that the planned date and start time are not in the past
  const timeError = validateFutureSchedule(d.planned_date, d.start_time)
  if (timeError) {
    return { error: timeError }
  }
  const supabase = await createClient()

  // Get school details
  const { data: school } = await supabase
    .from('schools')
    .select('id, name, campus_id')
    .eq('id', d.school_id)
    .single()

  if (!school) return { error: 'School not found' }

  // Explicit permission check — mirrors the sessions RLS write policy.
  if (!canManageSessions(user.role, user.campus_id, school.campus_id)) {
    return { error: 'You do not have permission to schedule session plans for this school.' }
  }

  // Verify Execution & Budget Plan completion gate: must be approved before scheduling sessions
  const { data: execPlan } = await supabase
    .from('school_execution_plans')
    .select('status')
    .eq('school_id', d.school_id)
    .eq('status', 'approved')
    .maybeSingle()

  if (!execPlan) {
    return {
      error: 'Cannot schedule session: The school Execution & Budget Plan must be submitted and approved first.',
    }
  }

  // Get previous session if session_number > 1
  let previousSessionId: string | null = null
  if (d.session_number > 1) {
    const { data: prevSess } = await supabase
      .from('sessions')
      .select('id')
      .eq('school_id', d.school_id)
      .eq('session_number', d.session_number - 1)
      .maybeSingle()
    if (prevSess) previousSessionId = prevSess.id
  }

  // Insert session
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      school_id: d.school_id,
      campus_id: school.campus_id,
      session_number: d.session_number,
      session_type: d.session_type as SessionType,
      topic: d.topic,
      date: d.planned_date,
      start_time: d.start_time || null,
      end_time: d.end_time || null,
      status: 'planned',
      notes: d.notes || null,
      previous_session_id: previousSessionId,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error) return { error: sanitizeDbError(error) }

  // Also populate initial session_participants from confirmed school_team_members
  const { data: teamMembers } = await supabase
    .from('school_team_members')
    .select('id, volunteer_id')
    .eq('school_id', d.school_id)
    .eq('status', 'confirmed')
    .eq('is_active', true)

  if (teamMembers && teamMembers.length > 0) {
    const participants = teamMembers.map((m) => ({
      session_id: data.id,
      school_team_member_id: m.id,
      volunteer_id: m.volunteer_id,
      participated: false,
    }))

    await supabase
      .from('session_participants')
      .upsert(participants, { onConflict: 'session_id,volunteer_id' })
  }

  // Update school operational phase to session_N_ready
  const nextPhase = `session_${d.session_number}_ready` as any
  await supabase.from('schools').update({ operational_phase: nextPhase }).eq('id', d.school_id)

  revalidatePath(`/dashboard/schools/${d.school_id}`)
  revalidatePath('/dashboard/sessions')
  return { ok: true, message: `Session ${d.session_number} scheduled for ${d.planned_date}.`, id: data.id }
}

/** Submit a delivery report for a session. */
export async function submitSessionDeliveryReport(
  _prev: SessionDeliveryActionState,
  formData: FormData,
): Promise<SessionDeliveryActionState> {
  const user = await requireUser('/dashboard/sessions')

  const participantIdsRaw = formData.getAll('participant_ids')
  const participant_ids = participantIdsRaw.map(String).filter(Boolean)

  const photo_url = formData.get('photo_url')?.toString().trim() || undefined
  const document_url = formData.get('document_url')?.toString().trim() || undefined

  const parsed = submitSessionReportSchema.safeParse({
    session_id: formData.get('session_id'),
    topic: formData.get('topic'),
    student_count: formData.get('student_count'),
    volunteer_count: formData.get('volunteer_count'),
    notes: formData.get('notes') || undefined,
    challenges: formData.get('challenges') || undefined,
    next_steps: formData.get('next_steps') || undefined,
    participant_ids,
    photo_url,
    document_url,
  })

  if (!parsed.success) {
    return { error: sanitizeZodError(parsed.error) }
  }

  const d = parsed.data
  const supabase = await createClient()

  // Fetch session details for school_id & campus_id
  const { data: curSess } = await supabase
    .from('sessions')
    .select('school_id, campus_id, status')
    .eq('id', d.session_id)
    .single()

  if (!curSess) return { error: 'Session not found, or you do not have access to it.' }

  if (!canManageSessions(user.role, user.campus_id, curSess.campus_id)) {
    return { error: 'You do not have permission to submit a delivery report for this session.' }
  }

  /**
   * Record a Google Drive evidence link against the session. Re-submitting the
   * report (or retrying after a failure) must not pile up duplicate rows, so an
   * existing auto-recorded link of the same kind is updated in place.
   */
  async function saveEvidenceLink(
    url: string,
    fileType: 'photo' | 'document',
    fileName: string,
    label: string,
  ): Promise<string | null> {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `Please enter a valid HTTP/HTTPS link for the ${label}.`
    }

    const { data: existing } = await supabase
      .from('media_assets')
      .select('id')
      .eq('session_id', d.session_id)
      .eq('file_type', fileType)
      .eq('file_name', fileName)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)

    if (existing && existing.length > 0) {
      const { error: updErr } = await supabase
        .from('media_assets')
        .update({ external_url: url })
        .eq('id', existing[0].id)
      return updErr ? sanitizeDbError(updErr) : null
    }

    const { error: insErr } = await supabase.from('media_assets').insert({
      external_url: url,
      file_name: fileName,
      file_type: fileType,
      entity_type: 'session',
      entity_id: d.session_id,
      session_id: d.session_id,
      school_id: curSess?.school_id || null,
      campus_id: curSess?.campus_id || user.campus_id || null,
      uploaded_by: user.id,
    })
    return insErr ? sanitizeDbError(insErr) : null
  }

  // Auto-record Google Drive evidence links if provided in the report form
  if (d.photo_url) {
    const err = await saveEvidenceLink(d.photo_url, 'photo', PHOTO_EVIDENCE_NAME, 'Session Photo Drive link')
    if (err) return { error: err }
  }

  if (d.document_url) {
    const err = await saveEvidenceLink(
      d.document_url,
      'document',
      DOCUMENT_EVIDENCE_NAME,
      'Attendance/Report Google Doc link',
    )
    if (err) return { error: err }
  }

  // Verify evidence gate: check that at least 1 photo and 1 document media asset
  // exist. Mirrors the same gate in enforce_session_transition() so the user
  // gets a form-level message instead of a database exception.
  const { data: media } = await supabase
    .from('media_assets')
    .select('file_type')
    .eq('session_id', d.session_id)
    .is('deleted_at', null)

  const photoCount = (media ?? []).filter((m) => m.file_type.includes('photo')).length
  const docCount = (media ?? []).filter((m) => m.file_type === 'document' || m.file_type === 'letter').length

  if (photoCount < 1 || docCount < 1) {
    return {
      error: 'Cannot submit report: at least 1 Session Photo link and 1 Attendance/Report Google Doc link are required.',
    }
  }

  // If the session is currently in 'planned' state, transition it to 'in_progress' first
  if (curSess?.status === 'planned') {
    const { error: startErr } = await supabase
      .from('sessions')
      .update({ status: 'in_progress' })
      .eq('id', d.session_id)

    if (startErr) return { error: sanitizeDbError(startErr) }
  }

  // Update session status to reported
  const { data: session, error } = await supabase
    .from('sessions')
    .update({
      topic: d.topic,
      student_count: d.student_count,
      volunteer_count: d.volunteer_count,
      notes: d.notes || null,
      challenges: d.challenges || null,
      next_steps: d.next_steps || null,
      status: 'reported',
    })
    .eq('id', d.session_id)
    .select('school_id, session_number')
    .single()

  if (error) return { error: sanitizeDbError(error) }

  // Record participation flags. Upserted from the school's active team so the
  // rows exist even when the session predates session_participants being
  // populated at scheduling time.
  if (session) {
    const selected = new Set(d.participant_ids ?? [])
    const { data: teamMembers } = await supabase
      .from('school_team_members')
      .select('id, volunteer_id')
      .eq('school_id', session.school_id)
      .eq('is_active', true)

    if (teamMembers && teamMembers.length > 0) {
      await supabase.from('session_participants').upsert(
        teamMembers.map((m) => ({
          session_id: d.session_id,
          school_team_member_id: m.id,
          volunteer_id: m.volunteer_id,
          participated: selected.has(m.volunteer_id),
          marked_by: user.id,
        })),
        { onConflict: 'session_id,volunteer_id' },
      )
    }
  }

  // Update school operational phase
  if (session) {
    const nextPhase = `session_${session.session_number}_submitted` as any
    await supabase.from('schools').update({ operational_phase: nextPhase }).eq('id', session.school_id)
    revalidatePath(`/dashboard/schools/${session.school_id}`)
  }

  revalidatePath(`/dashboard/sessions/${d.session_id}`)
  revalidatePath('/dashboard/sessions')
  return { ok: true, message: 'Session report submitted and awaiting verification.' }
}

/** Verify a reported session (Campus Lead / Exec Lead / Super Admin). */
export async function verifySessionDelivery(
  _prev: SessionDeliveryActionState,
  formData: FormData,
): Promise<SessionDeliveryActionState> {
  const user = await requireUser('/dashboard/sessions')
  if (!['campus_lead', 'exec_lead', 'super_admin'].includes(user.role)) {
    return { error: 'You do not have permission to verify session delivery reports.' }
  }

  const sessionId = formData.get('session_id') as string

  if (!sessionId) return { error: 'Session ID is required' }

  const supabase = await createClient()

  const { data: curSess } = await supabase
    .from('sessions')
    .select('status, campus_id')
    .eq('id', sessionId)
    .single()

  if (!curSess) return { error: 'Session not found, or you do not have access to it.' }

  if (user.role !== 'super_admin' && (!user.campus_id || user.campus_id !== curSess.campus_id)) {
    return { error: 'You can only verify sessions for your own campus.' }
  }

  if (curSess.status !== 'reported' && curSess.status !== 'campus_approved') {
    return { error: 'Only a session with a submitted delivery report can be verified.' }
  }

  // The delivery lifecycle is reported → campus_approved → verified (enforced by
  // enforce_session_transition). The Session Hub exposes this as a single
  // "Verify" action, so record the campus approval leg first.
  if (curSess.status === 'reported') {
    const { error: approveErr } = await supabase
      .from('sessions')
      .update({ status: 'campus_approved', reviewed_by: user.id, reviewed_at: new Date().toISOString() })
      .eq('id', sessionId)

    if (approveErr) return { error: sanitizeDbError(approveErr) }
  }

  // Update session to verified
  const { data: session, error } = await supabase
    .from('sessions')
    .update({
      status: 'verified',
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select('school_id, session_number')
    .single()

  if (error) return { error: sanitizeDbError(error) }

  // Close the school out once all 4 sessions are verified. The DB trigger does
  // this too (0067); calling the RPC keeps the pipeline correct even on a
  // database where the trigger never landed. No-op until the school qualifies.
  let completed = false
  if (session) {
    const { data: didComplete } = await supabase.rpc('finalize_school_completion', {
      p_school_id: session.school_id,
    })
    completed = didComplete === true
  }

  revalidatePath(`/dashboard/sessions/${sessionId}`)
  revalidatePath('/dashboard/sessions')
  if (session) {
    revalidatePath(`/dashboard/schools/${session.school_id}`)
    revalidatePath('/dashboard/schools')
  }
  return {
    ok: true,
    message: completed
      ? `Session ${session?.session_number ?? ''} verified — all 4 sessions complete, school program closed out! 🎓`
      : `Session ${session?.session_number ?? ''} verified!`,
  }
}
