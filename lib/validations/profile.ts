import { z } from 'zod'

/** Self-service profile edit — only fields RLS lets any user change on their own row. */
export const profileSchema = z.object({
  full_name: z.string().min(2, 'Enter your full name'),
  phone: z.string().max(20).optional().or(z.literal('')),
})

export type ProfileInput = z.infer<typeof profileSchema>
