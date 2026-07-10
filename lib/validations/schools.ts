import { z } from 'zod'

const SCHOOL_TYPES = ['government', 'government_aided', 'private'] as const
const BOARDS = ['state', 'cbse', 'icse', 'other'] as const
const STATUSES = [
  'lead_identified', 'outreach_requested', 'outreach_approved', 'visit_completed',
  'registered', 'sessions_active', 'completed', 'archived',
] as const

const optionalText = z.string().trim().max(500).optional().or(z.literal(''))

/** School create/edit — the §7.3 three-layer record (identity + location + pipeline). */
export const schoolSchema = z.object({
  name: z.string().trim().min(2, 'Enter the school name').max(200),
  school_type: z.enum(SCHOOL_TYPES),
  board: z.enum(BOARDS),
  state: z.string().trim().min(2, 'State is required').max(100),
  district: z.string().trim().min(2, 'District is required').max(100),
  cluster: optionalText,
  mandal: optionalText,
  address: z.string().trim().max(500).optional().or(z.literal('')),
  dise_code: z
    .string()
    .trim()
    .regex(/^\d{11}$/, 'DISE code is 11 digits')
    .optional()
    .or(z.literal('')),
  campus_id: z.string().uuid('Select a campus').optional().or(z.literal('')),
  outreach_lead_id: z.string().uuid().optional().or(z.literal('')),
  next_action_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .optional()
    .or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
})

/** Acknowledge a dedup warning when creating a near-duplicate school. */
export const createSchoolSchema = schoolSchema.extend({
  acknowledge_duplicate: z.coerce.boolean().optional(),
})

export const schoolContactSchema = z.object({
  school_id: z.string().uuid(),
  name: z.string().trim().min(2, 'Enter a contact name').max(120),
  designation: z.string().trim().min(2, 'Enter a designation').max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{6,14}$/, 'Enter a valid phone')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  whatsapp: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{6,14}$/, 'Enter a valid number')
    .optional()
    .or(z.literal('')),
  is_primary: z.coerce.boolean().optional(),
})

export const changeStatusSchema = z.object({
  school_id: z.string().uuid(),
  new_status: z.enum(STATUSES),
  note: z.string().trim().max(1000).optional().or(z.literal('')),
})

export type SchoolInput = z.infer<typeof schoolSchema>
export type SchoolContactInput = z.infer<typeof schoolContactSchema>
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>
