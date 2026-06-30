'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/user'
import { isAdmin } from '@/lib/auth/rbac'
import { recordUploadSchema, approveEvidenceSchema, evidenceIdSchema } from '@/lib/validations/evidence'
import { isPubliclyPromotable } from '@/lib/constants/evidence'

export type EvidenceActionState = { error?: string; ok?: boolean; message?: string; id?: string }

const orNull = (v: string | undefined) => (v ? v : null)

/** Persist a media_assets row after the file is uploaded to the evidence bucket. */
export async function recordUpload(input: unknown): Promise<EvidenceActionState> {
  const parsed = recordUploadSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const user = await requireUser('/dashboard/evidence')
  const d = parsed.data

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('media_assets')
    .insert({
      storage_path: d.storage_path,
      file_name: d.file_name,
      file_type: d.file_type,
      mime_type: d.mime_type || null,
      file_size_bytes: d.file_size_bytes,
      entity_type: d.entity_type,
      entity_id: d.entity_id,
      campus_id: orNull(d.campus_id),
      school_id: orNull(d.school_id),
      session_id: orNull(d.session_id),
      caption: d.caption || null,
      uploaded_by: user.id,
    })
    .select('id')
    .single()
  if (error) return { error: error.message }

  if (d.session_id) revalidatePath(`/dashboard/sessions/${d.session_id}`)
  revalidatePath('/dashboard/evidence')
  revalidatePath('/admin/evidence')
  return { ok: true, id: data.id }
}

export async function softDeleteEvidence(
  _prev: EvidenceActionState,
  formData: FormData,
): Promise<EvidenceActionState> {
  const parsed = evidenceIdSchema.safeParse({ id: formData.get('id') })
  if (!parsed.success) return { error: 'Invalid file.' }
  await requireUser('/dashboard/evidence')

  const supabase = await createClient()
  const { error } = await supabase
    .from('media_assets')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', parsed.data.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/evidence')
  revalidatePath('/admin/evidence')
  return { ok: true, message: 'File removed.' }
}

/** Approve evidence; optionally promote a photo to the public gallery. */
export async function approveEvidence(
  _prev: EvidenceActionState,
  formData: FormData,
): Promise<EvidenceActionState> {
  const parsed = approveEvidenceSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'Invalid request.' }
  const user = await requireUser('/admin/evidence')
  const { id, make_public } = parsed.data

  const supabase = await createClient()
  const { data: asset, error: readErr } = await supabase
    .from('media_assets')
    .select('id, storage_path, file_type')
    .eq('id', id)
    .single()
  if (readErr || !asset) return { error: 'File not found.' }

  let isPublic = false
  if (make_public) {
    if (!isAdmin(user.role) && user.role !== 'campus_lead') {
      return { error: 'Only admins or campus leads can publish to the public gallery.' }
    }
    if (!isPubliclyPromotable(asset.file_type)) {
      return { error: 'Only photos can be published to the public gallery.' }
    }
    // Copy the object from the private evidence bucket into public-assets.
    const { data: file, error: dlErr } = await supabase.storage.from('evidence').download(asset.storage_path)
    if (dlErr || !file) return { error: 'Could not read the file to publish it.' }
    const { error: upErr } = await supabase.storage
      .from('public-assets')
      .upload(asset.storage_path, file, { upsert: true, contentType: file.type })
    if (upErr) return { error: `Could not publish: ${upErr.message}` }
    isPublic = true
  }

  const { error } = await supabase
    .from('media_assets')
    .update({
      approval_status: 'approved',
      approved_by: user.id,
      ...(isPublic ? { is_public: true } : {}),
    })
    .eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/evidence')
  revalidatePath('/dashboard/evidence')
  return { ok: true, message: isPublic ? 'Approved and published.' : 'Approved.' }
}

export async function rejectEvidence(
  _prev: EvidenceActionState,
  formData: FormData,
): Promise<EvidenceActionState> {
  const parsed = evidenceIdSchema.safeParse({ id: formData.get('id') })
  if (!parsed.success) return { error: 'Invalid file.' }
  await requireUser('/admin/evidence')

  const supabase = await createClient()
  const { error } = await supabase
    .from('media_assets')
    .update({ approval_status: 'rejected', is_public: false })
    .eq('id', parsed.data.id)
  if (error) return { error: error.message }

  revalidatePath('/admin/evidence')
  return { ok: true, message: 'Rejected.' }
}
