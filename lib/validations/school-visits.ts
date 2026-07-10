import { z } from 'zod'

/** Log an onboarding visit — who visited, when, and what happened. */
export const logSchoolVisitSchema = z.object({
  school_id: z.string().uuid('Select a school'),
  visited_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Enter the visit date and time'),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  team_member_ids: z
    .string()
    .transform((s, ctx) => {
      try {
        return JSON.parse(s)
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid team member selection' })
        return z.NEVER
      }
    })
    .pipe(z.array(z.string().uuid()).max(50))
    .optional(),
})

export type LogSchoolVisitInput = z.infer<typeof logSchoolVisitSchema>

/** Edit the one existing visit record for a school — same shape, keyed by visit id. */
export const updateSchoolVisitSchema = z.object({
  visit_id: z.string().uuid('Select a visit'),
  visited_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Enter the visit date and time'),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  team_member_ids: z
    .string()
    .transform((s, ctx) => {
      try {
        return JSON.parse(s)
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid team member selection' })
        return z.NEVER
      }
    })
    .pipe(z.array(z.string().uuid()).max(50))
    .optional(),
})

export type UpdateSchoolVisitInput = z.infer<typeof updateSchoolVisitSchema>
