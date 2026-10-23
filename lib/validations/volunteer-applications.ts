import { z } from 'zod'

const id = z.string().uuid('Missing application id.')

/**
 * `<input type="datetime-local">` posts "YYYY-MM-DDTHH:mm" with no zone. Leads
 * schedule in local campus time, which is IST everywhere this runs, so the
 * zone is pinned here rather than inherited from the server's clock.
 */
const interviewAt = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Choose the interview date and time.')
  .transform((v) => new Date(`${v}:00+05:30`))
  .refine((d) => !Number.isNaN(d.getTime()), 'Choose a valid interview date and time.')
  .refine((d) => d.getTime() > Date.now(), 'The interview must be in the future.')

export const claimApplicationSchema = z.object({ id })

export const scheduleInterviewSchema = z.object({
  id,
  interview_at: interviewAt,
  interviewer: z.string().trim().min(2, 'Enter the success coach who will take the interview.').max(120),
  mode: z.string().trim().min(3, 'Enter a meeting link or the place of the interview.').max(300),
})

export const interviewResultSchema = z.object({
  id,
  result: z.enum(['selected', 'rejected'], { errorMap: () => ({ message: 'Choose selected or rejected.' }) }),
  notes: z.string().trim().max(1000, 'Keep the notes under 1000 characters.').optional(),
})

export const applicationIdSchema = z.object({ id })
