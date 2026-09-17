'use client'

import Link from 'next/link'
import {
  FileText,
  PieChart,
  Laptop,
  BookOpen,
  Compass,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Download,
  Clock,
} from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface Category {
  title: string
  subtitle: string
  description: string
  icon: typeof BookOpen
  items: string[]
}

const CATEGORIES: Category[] = [
  {
    title: 'Programs',
    subtitle: 'Classroom Delivery & Chapters',
    description:
      'Direct hands-on delivery in government schools, volunteer cohort training, campus lead coordination, and student showcase events.',
    icon: Compass,
    items: [
      'In-person 90-minute AI workshops',
      'Campus chapter bootcamps & trainer certification',
      'Headmaster and school administrator coordination',
    ],
  },
  {
    title: 'Learning Resources',
    subtitle: 'Printed & Bilingual Materials',
    description:
      'Physical prompt cards, bilingual student workbooks in Telugu and English, and take-home reference sheets that keep curiosity alive.',
    icon: BookOpen,
    items: [
      'Bilingual AI cheat-sheets and prompt workbooks',
      'Classroom project craft supplies & certificates',
      'Curriculum localization into regional vernaculars',
    ],
  },
  {
    title: 'Technology',
    subtitle: 'Hardware & Infrastructure',
    description:
      'Shared tablets, portable hotspot units for rural schools without internet, and API access credits for live model demonstrations.',
    icon: Laptop,
    items: [
      'Shared classroom tablets & rugged protective cases',
      'Mobile 4G/5G hotspots for offline schools',
      'Live model sandboxes and generation API access',
    ],
  },
  {
    title: 'Operations',
    subtitle: 'Field Logistics & Safety',
    description:
      'Volunteer transit between university campuses and rural school compounds, on-site safety protocols, and verified reporting systems.',
    icon: PieChart,
    items: [
      'College-to-school volunteer travel & transit logistics',
      'Photo documentation and verification tracking',
      'Open digital impact ledger maintenance',
    ],
  },
]

interface DocumentResource {
  title: string
  category: string
  format: string
  description: string
  status: string
  href: string
  isExternal?: boolean
}

const DOCUMENTS: DocumentResource[] = [
  {
    title: 'Impact Report 2026',
    category: 'Impact Reports',
    format: 'PDF · Audit Summary',
    description: 'Consolidated reach across 20+ government schools, student engagement tallies, and qualitative learning metrics.',
    status: 'Available on Request',
    href: '/contact?intent=impact-report',
  },
  {
    title: 'Curriculum & Program Framework',
    category: 'Program Reports',
    format: 'PDF · 28 Pages',
    description: 'Comprehensive 4-week applied AI literacy syllabus: prompt engineering, generative tools, and safety principles.',
    status: 'Public Framework',
    href: '/about#curriculum',
  },
  {
    title: 'Financial & Utilization Statement',
    category: 'Financial Information',
    format: 'Audited Statement',
    description: 'Transparent expenditure breakdowns by campus chapter and school cluster, prepared for CSR committee review.',
    status: 'Updated Quarterly',
    href: '/contact?intent=financials',
  },
  {
    title: 'Live School & Session Records',
    category: 'School Documentation',
    format: 'Interactive Public Ledger',
    description: 'Timestamped database of all verified visits with headmaster endorsements, volunteer lists, and classroom photos.',
    status: 'Live & Verified',
    href: '/impact',
    isExternal: false,
  },
]

export function Transparency() {
  return (
    <section id="transparency" className="tai-section relative overflow-hidden bg-background">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="tai-eyebrow text-brand">Accountability &amp; Integrity</p>
            <h2 className="tai-text-display mt-4 font-display text-foreground">
              Where Your Support Goes
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
              We operate with radical openness. Every rupee backed by our donors and CSR partners is mapped directly to classroom impact.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-card px-4 py-2 text-xs font-mono text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-600" />
            Zero Guesswork · Documented Field Operations
          </div>
        </div>

        {/* 4 Core Expense Categories (No Fake Percentages) */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon
            return (
              <Reveal key={cat.title} delay={idx * 0.1}>
                <div className="flex h-full flex-col justify-between rounded-2xl border border-foreground/15 bg-card/60 p-6 sm:p-7 transition-all duration-300 hover:border-brand/40 hover:bg-card">
                  <div>
                    <div className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <Icon className="size-5" />
                    </div>

                    <h3 className="mt-5 font-display text-xl font-bold text-foreground">
                      {cat.title}
                    </h3>
                    <p className="font-mono text-xs font-semibold text-brand mt-0.5">
                      {cat.subtitle}
                    </p>

                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-foreground/10 pt-4">
                    <ul className="space-y-2 text-xs text-foreground/80">
                      {cat.items.map((item, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-2">
                          <span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-brand" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        {/* Reports & Documentation Section */}
        <div className="mt-16 rounded-3xl border border-foreground/15 bg-card/30 p-6 sm:p-10">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-foreground/10 pb-6 sm:flex-row sm:items-center">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-brand">
                Institutional Repository
              </span>
              <h3 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Governance, Reports &amp; Verified Records
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
              CSR evaluation teams and donor committees can review verified documentation on demand.
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {DOCUMENTS.map((doc, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-xl border border-foreground/15 bg-background p-5 transition-all hover:border-brand/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {doc.category}
                    </span>
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-brand">
                      {doc.status}
                    </span>
                  </div>

                  <h4 className="mt-3 font-display text-base font-bold text-foreground group-hover:text-brand transition-colors">
                    {doc.title}
                  </h4>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {doc.format}
                  </p>
                  <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                    {doc.description}
                  </p>
                </div>

                <div className="mt-5 border-t border-foreground/10 pt-3">
                  <Link
                    href={doc.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
                  >
                    <span>View Details</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-foreground/10 bg-background/80 p-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-brand shrink-0" />
              <span>
                Need tailored CSR audit annexures, school MoUs, or 80G documentation?
              </span>
            </div>
            <Link
              href="/contact?intent=csr-diligence"
              className="inline-flex items-center gap-1 font-bold text-brand hover:underline shrink-0"
            >
              Contact Compliance Desk &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
