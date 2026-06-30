import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

/** Marketing section heading — eyebrow label + display title + lede. */
export function SectionHeading({ eyebrow, title, description, align = 'center', className }: SectionHeadingProps) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && <p className="section-label text-brand">{eyebrow}</p>}
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-pretty text-muted-foreground md:text-lg">{description}</p>}
    </div>
  )
}
