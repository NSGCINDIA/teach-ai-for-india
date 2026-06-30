import { z } from 'zod'

const SESSION_TYPES = [
  'awareness', 'hands_on', 'prompt_writing', 'ethics_safety', 'application_project', 'followup',
] as const
const SESSION_STATUSES = [
  'planned', 'in_progress', 'reported', 'campus_approved', 'verified', 'cancelled',
] as const
const ATTENDANCE_STATUSES = ['present', 'absent', 'late', 'left_early'] as const

const time = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Use HH:MM')
  .optional()
  .or(z.literal(''))
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')

/** Plan a session (PRD §7.4) — minimal up-front fields; starts in 'planned'. */
export const sessionSchema = z.object({
  school_id: z.string().uuid('Select a school'),
  session_type: z.enum(SESSION_TYPES),
  date,
  start_time: time,
  end_time: time,
  topic: z.string().trim().min(3, 'Enter a topic').max(200),
})

/** Edit / fill the report — all operational fields. */
export const sessionUpdateSchema = sessionSchema.extend({
  id: z.string().uuid(),
  student_count: z.coerce.number().int().min(0).max(2000).optional(),
  volunteer_count: z.coerce.number().int().min(0).max(200).optional(),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  challenges: z.string().trim().max(2000).optional().or(z.literal('')),
  next_steps: z.string().trim().max(2000).optional().or(z.literal('')),
  improvement_notes: z.string().trim().max(2000).optional().or(z.literal('')),
  /** Session-type conditional payload → sessions.type_details. */
  type_detail: z.string().trim().max(2000).optional().or(z.literal('')),
})

export const changeSessionStatusSchema = z.object({
  session_id: z.string().uuid(),
  new_status: z.enum(SESSION_STATUSES),
  note: z.string().trim().max(1000).optional().or(z.literal('')),
})

const attendanceEntry = z.object({
  user_id: z.string().uuid(),
  status: z.enum(ATTENDANCE_STATUSES),
  arrival_time: time,
  departure_time: time,
})

/** Roster submitted as a JSON string from the attendance editor. */
export const attendanceSchema = z.object({
  session_id: z.string().uuid(),
  roster: z
    .string()
    .transform((s, ctx) => {
      try {
        return JSON.parse(s)
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid roster payload' })
        return z.NEVER
      }
    })
    .pipe(z.array(attendanceEntry).max(200)),
})

export type SessionInput = z.infer<typeof sessionSchema>
export type SessionUpdateInput = z.infer<typeof sessionUpdateSchema>
export type AttendanceEntry = z.infer<typeof attendanceEntry>
