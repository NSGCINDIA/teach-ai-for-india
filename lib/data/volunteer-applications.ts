import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { VolunteerApplicationRow } from '@/types/database'

export type CampusVolunteerApplication = VolunteerApplicationRow & {
  claimer_name: string | null
}

/**
 * Volunteer applications the signed-in lead may see. RLS does the scoping
 * (own campus for campus_lead / volunteer_lead, everything for super_admin),
 * so there is deliberately no campus filter here to get out of sync with it.
 */
export const listCampusVolunteerApplications = cache(async (): Promise<CampusVolunteerApplication[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('volunteer_applications')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) {
    console.error('listCampusVolunteerApplications failed:', error.message)
    return []
  }

  const rows = (data ?? []) as VolunteerApplicationRow[]
  const claimerIds = [...new Set(rows.map((r) => r.claimed_by).filter((v): v is string => !!v))]
  const names = new Map<string, string>()
  if (claimerIds.length > 0) {
    const { data: users } = await supabase.from('users').select('id, full_name').in('id', claimerIds)
    for (const u of users ?? []) names.set(u.id, u.full_name)
  }

  return rows.map((r) => ({ ...r, claimer_name: r.claimed_by ? names.get(r.claimed_by) ?? null : null }))
})
