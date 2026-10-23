import type { VolunteerApplicationRow } from '@/types/database'
import type { StatusTone } from '@/lib/constants/status'

/**
 * Where a volunteer application is in the hiring pipeline. Derived from the row
 * rather than stored, so it cannot drift from the columns the RPCs write
 * (0071_volunteer_application_pipeline.sql):
 *
 *   new                                   → applied
 *   reviewing, no interview yet           → picked_up
 *   reviewing, interview_at set           → interview_scheduled
 *   reviewing, interview_result set       → interview_done (decision email pending)
 *   invited | rejected                    → selected | rejected
 */
export type ApplicationStage =
  | 'applied' | 'picked_up' | 'interview_scheduled' | 'interview_done' | 'selected' | 'rejected'

export type StageInput = Pick<VolunteerApplicationRow, 'status' | 'interview_at' | 'interview_result'>

export function applicationStage(a: StageInput): ApplicationStage {
  if (a.status === 'new') return 'applied'
  if (a.status === 'invited') return 'selected'
  if (a.status === 'rejected') return 'rejected'
  if (a.interview_result) return 'interview_done'
  if (a.interview_at) return 'interview_scheduled'
  return 'picked_up'
}

export const STAGE_META: Record<ApplicationStage, { label: string; tone: StatusTone }> = {
  applied:             { label: 'Applied',             tone: 'neutral' },
  picked_up:           { label: 'Picked up',           tone: 'info' },
  interview_scheduled: { label: 'Interview scheduled', tone: 'progress' },
  interview_done:      { label: 'Decision pending',    tone: 'pending' },
  selected:            { label: 'Selected',            tone: 'success' },
  rejected:            { label: 'Rejected',            tone: 'danger' },
}
