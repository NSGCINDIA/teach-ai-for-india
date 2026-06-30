import { z } from 'zod'

const FILE_TYPES = ['photo', 'video', 'document', 'receipt', 'letter', 'presentation', 'other'] as const
const ENTITY_TYPES = ['session', 'school', 'campus', 'reimbursement'] as const

/**
 * Metadata recorded after a client-side upload to the evidence bucket.
 * The file itself is uploaded directly to Storage; this only persists the row.
 */
export const recordUploadSchema = z.object({
  storage_path: z.string().min(3).max(1024),
  file_name: z.string().min(1).max(255),
  file_type: z.enum(FILE_TYPES),
  mime_type: z.string().max(255).optional().or(z.literal('')),
  file_size_bytes: z.coerce.number().int().min(0).max(220 * 1024 * 1024),
  entity_type: z.enum(ENTITY_TYPES),
  entity_id: z.string().uuid(),
  campus_id: z.string().uuid().optional().or(z.literal('')),
  school_id: z.string().uuid().optional().or(z.literal('')),
  session_id: z.string().uuid().optional().or(z.literal('')),
  caption: z.string().trim().max(500).optional().or(z.literal('')),
})

export const evidenceIdSchema = z.object({ id: z.string().uuid() })

export const approveEvidenceSchema = z.object({
  id: z.string().uuid(),
  /** Also promote to the public gallery (admins/campus leads, photos only). */
  make_public: z.coerce.boolean().optional(),
})

export type RecordUploadInput = z.infer<typeof recordUploadSchema>
