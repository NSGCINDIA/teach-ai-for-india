import type { MediaFileType } from '@/types/database'

/**
 * User-selectable evidence categories (PRD §7.7). Drives the link form +
 * filtering. NOTE: this enum is duplicated in two other places that must be
 * kept in sync — supabase/migrations (DB truth, most recently 0029) and
 * lib/validations/evidence.ts's FILE_TYPES const.
 */
export const MEDIA_TYPE_META: Record<MediaFileType, { label: string }> = {
  photo:        { label: 'Photo' },
  video:        { label: 'Video' },
  document:     { label: 'Document' },
  receipt:      { label: 'Receipt' },
  letter:       { label: 'Letter' },
  presentation: { label: 'Presentation' },
  other:        { label: 'Other' },
  team_photo:          { label: 'Team Group Photo' },
  principal_photo:     { label: 'Photo with Principal' },
  student_group_photo: { label: 'Student Group Photo' },
  student_testimonial: { label: 'Student Testimonial (Video)' },
  teacher_testimonial: { label: 'Teacher/Principal Testimonial (Video)' },
}

export const MEDIA_TYPES = Object.keys(MEDIA_TYPE_META) as MediaFileType[]

/**
 * The 5 categories a session's evidence must cover before it can be reported
 * (Operational Workflow Spec v2.0, Stage 7). Keep in sync with the array
 * literal inside enforce_session_transition() (0029_mandatory_evidence.sql).
 */
export const MANDATORY_EVIDENCE_TYPES: MediaFileType[] = [
  'team_photo', 'principal_photo', 'student_group_photo', 'student_testimonial', 'teacher_testimonial',
]

/** Photo-shaped categories — eligible for inline <img> rendering and (once uploaded, not just linked) public-gallery promotion. */
const IMAGE_TYPES = new Set<MediaFileType>(['photo', 'team_photo', 'principal_photo', 'student_group_photo'])
export function isImageFileType(fileType: MediaFileType): boolean {
  return IMAGE_TYPES.has(fileType)
}

/** Only uploaded photos (with a Storage path) can be promoted to the public gallery — linked evidence can't be copied into the public bucket. */
export function isPubliclyPromotable(fileType: MediaFileType, hasStoragePath: boolean): boolean {
  return isImageFileType(fileType) && hasStoragePath
}
