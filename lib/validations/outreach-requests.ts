import { z } from 'zod'

const DECISIONS = ['approved', 'rejected'] as const

/** File a new outreach request for a school still at Lead Identified. */
export const createOutreachRequestSchema = z.object({
  school_id: z.string().uuid('Select a school'),
  reason: z.string().trim().min(10, 'Explain why this school should be pursued (at least 10 characters)').max(1000),
  proposed_approach: z.string().trim().max(1000).optional().or(z.literal('')),
})

/** Campus Lead's single-reviewer decision — note required when rejecting. */
export const reviewOutreachRequestSchema = z.object({
  request_id: z.string().uuid(),
  decision: z.enum(DECISIONS),
  note: z.string().trim().max(1000).optional().or(z.literal('')),
})

export type CreateOutreachRequestInput = z.infer<typeof createOutreachRequestSchema>
export type ReviewOutreachRequestInput = z.infer<typeof reviewOutreachRequestSchema>
