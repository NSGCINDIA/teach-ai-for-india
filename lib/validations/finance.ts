import { z } from 'zod'

const TRAVEL_MODES = ['auto', 'bus', 'cab', 'train', 'own_vehicle', 'other'] as const

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')

/** Create / edit a draft claim (PRD §7.6). Must link a session. */
export const claimSchema = z.object({
  session_id: z.string().uuid('Select the session you’re claiming for'),
  amount: z.coerce.number().positive('Enter an amount').max(100000, 'Amount looks too high'),
  travel_mode: z.enum(TRAVEL_MODES),
  claim_date: date,
  reason: z.string().trim().max(1000).optional().or(z.literal('')),
})

export const claimUpdateSchema = claimSchema.extend({ id: z.string().uuid() })

export const submitClaimSchema = z.object({ id: z.string().uuid() })

/** Admin review decision. */
export const reviewClaimSchema = z.object({
  id: z.string().uuid(),
  decision: z.enum(['under_review', 'approved', 'rejected']),
  reviewer_note: z.string().trim().max(1000).optional().or(z.literal('')),
})

/** Mark an approved claim as paid. */
export const payClaimSchema = z.object({
  id: z.string().uuid(),
  payment_date: date.optional().or(z.literal('')),
  payment_method: z.string().trim().max(60).optional().or(z.literal('')),
  payment_reference: z.string().trim().max(120).optional().or(z.literal('')),
})

export type ClaimInput = z.infer<typeof claimSchema>
