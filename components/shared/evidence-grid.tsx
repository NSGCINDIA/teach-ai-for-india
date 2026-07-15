import Image from 'next/image'
import { FileText, Film, Receipt, ScrollText, File } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isImageFileType } from '@/lib/constants/evidence'
import type { MediaFileType } from '@/types/database'

export interface EvidenceItem {
  id: string
  url: string | null
  fileType: MediaFileType
  fileName: string
  caption?: string | null
  campusId?: string | null
  createdAt?: string | null
}

const NON_IMAGE_ICON: Partial<Record<MediaFileType, typeof FileText>> = {
  video: Film,
  document: FileText,
  presentation: FileText,
  receipt: Receipt,
  letter: ScrollText,
  other: File,
  student_testimonial: Film,
  teacher_testimonial: Film,
}

/**
 * EvidenceGrid (PRD §12.3) — masonry-style photo/file grid with lazy loading.
 * Images lazy-load via next/image; non-images render a typed placeholder tile.
 */
export function EvidenceGrid({
  items,
  onSelect,
  className,
}: {
  items: EvidenceItem[]
  onSelect?: (item: EvidenceItem) => void
  className?: string
}) {
  return (
    <div className={cn('columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3', className)}>
      {items.map((item) => {
        const isImage = isImageFileType(item.fileType)
        const Icon = NON_IMAGE_ICON[item.fileType] ?? File
        const Tag = onSelect ? 'button' : 'div'
        return (
          <Tag
            key={item.id}
            onClick={onSelect ? () => onSelect(item) : undefined}
            className={cn(
              'group relative block w-full break-inside-avoid overflow-hidden rounded-xl border border-border bg-muted text-left',
              onSelect && 'cursor-zoom-in focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            )}
          >
            {isImage && item.url ? (
              <Image
                src={item.url}
                alt={item.caption ?? item.fileName}
                width={400}
                height={300}
                loading="lazy"
                sizes="(max-width: 640px) 50vw, 25vw"
                className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex aspect-square flex-col items-center justify-center gap-2 p-4 text-muted-foreground">
                <Icon className="size-8" aria-hidden />
                <span className="line-clamp-2 text-center text-xs">{item.fileName}</span>
              </div>
            )}
            {item.caption && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <span className="inline-flex items-center rounded-full bg-brand-teal/20 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-brand-teal border border-brand-teal/30 backdrop-blur-md">
                    Verified Session
                  </span>
                  {item.createdAt && (
                    <span className="text-[10px] text-white/70 font-medium">
                      {(() => {
                        try {
                          return new Date(item.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                        } catch {
                          return ''
                        }
                      })()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white font-semibold leading-relaxed line-clamp-3">
                  {item.caption}
                </p>
              </div>
            )}
          </Tag>
        )
      })}
    </div>
  )
}
