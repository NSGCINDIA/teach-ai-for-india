'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import { sanitizeDbError } from '@/lib/errors'
import { sendMail, type MailResult } from '@/lib/email/mailer'
import {
  interviewInviteEmail,
  rejectedEmail,
  selectedEmail,
} from '@/lib/email/volunteer-application-emails'
import {
  applicationIdSchema,
  claimApplicationSchema,
  interviewResultSchema,
  scheduleInterviewSchema,
} from '@/lib/validations/volunteer-applications'
import type { VolunteerApplicationRow } from '@/types/database'

/**
 * Volunteer-application pipeline — the Volunteer Lead's side (steps 5–8).
 *
 * Each action: requireUser() → zod → RPC (the database enforces "volunteer_lead
 * of this campus" and the stage rules) → email. Emails go out through Nodemailer
 * and the DB records the outcome *after* the send was accepted, so a failed send
 * leaves the application where it was and the lead can simply click send again.
 */

const PATH = '/dashboard/volunteer-applications'
const FALLBACK = 'Something went wrong. Please try again.'

export type ApplicationActionState = { ok?: boolean; error?: string; message?: string }

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

function mailError(result: Extract<MailResult, { sent: false }>, what: string): string {
  return result.reason === 'not_configured'
    ? `Email is not configured on this server (SMTP settings are missing), so the ${what} was not sent.`
    : `The ${what} could not be sent. Check the student's email address and try again.`
}

async function loadApplication(id: string): Promise<VolunteerApplicationRow | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('volunteer_applications').select('*').eq('id', id).maybeSingle()
  return (data as VolunteerApplicationRow | null) ?? null
}

/** Step 5 — the Volunteer Lead picks the application up. Others then see it as taken. */
export async function claimVolunteerApplication(
  _prev: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  await requireUser(PATH)
  const parsed = claimApplicationSchema.safeParse({ id: formData.get('id') })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.rpc('claim_volunteer_application', { p_id: parsed.data.id })
  if (error) return { error: sanitizeDbError(error, FALLBACK) }

  revalidatePath(PATH)
  return { ok: true, message: 'Application picked up. Schedule the interview next.' }
}

/** Sends the invite for an already-scheduled interview and stamps invite-sent. */
async function sendInvite(app: VolunteerApplicationRow): Promise<ApplicationActionState> {
  if (!app.interview_at || !app.interviewer_name || !app.interview_mode) {
    return { error: 'Schedule the interview first.' }
  }
  const mail = await sendMail({
    to: app.email,
    ...interviewInviteEmail({
      fullName: app.full_name,
      interviewAt: app.interview_at,
      interviewer: app.interviewer_name,
      mode: app.interview_mode,
    }),
  })
  if (!mail.sent) {
    return { error: `Interview saved. ${mailError(mail, 'invite')} Use "Resend invite" once it is fixed.` }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('mark_volunteer_invite_sent', { p_id: app.id })
  if (error) return { error: sanitizeDbError(error, FALLBACK) }
  return { ok: true, message: `Interview invite sent to ${app.email}.` }
}

/** Step 6 — schedule (or reschedule) the interview and send the invite. */
export async function scheduleVolunteerInterview(
  _prev: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  await requireUser(PATH)
  const parsed = scheduleInterviewSchema.safeParse({
    id: formData.get('id'),
    interview_at: formData.get('interview_at'),
    interviewer: formData.get('interviewer'),
    mode: formData.get('mode'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.rpc('schedule_volunteer_interview', {
    p_id: parsed.data.id,
    p_interview_at: parsed.data.interview_at.toISOString(),
    p_interviewer: parsed.data.interviewer,
    p_mode: parsed.data.mode,
  })
  if (error) return { error: sanitizeDbError(error, FALLBACK) }

  const app = await loadApplication(parsed.data.id)
  revalidatePath(PATH)
  if (!app) return { error: 'Interview saved, but the application could not be reloaded to send the invite.' }
  return sendInvite(app)
}

/** Re-sends the invite for the interview that is already scheduled. */
export async function resendInterviewInvite(
  _prev: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  await requireUser(PATH)
  const parsed = applicationIdSchema.safeParse({ id: formData.get('id') })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const app = await loadApplication(parsed.data.id)
  if (!app) return { error: 'Application not found.' }
  const result = await sendInvite(app)
  revalidatePath(PATH)
  return result
}

/** Step 7 — enter the success coach's verdict. */
export async function recordInterviewResult(
  _prev: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  await requireUser(PATH)
  const rawNotes = formData.get('notes')
  const parsed = interviewResultSchema.safeParse({
    id: formData.get('id'),
    result: formData.get('result'),
    notes: typeof rawNotes === 'string' ? rawNotes : '',
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.rpc('record_volunteer_interview_result', {
    p_id: parsed.data.id,
    p_result: parsed.data.result,
    p_notes: parsed.data.notes ?? null,
  })
  if (error) return { error: sanitizeDbError(error, FALLBACK) }

  revalidatePath(PATH)
  return {
    ok: true,
    message: parsed.data.result === 'selected'
      ? 'Result saved. Send the "Selected" email to finish.'
      : 'Result saved. Send the "Rejected" email to finish.',
  }
}

/** Step 8a / 8b — the lead clicks send on the Selected or Rejected email. */
export async function sendDecisionEmail(
  _prev: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  await requireUser(PATH)
  const parsed = applicationIdSchema.safeParse({ id: formData.get('id') })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const app = await loadApplication(parsed.data.id)
  if (!app) return { error: 'Application not found.' }
  if (app.status !== 'reviewing' || !app.interview_result) {
    return { error: 'Record the interview result before sending the decision email.' }
  }

  const selected = app.interview_result === 'selected'
  const mail = await sendMail({
    to: app.email,
    ...(selected
      ? selectedEmail({ fullName: app.full_name, signupUrl: `${siteUrl()}/signup` })
      : rejectedEmail({ fullName: app.full_name })),
  })
  if (!mail.sent) return { error: mailError(mail, selected ? '"Selected" email' : '"Rejected" email') }

  const supabase = await createClient()
  const { error } = await supabase.rpc('finalize_volunteer_application', { p_id: app.id })
  if (error) {
    return { error: `The email was sent, but the application could not be closed: ${sanitizeDbError(error, FALLBACK)}` }
  }

  revalidatePath(PATH)
  return {
    ok: true,
    message: selected
      ? `${app.full_name} is now a selected volunteer. Welcome email sent.`
      : `Rejection email sent to ${app.full_name}. The application is closed.`,
  }
}
