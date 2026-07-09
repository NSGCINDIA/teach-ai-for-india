import { createClient } from '@/lib/supabase/server'
import type { CertificateRow } from '@/types/database'

export type CertificateItem = CertificateRow & {
  volunteer: { id: string; full_name: string } | null
  issuer: { full_name: string } | null
  campus: { name: string } | null
}

/** A volunteer's own certificates, newest first (RLS: self, or a lead/admin of their campus). */
export async function listMyCertificates(volunteerId: string): Promise<CertificateItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('certificates')
    .select('*, volunteer:users!certificates_volunteer_id_fkey(id, full_name), issuer:users!certificates_issued_by_fkey(full_name), campus:campuses(name)')
    .eq('volunteer_id', volunteerId)
    .order('issued_at', { ascending: false })
  if (error) throw new Error(`listMyCertificates failed: ${error.message}`)
  return (data as unknown as CertificateItem[] | null) ?? []
}

/** Certificates issued across a campus — the Volunteer Lead's ledger. */
export async function listCampusCertificates(campusId: string | null): Promise<CertificateItem[]> {
  const supabase = await createClient()
  let query = supabase
    .from('certificates')
    .select('*, volunteer:users!certificates_volunteer_id_fkey(id, full_name), issuer:users!certificates_issued_by_fkey(full_name), campus:campuses(name)')
    .order('issued_at', { ascending: false })
    .limit(500)
  if (campusId) query = query.eq('campus_id', campusId)
  const { data } = await query
  return (data as unknown as CertificateItem[] | null) ?? []
}

/** A single certificate for the printable view (RLS scopes access). */
export async function getCertificate(id: string): Promise<CertificateItem | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('certificates')
    .select('*, volunteer:users!certificates_volunteer_id_fkey(id, full_name), issuer:users!certificates_issued_by_fkey(full_name), campus:campuses(name)')
    .eq('id', id)
    .maybeSingle()
  return (data as unknown as CertificateItem | null) ?? null
}
