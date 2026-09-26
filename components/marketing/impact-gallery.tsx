import Image from 'next/image'
import { CheckCircle2, Calendar, MapPin } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'
import type { EvidenceItem } from '@/components/shared/evidence-grid'

export function ImpactGallery({ items }: { items: EvidenceItem[] }) {
  return (
    <section id="evidence" className="tai-section bg-[var(--tai-clay)]/20 py-16 md:py-24 border-b border-foreground/10">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-3xl">
            <p className="tai-eyebrow text-brand">Classroom Evidence</p>
            <h2 className="tai-text-display mt-3 font-display text-foreground">
              Real classrooms. Real documentation.
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">
              Visual records uploaded from government school classrooms across Telangana and Andhra Pradesh.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>Audited Photo Logs</span>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((item, idx) => (
            <Reveal key={item.id} delay={idx * 0.08}>
              <article className="group relative overflow-hidden rounded-2xl border border-foreground/15 bg-background shadow-sm transition-all duration-300 hover:border-brand/40 hover:shadow-md">
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  {item.url && (
                    <Image
                      src={item.url}
                      alt={item.caption || 'Classroom session evidence'}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] uppercase font-bold py-1 px-2.5 rounded-full tracking-wider border border-white/20">
                    Verified Session
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm text-foreground/90 leading-relaxed min-h-[44px]">
                    {item.caption}
                  </p>

                  <div className="mt-4 pt-4 border-t border-foreground/10 flex items-center justify-between text-xs text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3 text-brand" />
                      {new Date(item.createdAt || '').toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-brand font-semibold">
                      {item.campusId?.toUpperCase().replace('NIAT-', '') || 'TELANGANA'}
                    </span>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
