import { z } from 'zod'

export const submitSchoolExecutionPlanSchema = z.object({
  school_id: z.string().uuid(),

  laptops_count: z.coerce.number().int().min(0).default(0),
  projectors_count: z.coerce.number().int().min(0).default(0),
  hdmi_cables_count: z.coerce.number().int().min(0).default(0),
  extension_boards_count: z.coerce.number().int().min(0).default(0),
  teaching_kits_count: z.coerce.number().int().min(0).default(0),
  speakers_count: z.coerce.number().int().min(0).default(0),
  other_equipment: z.string().optional(),

  distance_km: z.coerce.number().min(0).optional(),
  transport_mode: z.string().optional(),
  estimated_travel_cost: z.coerce.number().min(0).default(0),
  meeting_departure_notes: z.string().optional(),

  transport_budget: z.coerce.number().min(0).default(0),
  materials_budget: z.coerce.number().min(0).default(0),
  equipment_budget: z.coerce.number().min(0).default(0),
  other_budget: z.coerce.number().min(0).default(0),
})

export const reviewSchoolExecutionPlanSchema = z.object({
  plan_id: z.string().uuid(),
  decision: z.enum(['approved', 'changes_requested']),
  comments: z.string().optional(),
})

export type SubmitSchoolExecutionPlanInput = z.infer<typeof submitSchoolExecutionPlanSchema>
export type ReviewSchoolExecutionPlanInput = z.infer<typeof reviewSchoolExecutionPlanSchema>
