import { z } from 'zod'

const SESSION_TYPES = [
  'awareness', 'hands_on', 'prompt_writing', 'ethics_safety', 'application_project', 'followup',
] as const

const time = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Use HH:MM')
  .optional()
  .or(z.literal(''))
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
  .optional()
  .or(z.literal(''))
const count = z.coerce.number().int().min(0).max(10000).optional()
const phone = z
  .string()
  .trim()
  .regex(/^[+\d][\d\s-]{6,14}$/, 'Enter a valid phone')
  .optional()
  .or(z.literal(''))
// Checkboxes arrive as 'on' when checked and are absent when unchecked.
const checkbox = z
  .union([z.literal('on'), z.literal('true'), z.literal('')])
  .optional()
  .transform((v) => v === 'on' || v === 'true')

/**
 * Session planning form (Team Dashboard PRD Phase 2). The expanded ~20-field
 * outreach→execution handoff captured once a school reaches Registered.
 */
export const sessionPlanSchema = z.object({
  school_id: z.string().uuid(),
  coordinator_name: z.string().trim().max(120).optional().or(z.literal('')),
  coordinator_phone: phone,
  coordinator_designation: z.string().trim().max(120).optional().or(z.literal('')),
  student_strength: count,
  num_classes: count,
  num_sections: count,
  num_classrooms: count,
  has_lab: checkbox,
  has_projector: checkbox,
  has_internet: checkbox,
  session_type: z.enum(SESSION_TYPES),
  topic: z.string().trim().max(200).optional().or(z.literal('')),
  planned_date: date,
  backup_date: date,
  start_time: time,
  end_time: time,
  approval_letter_path: z.string().trim().max(500).optional().or(z.literal('')),
  logistics_notes: z.string().trim().max(2000).optional().or(z.literal('')),
})

export const approvePlanSchema = z.object({
  plan_id: z.string().uuid(),
})

export type SessionPlanInput = z.infer<typeof sessionPlanSchema>
