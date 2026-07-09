import type { MediaFileType } from '@/types/database'

/** User-selectable evidence categories (PRD §7.7). Drives the link form + filtering. */
export const MEDIA_TYPE_META: Record<MediaFileType, { label: string }> = {
  photo:        { label: 'Photo' },
  video:        { label: 'Video' },
  document:     { label: 'Document' },
  receipt:      { label: 'Receipt' },
  letter:       { label: 'Letter' },
  presentation: { label: 'Presentation' },
  other:        { label: 'Other' },
}

export const MEDIA_TYPES = Object.keys(MEDIA_TYPE_META) as MediaFileType[]

/** Only uploaded photos (with a Storage path) can be promoted to the public gallery — linked evidence can't be copied into the public bucket. */
export function isPubliclyPromotable(fileType: MediaFileType, hasStoragePath: boolean): boolean {
  return fileType === 'photo' && hasStoragePath
}
