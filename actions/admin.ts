'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth/user'
import { can, isAdmin } from '@/lib/auth/rbac'
import { SELF_SIGNUP_ROLES } from '@/lib/auth/roles'
import { sendEmail } from '@/lib/email/resend'
import { escapeHtml } from '@/lib/security/sanitize'
import {
  roleChangeSchema,
  userActiveSchema,
  campusSchema,
  contentBlockSchema,
  financeConfigSchema,
} from '@/lib/validations/admin'
import type { UserRole } from '@/types/database'

export type AdminActionState = { error?: string; ok?: boolean; message?: string }

function nullify<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj }
  for (const k in out) if (out[k] === '') (out as Record<string, unknown>)[k] = null
  return out
}

// ─── User management (PRD §7.9) ──────────────────────────────────────────────
export async function changeUserRole(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const me = await requireUser('/admin/volunteers')
  if (can(me.role, 'manage_user_roles') === false) return { error: 'Only a super admin can change roles.' }

  const parsed = roleChangeSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  if (parsed.data.user_id === me.id) return { error: 'You cannot change your own role.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({ role: parsed.data.role as UserRole })
    .eq('id', parsed.data.user_id)
  if (error) return { error: humanize(error.message) }

  revalidatePath('/admin/volunteers')
  revalidatePath('/dashboard/volunteers')
  return { ok: true, message: 'Role updated.' }
}

export async function setUserActive(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const me = await requireUser('/admin/volunteers')
  if (can(me.role, 'manage_user_roles') === false) return { error: 'Not authorized to change account status.' }

  const parsed = userActiveSchema.safeParse({
    user_id: formData.get('user_id'),
    is_active: formData.get('is_active') === 'true',
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  if (parsed.data.user_id === me.id) return { error: 'You cannot deactivate your own account.' }

  const supabase = await createClient()
  const { error } = await supabase.from('users').update({ is_active: parsed.data.is_active }).eq('id', parsed.data.user_id)
  if (error) return { error: humanize(error.message) }

  revalidatePath('/admin/volunteers')
  revalidatePath('/dashboard/volunteers')
  return { ok: true, message: parsed.data.is_active ? 'Account activated.' : 'Account deactivated.' }
}

// ─── Self-signup requests — approve / reject (PRD §7.2) ──────────────────────
const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function approveSignup(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const me = await requireUser('/admin/volunteers')
  if (!isAdmin(me.role)) return { error: 'Not authorized to approve signups.' }
  const id = String(formData.get('id') ?? '')
  if (!id) return { error: 'Missing request id.' }

  const admin = createAdminClient()
  const { data: req } = await admin.from('signup_requests').select('*').eq('id', id).maybeSingle()
  if (!req) return { error: 'Signup request not found.' }
  if (req.status !== 'pending') return { error: 'This request has already been reviewed.' }
  if (!req.auth_user_id) return { error: 'This request is missing its credential and cannot be approved.' }

  // Honour the applicant's requested role, but never trust it for a privileged
  // role — clamp to the self-requestable set (defence-in-depth atop the DB CHECK).
  const grantedRole: UserRole = SELF_SIGNUP_ROLES.includes(req.requested_role as UserRole)
    ? (req.requested_role as UserRole)
    : 'volunteer'

  // Materialise the profile the handle_new_user trigger deliberately skipped.
  const { error: insErr } = await admin.from('users').insert({
    id: req.auth_user_id,
    email: req.email,
    full_name: req.full_name,
    phone: req.phone,
    role: grantedRole,
    campus_id: req.campus_id,
    niat_id: req.niat_id,
    is_active: true,
    invited_by: me.id,
    invited_at: new Date().toISOString(),
  })
  if (insErr) return { error: humanize(insErr.message) }

  // Confirm the email and clear the pending flag so they can log in.
  await admin.auth.admin.updateUserById(req.auth_user_id, {
    email_confirm: true,
    user_metadata: { full_name: req.full_name, campus_id: req.campus_id, niat_id: req.niat_id, phone: req.phone, pending_approval: null },
  })

  await admin
    .from('signup_requests')
    .update({ status: 'approved', reviewed_by: me.id, reviewed_at: new Date().toISOString() })
    .eq('id', id)

  await admin.from('notifications').insert({
    recipient_id: req.auth_user_id,
    type: 'signup_approved',
    title: 'Your account is approved 🎉',
    body: 'Welcome to Teach AI for India. You can now log in.',
    action_url: '/login',
  })
  await admin.from('audit_log').insert({
    actor_id: me.id, action: 'approve', entity_type: 'signup_request', entity_id: id,
    detail: { email: req.email },
  })
  await sendEmail({
    to: req.email,
    subject: 'Your Teach AI for India account is approved',
    html: `<p>Hi ${escapeHtml(req.full_name)},</p>
      <p>Your account has been approved. You can now <a href="${siteUrl()}/login">log in</a> with the email and password you signed up with.</p>`,
  })

  revalidatePath('/admin/volunteers')
  revalidatePath('/dashboard/volunteers') // new member joins the campus roster
  return { ok: true, message: `${req.full_name} approved and can now log in.` }
}

export async function rejectSignup(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const me = await requireUser('/admin/volunteers')
  if (!isAdmin(me.role)) return { error: 'Not authorized to reject signups.' }
  const id = String(formData.get('id') ?? '')
  if (!id) return { error: 'Missing request id.' }

  const admin = createAdminClient()
  const { data: req } = await admin.from('signup_requests').select('*').eq('id', id).maybeSingle()
  if (!req) return { error: 'Signup request not found.' }
  if (req.status !== 'pending') return { error: 'This request has already been reviewed.' }

  // Remove the inert credential so the email is free to apply again later.
  if (req.auth_user_id) await admin.auth.admin.deleteUser(req.auth_user_id)

  await admin
    .from('signup_requests')
    .update({ status: 'rejected', reviewed_by: me.id, reviewed_at: new Date().toISOString() })
    .eq('id', id)

  await admin.from('audit_log').insert({
    actor_id: me.id, action: 'reject', entity_type: 'signup_request', entity_id: id,
    detail: { email: req.email },
  })

  // Tell the applicant, and give them a way to re-apply (the email + credential
  // are now free, so /signup will accept a fresh request).
  await sendEmail({
    to: req.email,
    subject: 'Update on your Teach AI for India account request',
    html: `<p>Hi ${escapeHtml(req.full_name)},</p>
      <p>Thanks for your interest in Teach AI for India. After review, we weren’t able to approve your account request this time.</p>
      <p>If you think this was a mistake or your details have changed, you’re welcome to request an account again:</p>
      <p><a href="${siteUrl()}/signup" style="display:inline-block;padding:10px 18px;background:#FF6B35;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Request again</a></p>
      <p style="color:#667085;font-size:13px">Or visit ${siteUrl()}/signup</p>`,
  })

  revalidatePath('/admin/volunteers')
  return { ok: true, message: `${req.full_name}’s request was rejected.` }
}

// ─── Volunteer applications — accept / reject (PRD §7.1/§11) ─────────────────
export async function reviewVolunteerApplication(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const me = await requireUser('/admin/volunteers')
  if (!isAdmin(me.role)) return { error: 'Not authorized to review applications.' }

  const id = String(formData.get('id') ?? '')
  const decision = String(formData.get('decision') ?? '')
  if (!id) return { error: 'Missing application id.' }
  if (decision !== 'invited' && decision !== 'rejected') return { error: 'Invalid decision.' }

  const supabase = await createClient()
  const { data: application } = await supabase
    .from('volunteer_applications')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (!application) return { error: 'Application not found.' }
  if (application.status !== 'new' && application.status !== 'reviewing') {
    return { error: 'This application has already been reviewed.' }
  }

  const { error } = await supabase
    .from('volunteer_applications')
    .update({ status: decision, reviewed_by: me.id })
    .eq('id', id)
  if (error) return { error: humanize(error.message) }

  await supabase.from('audit_log').insert({
    actor_id: me.id,
    action: decision === 'invited' ? 'invite' : 'reject',
    entity_type: 'volunteer_application',
    entity_id: id,
    detail: { email: application.email },
  })

  revalidatePath('/admin/volunteers')
  return {
    ok: true,
    message: decision === 'invited' ? `${application.full_name} marked as invited.` : `${application.full_name}’s application was rejected.`,
  }
}

// ─── Campus management (PRD §7.9 — campus config) ────────────────────────────
export async function saveCampus(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const me = await requireUser('/admin/campuses')
  if (!isAdmin(me.role)) return { error: 'Not authorized to manage campuses.' }

  const parsed = campusSchema.safeParse({
    ...Object.fromEntries(formData),
    is_active: formData.get('is_active') === 'on' || formData.get('is_active') === 'true',
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { id, ...fields } = nullify(parsed.data)

  const supabase = await createClient()
  const payload = { ...fields }
  const { error } = id
    ? await supabase.from('campuses').update(payload).eq('id', id)
    : await supabase.from('campuses').insert(payload)
  if (error) return { error: humanize(error.message) }

  revalidatePath('/admin/campuses')
  revalidatePath('/campuses') // public listing
  revalidatePath('/', 'layout')
  return { ok: true, message: id ? 'Campus updated.' : 'Campus created.' }
}

// ─── CMS content editor (PRD §7.10) ──────────────────────────────────────────
export async function saveContentBlock(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const me = await requireUser('/admin/content')
  if (!isAdmin(me.role)) return { error: 'Not authorized to edit content.' }

  const parsed = contentBlockSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  let content: unknown
  try {
    content = JSON.parse(parsed.data.content)
  } catch {
    return { error: 'Content is not valid JSON. Check for a missing comma or quote.' }
  }
  if (typeof content !== 'object' || content === null || Array.isArray(content)) {
    return { error: 'Content must be a JSON object ({ … }).' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('content_blocks')
    .upsert(
      { block_key: parsed.data.block_key, content: content as Record<string, unknown>, updated_by: me.id },
      { onConflict: 'block_key' },
    )
  if (error) return { error: humanize(error.message) }

  // Public pages are ISR (revalidate 300); bust the whole public tree now.
  revalidatePath('/', 'layout')
  revalidatePath('/admin/content')
  return { ok: true, message: 'Content saved and published.' }
}

// ─── Finance thresholds (PRD §7.6/§7.9) ──────────────────────────────────────
export async function saveFinanceConfig(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const me = await requireUser('/admin/settings')
  if (!isAdmin(me.role)) return { error: 'Not authorized to change settings.' }

  const parsed = financeConfigSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase
    .from('content_blocks')
    .upsert(
      { block_key: 'finance_config', content: { claim_window_days: parsed.data.claim_window_days }, updated_by: me.id },
      { onConflict: 'block_key' },
    )
  if (error) return { error: humanize(error.message) }

  revalidatePath('/admin/settings')
  return { ok: true, message: 'Finance settings saved.' }
}

// ─── Contact messages (from the alert feed) ──────────────────────────────────
export async function markMessageHandled(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const me = await requireUser('/admin/settings')
  if (!isAdmin(me.role)) return { error: 'Not authorized.' }
  const id = String(formData.get('id') ?? '')
  if (!id) return { error: 'Missing message id.' }

  const supabase = await createClient()
  const { error } = await supabase.from('contact_messages').update({ is_handled: true }).eq('id', id)
  if (error) return { error: humanize(error.message) }

  revalidatePath('/admin/settings')
  return { ok: true, message: 'Marked as handled.' }
}

// ─── Monthly summary — on-demand email (PRD §7.8) ────────────────────────────
export async function emailMonthlySummary(_prev: AdminActionState, _formData: FormData): Promise<AdminActionState> {
  const me = await requireUser('/admin/reports')
  if (!isAdmin(me.role)) return { error: 'Not authorized.' }

  const { sendMonthlySummary } = await import('@/lib/email/monthly-summary')
  const res = await sendMonthlySummary()
  if (res.error) return { error: res.error }
  if (res.skipped) return { ok: true, message: 'Email provider not configured — nothing sent (set RESEND_API_KEY).' }
  return { ok: true, message: `Summary emailed to ${res.sent} admin${res.sent === 1 ? '' : 's'}.` }
}

function humanize(msg: string): string {
  if (/Insufficient privilege|cannot assign admin roles/i.test(msg)) return 'You do not have permission for that change.'
  if (/duplicate key|unique/i.test(msg)) return 'That slug is already taken by another campus.'
  return msg
}
