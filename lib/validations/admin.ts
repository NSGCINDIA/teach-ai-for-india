import { z } from 'zod'
import { INVITABLE_ROLES } from '@/lib/auth/roles'

/** Role change — only assignable (non-super_admin) roles, per PRD §7.2. */
export const roleChangeSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(INVITABLE_ROLES as [string, ...string[]]),
})

export const userActiveSchema = z.object({
  user_id: z.string().uuid(),
  is_active: z.boolean(),
})

export const campusSchema = z.object({
  id: z.string().uuid().optional().or(z.literal('')),
  name: z.string().min(2, 'Enter a campus name'),
  university_name: z.string().min(2, 'Enter the university'),
  city: z.string().min(2, 'Enter a city'),
  state: z.string().min(2, 'Enter a state'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and dashes only'),
  lead_user_id: z.string().uuid().optional().or(z.literal('')),
  quarter: z.string().max(20).optional().or(z.literal('')),
  target_schools: z.coerce.number().int().min(0),
  target_students: z.coerce.number().int().min(0),
  target_sessions: z.coerce.number().int().min(0),
  description: z.string().max(2000).optional().or(z.literal('')),
  is_active: z.boolean(),
})

export const contentBlockSchema = z.object({
  block_key: z.string().min(1),
  content: z.string().min(2, 'Content is required'), // raw JSON string, parsed in the action
})

export const financeConfigSchema = z.object({
  claim_window_days: z.coerce.number().int().min(1, 'At least 1 day').max(365, 'At most 365 days'),
})

export type CampusInput = z.infer<typeof campusSchema>
