import { z } from 'zod'

const DECISIONS = ['approved', 'rejected'] as const

/** File a new outreach visit request. team_member_ids arrives as a JSON array. */
export const createOutreachVisitRequestSchema = z.object({
  school_id: z.string().uuid('Select a school'),
  purpose: z.string().trim().min(10, 'Describe the purpose of the visit').max(1000),
  proposed_visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  estimated_travel_cost: z.coerce.number().positive('Enter an estimated travel cost').max(1000000),
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
    .pipe(z.array(z.string().uuid()).min(1, 'Select at least one team member').max(50)),
})

/**
 * Shared by both the Campus Lead and Finance Lead review actions — identical
 * shape; the DB enforces "note required when rejecting" (same convention as
 * changeStatusSchema / schoolTransitionNeedsNote).
 */
export const reviewOutreachVisitRequestSchema = z.object({
  request_id: z.string().uuid(),
  decision: z.enum(DECISIONS),
  note: z.string().trim().max(1000).optional().or(z.literal('')),
})

export type CreateOutreachVisitRequestInput = z.infer<typeof createOutreachVisitRequestSchema>
export type ReviewOutreachVisitRequestInput = z.infer<typeof reviewOutreachVisitRequestSchema>
