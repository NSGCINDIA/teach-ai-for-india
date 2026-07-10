'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSessionUser } from '@/lib/auth/user'
import { roleHomePath, isAdmin } from '@/lib/auth/rbac'
import { roleLabel } from '@/lib/auth/roles'
import { sendEmail } from '@/lib/email/resend'
import { clientIp, failureCount, recordFailure, clearFailures, rateLimit } from '@/lib/security/rate-limit'
import { escapeHtml } from '@/lib/security/sanitize'
import { signInSchema, emailSchema, setPasswordSchema, inviteSchema, signupSchema } from '@/lib/validations/auth'
import { formValues } from '@/lib/actions/form-values'
import type { UserRole } from '@/types/database'

export type ActionState = {
  error?: string; ok?: boolean; message?: string
  /** Submitted field values, echoed back so the form can repopulate itself after an error. Never includes password/confirm. */
  values?: Record<string, string>
}

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// Login brute-force thresholds (issue #10): failed attempts only.
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_PER_ACCOUNT = 8 // this IP against one account
const LOGIN_MAX_PER_IP = 30 // this IP across all accounts (spray protection)

/**
 * Only allow same-origin relative paths as a post-login redirect (issue #10).
 * Rejects protocol-relative (`//evil.com`), backslash tricks, and absolute URLs
 * so the `next` param can't be turned into an open redirect.
 */
function safeNextPath(next: string): string | null {
  if (!next || !next.startsWith('/')) return null
  if (next.startsWith('//') || next.startsWith('/\\') || next.startsWith('/%2f') || next.startsWith('/%5c')) return null
  return next
}

// ─── Sign in (email + password) ──────────────────────────────────────────────
export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  // Only the email is ever echoed back on error — never the password (issue: form-reset fix).
  const values = { email: String(formData.get('email') ?? '') }

  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message, values }

  // Throttle repeated FAILED attempts per account and per IP (issue #10).
  const ip = clientIp(await headers())
  const email = parsed.data.email.toLowerCase()
  const acctKey = `login:${ip}:${email}`
  const ipKey = `login-ip:${ip}`
  if (
    failureCount(acctKey, LOGIN_WINDOW_MS) >= LOGIN_MAX_PER_ACCOUNT ||
    failureCount(ipKey, LOGIN_WINDOW_MS) >= LOGIN_MAX_PER_IP
  ) {
    return { error: 'Too many failed sign-in attempts. Please wait a few minutes and try again.', values }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) {
    recordFailure(acctKey)
    recordFailure(ipKey)
    return { error: 'Invalid email or password.', values }
  }
  clearFailures(acctKey)
  clearFailures(ipKey)

  // Record login + read role for redirect.
  const { data: profile } = await supabase
    .from('users')
    .select('role, is_active')
    .eq('id', data.user.id)
    .single()

  // No profile row → a self-signup that an admin hasn't approved yet (PRD §7.2).
  if (!profile) {
    await supabase.auth.signOut()
    return { error: 'Your account is awaiting admin approval. You’ll be able to log in once it’s approved.', values }
  }

  if (profile.is_active === false) {
    await supabase.auth.signOut()
    return { error: 'Your account is inactive. Contact your admin.', values }
  }

  await supabase.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', data.user.id)

  const next = safeNextPath((formData.get('next') as string) || '')
  redirect(next ?? roleHomePath((profile?.role as UserRole) ?? 'volunteer'))
}

