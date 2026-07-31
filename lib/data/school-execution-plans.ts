import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { SchoolExecutionPlanRow, UserRow } from '@/types/database'

export type SchoolExecutionPlanDetail = SchoolExecutionPlanRow & {
  submitted_by_user?: Pick<UserRow, 'full_name'> | null
  campus_reviewer?: Pick<UserRow, 'full_name'> | null
  finance_reviewer?: Pick<UserRow, 'full_name'> | null
}

export const getSchoolExecutionPlan = cache(async (schoolId: string): Promise<SchoolExecutionPlanDetail | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('school_execution_plans')
    .select(`
      *,
      submitted_by_user:users!school_execution_plans_submitted_by_fkey(full_name),
      campus_reviewer:users!school_execution_plans_campus_reviewed_by_fkey(full_name),
      finance_reviewer:users!school_execution_plans_finance_reviewed_by_fkey(full_name)
    `)
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return data as unknown as SchoolExecutionPlanDetail
})
