import { createClient } from '@/lib/supabase/server'
import type { ExecutionPlanRow } from '@/types/database'

/** All execution plans filed for a session, newest first (session-detail panel). */
export async function listExecutionPlansForSession(sessionId: string): Promise<ExecutionPlanRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('execution_plans')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`listExecutionPlansForSession failed: ${error.message}`)
  return (data as ExecutionPlanRow[]) ?? []
}