// ─── Sign out ────────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ─── Forgot password — send reset email ──────────────────────────────────────
export async function requestPasswordReset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const values = formValues(formData)

  const parsed = emailSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return { error: parsed.error.issues[0].message, values }

  const ip = clientIp(await headers())
  const email = parsed.data.email.toLowerCase()

  // Apply rate limits to prevent bulk email enumeration probing.
  const ipVerdict = rateLimit(`reset-ip:${ip}`, 10, 15 * 60 * 1000)
  const emailVerdict = rateLimit(`reset-email:${email}`, 3, 15 * 60 * 1000)

  if (!ipVerdict.allowed || !emailVerdict.allowed) {
    return { error: 'Too many password reset requests. Please wait a few minutes and try again.', values }
  }

  // Graceful degradation when Supabase is not configured (PRD §15 / README)
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                       !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-ref') &&
                       process.env.SUPABASE_SERVICE_ROLE_KEY && 
                       !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your-service-role-key');

  if (!isConfigured) {
    const mockUsers = ['admin@teachaiforindia.org', 'hello@teachaiforindia.org'];
    if (mockUsers.includes(email)) {
      return { ok: true, message: 'If that email exists, a reset link is on its way.' }
    }
    return { error: "This email isn't registered. Please create an account first.", values }
  }

  const admin = createAdminClient()
  const { data: userExists, error: checkError } = await admin
    .from('users')
    .select('id')
    .ilike('email', email)
    .maybeSingle()

  if (checkError) {
    return { error: 'Something went wrong. Please try again.', values }
  }

  if (!userExists) {
    return { error: "This email isn't registered. Please create an account first.", values }
  }

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/reset-password`,
  })

  return { ok: true, message: 'If that email exists, a reset link is on its way.' }
}

// ─── Set / update password (reset flow AND invite accept) ────────────────────
export async function updatePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = setPasswordSchema.safeParse({
    password: formData.get('password'),
    confirm: formData.get('confirm'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Your link has expired. Request a new one.' }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) return { error: error.message }

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  redirect(roleHomePath((profile?.role as UserRole) ?? 'volunteer'))
}

// ─── Public self-signup — request an account (admin-approval gated, PRD §7.2) ─
const SIGNUP_MAX_PER_DAY = 5
const SIGNUP_WINDOW_MS = 24 * 60 * 60 * 1000

/** Best-effort client IP from the deployment proxy headers (issue #9). */
async function callerIp(): Promise<string> {
  const h = await headers()
  const fwd = h.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim() || 'unknown'
  return h.get('x-real-ip')?.trim() || 'unknown'
}

export async function requestSignup(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = createAdminClient()

  // Echoed back on error so the form can repopulate — deliberately built by hand
  // (not formValues) so password/confirm never enter the returned state.
  const values = {
    full_name: String(formData.get('full_name') ?? ''),
    niat_id: String(formData.get('niat_id') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    campus_id: String(formData.get('campus_id') ?? ''),
    requested_role: String(formData.get('requested_role') ?? ''),
    email: String(formData.get('email') ?? ''),
  }

  // Rate limit BEFORE validation (issue #9): the attempt is recorded up-front so
  // that even submissions which fail validation count toward the per-IP daily
  // cap — otherwise the limit could be bypassed by intentionally failing first.
  const ip = await callerIp()
  const since = new Date(Date.now() - SIGNUP_WINDOW_MS).toISOString()
  const { count } = await admin
    .from('signup_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gte('created_at', since)
  if ((count ?? 0) >= SIGNUP_MAX_PER_DAY) {
    return { error: 'Too many signup attempts from this device. Please try again tomorrow.', values }
  }
  await admin.from('signup_attempts').insert({ ip_address: ip })

  const parsed = signupSchema.safeParse({
    full_name: formData.get('full_name'),
    niat_id: formData.get('niat_id'),
    phone: formData.get('phone'),
    campus_id: formData.get('campus_id'),
    requested_role: formData.get('requested_role'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirm: formData.get('confirm'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message, values }
  const { full_name, niat_id, phone, campus_id, requested_role, email, password } = parsed.data

  // Block obvious repeats early (a live request or an existing account).
  const { data: pending } = await admin
    .from('signup_requests')
    .select('id')
    .eq('status', 'pending')
    .ilike('email', email)
    .maybeSingle()
  if (pending) {
    return { error: 'A request with this email is already awaiting admin approval.', values }
  }

  // Create the credential up-front (so the applicant sets their own password),
  // but flag it so handle_new_user() keeps it OUT of public.users until approval.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { full_name, campus_id, niat_id, phone, pending_approval: 'true' },
  })
  if (createErr || !created?.user) {
    if (/already|registered|exists/i.test(createErr?.message ?? '')) {
      return { error: 'An account with this email already exists. Try logging in instead.', values }
    }
    return { error: 'Could not submit your request. Please try again.', values }
  }

  const { error: reqErr } = await admin.from('signup_requests').insert({
    auth_user_id: created.user.id,
    full_name,
    niat_id,
    phone,
    email,
    campus_id,
    requested_role,
    status: 'pending',
  })
  if (reqErr) {
    // Roll back the inert auth user so a retry isn't blocked by a dangling credential.
    await admin.auth.admin.deleteUser(created.user.id)
    return { error: 'Could not submit your request. Please try again.', values }
  }

  // Notify every active admin — in-app feed + email.
  const { data: admins } = await admin
    .from('users')
    .select('id, email')
    .eq('role', 'super_admin')
    .eq('is_active', true)

  if (admins?.length) {
    await admin.from('notifications').insert(
      admins.map((a) => ({
        recipient_id: a.id,
        type: 'signup_request',
        title: 'New account signup',
        body: `${full_name} (${email}) requested an account.`,
        action_url: '/admin/volunteers',
        entity_type: 'signup_request',
      })),
    )
    const to = admins.map((a) => a.email).filter(Boolean)
    if (to.length) {
      await sendEmail({
        to,
        subject: 'New account signup awaiting approval',
        html: `<p><strong>${escapeHtml(full_name)}</strong> (${escapeHtml(email)}) has requested an account.</p>
          <p>NIAT ID: ${escapeHtml(niat_id)}</p>
          <p>Review and approve it from the <a href="${siteUrl()}/admin/volunteers">Volunteers &amp; team</a> page.</p>`,
      })
    }
  }

  return {
    ok: true,
    message: 'Request submitted! An admin will review it and you’ll be able to log in once approved.',
  }
}

// ─── Admin: invite a new team member (US-AUTH-01) ────────────────────────────
export async function inviteUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const values = formValues(formData)
  const me = await getSessionUser()
  if (!me || !isAdmin(me.role)) return { error: 'Not authorized.', values }

  const parsed = inviteSchema.safeParse({
    email: formData.get('email'),
    full_name: formData.get('full_name'),
    role: formData.get('role'),
    campus_id: formData.get('campus_id') ?? '',
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message, values }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    data: {
      full_name: parsed.data.full_name,
      role: parsed.data.role,
      campus_id: parsed.data.campus_id || null,
      invited_by: me.id,
    },
    redirectTo: `${siteUrl()}/auth/callback?next=/accept-invite`,
  })
  if (error) return { error: error.message, values }

  await sendEmail({
    to: parsed.data.email,
    subject: 'You’re invited to Teach AI for India',
    html: `<p>Hi ${escapeHtml(parsed.data.full_name)},</p>
      <p>You’ve been invited to join Teach AI for India as a <strong>${roleLabel(parsed.data.role as UserRole)}</strong>.</p>
      <p>Check your inbox for the secure sign-in link to set your password. The link expires in 48 hours.</p>`,
  })

  return { ok: true, message: `Invite sent to ${parsed.data.email}.` }
}
