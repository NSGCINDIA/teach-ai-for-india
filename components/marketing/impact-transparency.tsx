import Link from 'next/link'
import { FileText, ShieldCheck, ArrowRight, BookOpen, Clock } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface DocCard {
  title: string
  category: string
  description: string
  href: string
  actionLabel: string
}

const CARDS: DocCard[] = [
  {
    title: 'Impact Reports',
    category: 'Institutional Metrics',
    description: 'QuarterlyReach statements, student engagement tallies, and documented qualitative outcomes across active districts.',
    href: '/contact?intent=impact-report',
    actionLabel: 'Request Report',
  },
  {
    title: 'Program Reports',
    category: 'Curriculum & Safety',
    description: 'Applied AI literacy syllabus, bilingual teaching guides, and classroom safety protocols tested in government schools.',
    href: '/about',
    actionLabel: 'Explore Framework',
  },
  {
    title: 'School & Session Documentation',
    category: 'Verified Field Evidence',
    description: 'Photo records, headmaster approvals, and attendance rosters documented per session on our open timeline.',
    href: '#evidence',
    actionLabel: 'View Gallery Above',
  },
  {
    title: 'Financial & Compliance Information',
    category: 'Governance & Diligence',
    description: 'Audited utilization guidelines, program cost structures, and corporate CSR committee documentation on request.',
    href: '/contact?intent=csr-diligence',
    actionLabel: 'Contact Diligence Desk',
  },
]

export function ImpactTransparency() {
  return (
    <section className="tai-section bg-[var(--tai-clay)]/20 py-16 md:py-24 border-b border-foreground/10">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-3xl">
            <p className="tai-eyebrow text-brand">Institutional Integrity</p>
            <h2 className="tai-text-display mt-3 font-display text-foreground">
              See the work behind the numbers.
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">
              Every figure is supported by classroom documentation, NIAT student chapter logs, school partnerships, and open reporting.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background px-4 py-2 font-mono text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-600" />
            Verified Records Only
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c, idx) => (
            <Reveal key={c.title} delay={idx * 0.08}>
              <div className="flex h-full flex-col justify-between rounded-2xl border border-foreground/15 bg-background p-6 transition-all hover:border-brand/40 hover:shadow-sm">
                <div>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-brand">
                    {c.category}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-bold text-foreground">
                    {c.title}
                  </h3>
                  <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-foreground/10">
                  <Link
                    href={c.href}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
                  >
                    <span>{c.actionLabel}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
