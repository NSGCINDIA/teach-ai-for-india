import { z } from 'zod'

const DECISIONS = ['approved', 'rejected'] as const

/** Finance Lead sets the initial budget for their campus's current period. */
export const allocateCampusBudgetSchema = z.object({
  campus_id: z.string().uuid(),
  allocated_amount: z.coerce.number().positive('Enter an allocated amount').max(100000000),
  note: z.string().trim().max(1000).optional().or(z.literal('')),
})

/** Finance Lead requests additional budget for their campus's current period. */
export const createBudgetIncreaseRequestSchema = z.object({
  campus_id: z.string().uuid(),
  requested_amount: z.coerce.number().positive('Enter the additional amount needed').max(100000000),
  reason: z.string().trim().min(10, 'Explain why more budget is needed (at least 10 characters)').max(1000),
})

/** Campus Lead reviews a budget increase request. DB enforces "note required when rejecting". */
export const reviewBudgetIncreaseRequestSchema = z.object({
  request_id: z.string().uuid(),
  decision: z.enum(DECISIONS),
  note: z.string().trim().max(1000).optional().or(z.literal('')),
})

export type AllocateCampusBudgetInput = z.infer<typeof allocateCampusBudgetSchema>
export type CreateBudgetIncreaseRequestInput = z.infer<typeof createBudgetIncreaseRequestSchema>
export type ReviewBudgetIncreaseRequestInput = z.infer<typeof reviewBudgetIncreaseRequestSchema>
