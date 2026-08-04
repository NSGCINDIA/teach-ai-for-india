import { z } from 'zod'

export const createSessionDeliveryPlanSchema = z.object({
  school_id: z.string().uuid(),
  session_number: z.coerce.number().int().min(1).max(4),
  topic: z.string().min(1, 'Session topic is required'),
  session_type: z.enum(['awareness', 'hands_on', 'prompt_writing', 'ethics_safety', 'application_project', 'followup']).default('awareness'),
  planned_date: z.string().min(1, 'Planned date is required'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  notes: z.string().optional(),
})

export const submitSessionReportSchema = z.object({
  session_id: z.string().uuid(),
  topic: z.string().min(1, 'Session topic is required'),
  student_count: z.coerce.number().int().min(1, 'Student count must be at least 1'),
  volunteer_count: z.coerce.number().int().min(1, 'Volunteer count must be at least 1'),
  notes: z.string().optional(),
  challenges: z.string().optional(),
  next_steps: z.string().optional(),
  participant_ids: z.array(z.string().uuid()).optional(),
  photo_url: z.string().optional(),
  document_url: z.string().optional(),
})

export type CreateSessionDeliveryPlanInput = z.infer<typeof createSessionDeliveryPlanSchema>
export type SubmitSessionReportInput = z.infer<typeof submitSessionReportSchema>
