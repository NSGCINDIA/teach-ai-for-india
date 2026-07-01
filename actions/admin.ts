'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import { can, isAdmin } from '@/lib/auth/rbac'
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
  return { ok: true, message: parsed.data.is_active ? 'Account activated.' : 'Account deactivated.' }
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
