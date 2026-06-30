'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSessionUser } from '@/lib/auth/user'
import { roleHomePath, isAdmin } from '@/lib/auth/rbac'
import { roleLabel } from '@/lib/auth/roles'
import { sendEmail } from '@/lib/email/resend'
import { signInSchema, emailSchema, setPasswordSchema, inviteSchema } from '@/lib/validations/auth'
import type { UserRole } from '@/types/database'

export type ActionState = { error?: string; ok?: boolean; message?: string }

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// ─── Sign in (email + password) ──────────────────────────────────────────────
export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { error: 'Invalid email or password.' }

  // Record login + read role for redirect.
  const { data: profile } = await supabase
    .from('users')
    .select('role, is_active')
    .eq('id', data.user.id)
    .single()

  if (profile && profile.is_active === false) {
    await supabase.auth.signOut()
    return { error: 'Your account is inactive. Contact your admin.' }
  }

  await supabase.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', data.user.id)

  const next = (formData.get('next') as string) || ''
  redirect(next && next.startsWith('/') ? next : roleHomePath((profile?.role as UserRole) ?? 'volunteer'))
}

// ─── Sign out ────────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ─── Forgot password — send reset email ──────────────────────────────────────
export async function requestPasswordReset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = emailSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/reset-password`,
  })
  // Always report success (don't leak which emails exist).
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

// ─── Admin: invite a new team member (US-AUTH-01) ────────────────────────────
export async function inviteUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const me = await getSessionUser()
  if (!me || !isAdmin(me.role)) return { error: 'Not authorized.' }

  const parsed = inviteSchema.safeParse({
    email: formData.get('email'),
    full_name: formData.get('full_name'),
    role: formData.get('role'),
    campus_id: formData.get('campus_id') ?? '',
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

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
  if (error) return { error: error.message }

  await sendEmail({
    to: parsed.data.email,
    subject: 'You’re invited to Teach AI for India',
    html: `<p>Hi ${parsed.data.full_name},</p>
      <p>You’ve been invited to join Teach AI for India as a <strong>${roleLabel(parsed.data.role as UserRole)}</strong>.</p>
      <p>Check your inbox for the secure sign-in link to set your password. The link expires in 48 hours.</p>`,
  })

  return { ok: true, message: `Invite sent to ${parsed.data.email}.` }
}
