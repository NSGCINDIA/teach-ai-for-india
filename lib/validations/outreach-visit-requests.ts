import { z } from 'zod'

const DECISIONS = ['approved', 'rejected'] as const

export const VISIT_PRIORITIES = ['High', 'Medium', 'Low'] as const
export type VisitPriority = (typeof VISIT_PRIORITIES)[number]

export const EXPECTED_OUTCOME_OPTIONS = [
  'Initial Introduction',
  'School Assessment',
  'Principal Meeting',
  'Teacher Orientation',
  'Follow-up Visit',
  'Partnership Discussion',
] as const
export type ExpectedOutcome = (typeof EXPECTED_OUTCOME_OPTIONS)[number]

export const VISIT_TRANSPORTATION_OPTIONS = ['Bike', 'Car', 'Auto'] as const
export type VisitTransportation = (typeof VISIT_TRANSPORTATION_OPTIONS)[number]

/** File a new outreach visit request. team_member_ids and expected_outcomes arrive as JSON arrays. */
export const createOutreachVisitRequestSchema = z.object({
  school_id: z.string().uuid('Select a school'),
  priority: z.enum(VISIT_PRIORITIES, { required_error: 'Select a priority level' }),
  expected_outcomes: z
    .string()
    .transform((s, ctx) => {
      try {
        return JSON.parse(s)
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid expected outcomes selection' })
        return z.NEVER
      }
    })
    .pipe(z.array(z.string()).min(1, 'Select at least one expected outcome')),
  proposed_visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  transportation: z.enum(VISIT_TRANSPORTATION_OPTIONS).optional().or(z.literal('')),
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
 * shape; the DB enforces "note required when rejecting".
 */
export const reviewOutreachVisitRequestSchema = z.object({
  request_id: z.string().uuid(),
  decision: z.enum(DECISIONS),
  note: z.string().trim().max(1000).optional().or(z.literal('')),
})

export type CreateOutreachVisitRequestInput = z.infer<typeof createOutreachVisitRequestSchema>
export type ReviewOutreachVisitRequestInput = z.infer<typeof reviewOutreachVisitRequestSchema>
