import { z } from 'zod'

const AVAILABILITY_STATUSES = ['available', 'unavailable', 'tentative'] as const
const CERTIFICATE_KINDS = ['participation', 'milestone', 'excellence', 'completion'] as const
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')

/** Post a campus / org-wide announcement. */
export const announcementSchema = z.object({
  title: z.string().trim().min(3, 'Enter a title').max(160),
  body: z.string().trim().min(3, 'Enter a message').max(4000),
  pinned: z
    .union([z.literal('on'), z.literal('true'), z.literal('')])
    .optional()
    .transform((v) => v === 'on' || v === 'true'),
})

export const deleteAnnouncementSchema = z.object({ id: z.string().uuid() })

/** A volunteer marks their availability for a date. */
export const availabilitySchema = z.object({
  date,
  status: z.enum(AVAILABILITY_STATUSES),
  note: z.string().trim().max(300).optional().or(z.literal('')),
})

export const clearAvailabilitySchema = z.object({ id: z.string().uuid() })

/** A lead issues a certificate to a volunteer. */
export const certificateSchema = z.object({
  volunteer_id: z.string().uuid('Select a volunteer'),
  kind: z.enum(CERTIFICATE_KINDS),
  title: z.string().trim().min(3, 'Enter a title').max(160),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  sessions_count: z.coerce.number().int().min(0).max(10000).optional(),
})

export const revokeCertificateSchema = z.object({ id: z.string().uuid() })

export type AnnouncementInput = z.infer<typeof announcementSchema>
export type AvailabilityInput = z.infer<typeof availabilitySchema>
export type CertificateInput = z.infer<typeof certificateSchema>
