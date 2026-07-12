import { z } from 'zod'

const DECISIONS = ['approved', 'rejected'] as const

// Checkboxes arrive as 'on' when checked and are absent when unchecked (same
// convention as lib/validations/plans.ts's `checkbox`). NOT z.coerce.boolean()
// — that treats the string 'false' as true.
const checkbox = z
  .union([z.literal('on'), z.literal('true'), z.literal('')])
  .optional()
  .transform((v) => v === 'on' || v === 'true')

/** Execution Lead submits a plan for an existing (planned) session. */
export const createExecutionPlanSchema = z.object({
  session_id: z.string().uuid(),
  logistics_notes: z.string().trim().min(5, 'Describe the logistics for this session').max(2000),
  has_laptop: checkbox,
  has_projector: checkbox,
  has_hdmi_cable: checkbox,
  has_extension_board: checkbox,
  has_speaker: checkbox,
  has_internet_device: checkbox,
  other_equipment: z.string().trim().max(500).optional().or(z.literal('')),
  teaching_resources: z.string().trim().max(2000).optional().or(z.literal('')),
  // .min(0) not .positive(): an on-campus session can legitimately have zero
  // transport cost, unlike Phase 2's outreach travel cost which is always > 0.
  estimated_transport_cost: z.coerce.number().min(0, 'Enter an estimated transport cost').max(1000000),
  session_ready: checkbox,
})

/** Shared by both the Campus Lead and Finance Lead review actions. */
export const reviewExecutionPlanSchema = z.object({
  plan_id: z.string().uuid(),
  decision: z.enum(DECISIONS),
  note: z.string().trim().max(1000).optional().or(z.literal('')),
})

export type CreateExecutionPlanInput = z.infer<typeof createExecutionPlanSchema>
export type ReviewExecutionPlanInput = z.infer<typeof reviewExecutionPlanSchema>
