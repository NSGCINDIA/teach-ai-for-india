import { z } from 'zod'

// Kept in sync with the DB enum (supabase/migrations, most recently 0029)
// and lib/constants/evidence.ts's MEDIA_TYPE_META — no shared source today.
const FILE_TYPES = [
  'photo', 'video', 'document', 'receipt', 'letter', 'presentation', 'other',
  'team_photo', 'principal_photo', 'student_group_photo', 'student_testimonial', 'teacher_testimonial',
] as const
const ENTITY_TYPES = ['session', 'school', 'campus', 'reimbursement'] as const

/**
 * Metadata recorded for a piece of evidence. Either an externally hosted link
 * (e.g. a Google Drive share URL) or a Storage path from a legacy upload.
 */
export const recordUploadSchema = z.object({
  storage_path: z.string().min(3).max(1024).optional(),
  external_url: z.string().trim().url().max(2048).optional(),
  file_name: z.string().min(1).max(255),
  file_type: z.enum(FILE_TYPES),
  mime_type: z.string().max(255).optional().or(z.literal('')),
  file_size_bytes: z.coerce.number().int().min(0).max(220 * 1024 * 1024).optional(),
  entity_type: z.enum(ENTITY_TYPES),
  entity_id: z.string().uuid(),
  campus_id: z.string().uuid().optional().or(z.literal('')),
  school_id: z.string().uuid().optional().or(z.literal('')),
  session_id: z.string().uuid().optional().or(z.literal('')),
  caption: z.string().trim().max(500).optional().or(z.literal('')),
}).refine((d) => !!d.storage_path || !!d.external_url, {
  message: 'A file location or link is required.',
  path: ['external_url'],
})

export const evidenceIdSchema = z.object({ id: z.string().uuid() })

export const approveEvidenceSchema = z.object({
  id: z.string().uuid(),
  /** Also promote to the public gallery (admins/campus leads, photos only). */
  make_public: z.coerce.boolean().optional(),
})

export type RecordUploadInput = z.infer<typeof recordUploadSchema>
