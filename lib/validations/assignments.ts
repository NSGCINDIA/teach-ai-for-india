import { z } from 'zod'

const RESPONSE_STATUSES = ['accepted', 'declined', 'replacement_requested'] as const

/** Assign N volunteers to a session. volunteer_ids arrives as a JSON array. */
export const assignVolunteersSchema = z.object({
  session_id: z.string().uuid(),
  volunteer_ids: z
    .string()
    .transform((s, ctx) => {
      try {
        return JSON.parse(s)
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid volunteer selection' })
        return z.NEVER
      }
    })
    .pipe(z.array(z.string().uuid()).min(1, 'Select at least one volunteer').max(100)),
})

/** A volunteer's response to their own assignment. */
export const respondAssignmentSchema = z.object({
  assignment_id: z.string().uuid(),
  status: z.enum(RESPONSE_STATUSES),
  note: z.string().trim().max(500).optional().or(z.literal('')),
})

export const unassignSchema = z.object({
  assignment_id: z.string().uuid(),
})

export type RespondAssignmentInput = z.infer<typeof respondAssignmentSchema>
