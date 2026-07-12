'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { certificateSchema, revokeCertificateSchema } from '@/lib/validations/workspace'
import { formValues } from '@/lib/actions/form-values'

export type CertificateActionState = {
  error?: string; ok?: boolean; message?: string
  /** Submitted field values, echoed back so the form can repopulate itself after an error. */
  values?: Record<string, string>
}

/** A lead issues a certificate to a volunteer (DB trigger notifies them). */
export async function issueCertificate(
  _prev: CertificateActionState,
  formData: FormData,
): Promise<CertificateActionState> {
  const values = formValues(formData)
  const user = await requireUser('/dashboard/certificates')
  if (can(user.role, 'assign_volunteers') === false) {
    return { error: 'You do not have permission to issue certificates.', values }
  }

  const parsed = certificateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message, values }

  const supabase = await createClient()
  const { error } = await supabase.from('certificates').insert({
    volunteer_id: parsed.data.volunteer_id,
    kind: parsed.data.kind,
    title: parsed.data.title,
    description: parsed.data.description || null,
    sessions_count: parsed.data.sessions_count ?? null,
    issued_by: user.id,
  })
  if (error) return { error: error.message, values }

  revalidatePath('/dashboard/certificates')
  return { ok: true, message: 'Certificate issued.' }
}

export async function revokeCertificate(
  _prev: CertificateActionState,
  formData: FormData,
): Promise<CertificateActionState> {
  const user = await requireUser('/dashboard/certificates')
  if (can(user.role, 'assign_volunteers') === false) {
    return { error: 'You do not have permission to revoke certificates.' }
  }
  const parsed = revokeCertificateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'Missing certificate.' }

  const supabase = await createClient()
  const { error } = await supabase.from('certificates').delete().eq('id', parsed.data.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/certificates')
  return { ok: true, message: 'Certificate revoked.' }
}
