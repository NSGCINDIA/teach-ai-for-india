import { z } from 'zod'

export const requestTeamAvailabilitySchema = z.object({
  school_id: z.string().uuid(),
  volunteer_ids: z.array(z.string().uuid()).min(1, 'Select at least one volunteer'),
  required_volunteers: z.number().int().min(1).optional(),
})

/** Changing only the target team size, with no availability request attached. */
export const setRequiredVolunteersSchema = z.object({
  school_id: z.string().uuid(),
  required_volunteers: z.coerce
    .number({ invalid_type_error: 'Enter the number of volunteers needed' })
    .int('Enter a whole number')
    .min(1, 'Required volunteers must be at least 1')
    .max(500, 'That looks too high — enter 500 or fewer'),
})

export const respondTeamAvailabilitySchema = z.object({
  member_id: z.string().uuid(),
  available: z.boolean(),
  note: z.string().optional(),
})

export const confirmSchoolTeamSchema = z.object({
  school_id: z.string().uuid(),
  member_ids: z.array(z.string().uuid()).min(1, 'Select at least one member to confirm'),
})

export const replaceTeamMemberSchema = z.object({
  member_id: z.string().uuid(),
  replacement_volunteer_id: z.string().uuid('Select a replacement volunteer'),
  reason: z.string().min(1, 'Reason for replacement is required'),
})

export type RequestTeamAvailabilityInput = z.infer<typeof requestTeamAvailabilitySchema>
export type SetRequiredVolunteersInput = z.infer<typeof setRequiredVolunteersSchema>
export type RespondTeamAvailabilityInput = z.infer<typeof respondTeamAvailabilitySchema>
export type ConfirmSchoolTeamInput = z.infer<typeof confirmSchoolTeamSchema>
export type ReplaceTeamMemberInput = z.infer<typeof replaceTeamMemberSchema>
