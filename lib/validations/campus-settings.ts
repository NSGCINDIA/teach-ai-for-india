import { z } from 'zod'

/** Campus Lead self-service settings — description + hero image only (PRD follow-up, migration 0020). */
export const campusSettingsSchema = z.object({
  campus_id: z.string().uuid(),
  description: z.string().max(2000).optional().or(z.literal('')),
  hero_image_url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
})

export type CampusSettingsInput = z.infer<typeof campusSettingsSchema>
