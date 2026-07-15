import type { ReactNode } from 'react'
import { Reveal } from '@/components/marketing/reveal'

interface PageHeaderProps {
  eyebrow?: string
  title: ReactNode
  description?: string
  children?: ReactNode
}

/** Standard inner-page hero header with the dot-grid backdrop. */
export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid opacity-50" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand/15 to-brand-teal/5 blur-3xl"
      />
      <div className="container-wide relative px-5 py-16 md:px-8 md:py-24 lg:px-16">
        <Reveal>
          <div className="max-w-3xl">
            {eyebrow && <p className="section-label text-brand">{eyebrow}</p>}
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-balance md:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="mt-5 max-w-2xl text-pretty text-muted-foreground md:text-lg">{description}</p>
            )}
            {children && <div className="mt-7">{children}</div>}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
