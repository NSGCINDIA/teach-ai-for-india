import type { MediaFileType } from '@/types/database'

/** User-selectable evidence categories (PRD §7.7). Drives upload + filtering. */
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

/** Accepted MIME types — mirrors the evidence bucket allow-list in 0004_storage.sql. */
export const ACCEPTED_MIME = [
  'image/jpeg', 'image/png', 'image/heic', 'image/webp',
  'video/mp4', 'video/quicktime',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]

export const ACCEPT_ATTR = '.jpg,.jpeg,.png,.heic,.webp,.mp4,.mov,.pdf,.docx,.pptx'

/** 200MB videos / 25MB everything else (PRD §7.7). */
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024
export const MAX_FILE_BYTES = 25 * 1024 * 1024

/** Best-guess category from a file's MIME type; the user can override. */
export function inferFileType(mime: string): MediaFileType {
  if (mime.startsWith('image/')) return 'photo'
  if (mime.startsWith('video/')) return 'video'
  if (mime.includes('presentation')) return 'presentation'
  return 'document'
}

export function maxBytesFor(mime: string): number {
  return mime.startsWith('video/') ? MAX_VIDEO_BYTES : MAX_FILE_BYTES
}

/** Only image evidence can be promoted to the public gallery (public-assets bucket). */
export function isPubliclyPromotable(fileType: MediaFileType): boolean {
  return fileType === 'photo'
}
