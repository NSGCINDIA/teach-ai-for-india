'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Sparkles, Heart, ShieldCheck, Copy, CheckCheck, Landmark } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface Tier {
  amount: number
  displayAmount: string
  label: string
  badge?: string
  popular?: boolean
  description: string
  deliverables: string[]
  equivalent: string
}

const TIERS: Tier[] = [
  {
    amount: 500,
    displayAmount: '₹500',
    label: 'Learning resources for students',
    badge: 'Student Starter',
    description: 'Provides a student in a government school with printed prompt cards, bilingual AI workbook, and practice materials.',
    deliverables: ['Full printed prompt workbook', 'Bilingual AI cheat-sheet', 'Classroom project supplies'],
    equivalent: 'Equips 1 student for hands-on AI practice',
  },
  {
    amount: 2500,
    displayAmount: '₹2,500',
    label: 'One AI learning session',
    badge: 'Most Popular',
    popular: true,
    description: 'Covers the operational logistics, tablet access, mobile connectivity, and volunteer transit for a 30+ student session.',
    deliverables: ['30+ students in hands-on workshop', 'Volunteer commute & field logistics', 'Live cloud AI tool generation access'],
    equivalent: 'Takes a university team to 1 classroom',
  },
  {
    amount: 10000,
    displayAmount: '₹10,000',
    label: 'Support an AI-enabled classroom',
    badge: 'Classroom Sponsor',
    description: 'Enables repeated hands-on access with shared hardware kits, teacher guides, and a multi-week practice program.',
    deliverables: ['Shared tablet hardware deployment', 'School teacher orientation manual', 'Follow-up curriculum workbook pack'],
    equivalent: 'Transforms an entire grade into creators',
  },
  {
    amount: 25000,
    displayAmount: '₹25,000',
    label: 'Support a school program',
    badge: 'School Champion',
    description: 'Powers a complete multi-class rollout across an entire government school, including a student showcase exhibition.',
    deliverables: ['Multi-week curriculum delivery', 'Headmaster & teacher integration', 'Final school AI showcase & certificates'],
    equivalent: 'Adopts 1 complete government school',
  },
  {
    amount: 100000,
    displayAmount: '₹1,00,000',
    label: 'Help scale AI education across multiple classrooms',
    badge: 'Institutional Sponsor',
    description: 'Funds a multi-campus regional deployment across 4+ schools in Telangana or Andhra Pradesh with audited impact reporting.',
    deliverables: ['4+ government schools sponsored', 'Dedicated university campus team', 'Audited field report with photo logs'],
    equivalent: 'Catalyzes an entire district cluster',
  },
]

export function FundraisingTiers() {
  const [selectedTier, setSelectedTier] = useState<Tier>(TIERS[1])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [copiedUpi, setCopiedUpi] = useState(false)

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('sponsor@teachaiforindia')
    setCopiedUpi(true)
    setTimeout(() => setCopiedUpi(false), 2000)
  }

  return (
    <section id="fund-a-classroom" className="tai-section relative overflow-hidden bg-background">
      {/* Background accents */}
      <div className="pointer-events-none absolute -left-40 top-1/4 size-96 rounded-full bg-[var(--brand-orange)]/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 size-96 rounded-full bg-[var(--brand-maroon)]/5 blur-3xl" />

      <div className="tai-container-wide relative px-5 md:px-8 lg:px-12">
        <div className="max-w-4xl">
          <p className="tai-eyebrow text-brand">Your contribution in action</p>
          <h2 className="tai-text-display mt-4 font-display text-foreground">
            Your support becomes a classroom.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
            Every contribution helps bring practical AI education to students who may not otherwise have access.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-muted/60 px-3.5 py-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Note:</span> Tier amounts represent indicative program unit costs and will directly reflect verified audit numbers.
          </div>
        </div>

        {/* Interactive Tier Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {TIERS.map((tier) => {
            const isSelected = selectedTier.amount === tier.amount
            return (
              <div
                key={tier.amount}
                onClick={() => setSelectedTier(tier)}
                className={`group relative flex cursor-pointer flex-col justify-between rounded-xl border p-6 transition-all duration-200 ${
                  isSelected
                    ? 'border-brand bg-card shadow-lg ring-2 ring-brand/20'
                    : 'border-foreground/15 bg-card/60 hover:border-foreground/30 hover:bg-card'
                } ${tier.popular ? 'border-brand/40' : ''}`}
              >
                {tier.badge && (
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase ${
                        tier.popular
                          ? 'bg-brand text-white'
                          : 'bg-foreground/5 text-muted-foreground'
                      }`}
                    >
                      {tier.popular && <Sparkles className="size-3" />}
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                      {tier.displayAmount}
                    </span>
                  </div>

                  <h3 className="mt-2 text-lg font-bold leading-snug text-foreground">
                    {tier.label}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {tier.description}
                  </p>

                  <div className="mt-4 border-t border-foreground/10 pt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      What it delivers:
                    </p>
                    <ul className="mt-2 space-y-2 text-sm text-foreground/85">
                      {tier.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTier(tier)
                      setIsModalOpen(true)
                    }}
                    className={`inline-flex items-center justify-center gap-1.5 w-full rounded-lg py-2.5 text-sm font-bold uppercase tracking-wider transition-all ${
                      isSelected
                        ? 'bg-brand text-white hover:bg-brand-deep shadow-sm'
                        : 'bg-foreground/5 text-foreground hover:bg-brand hover:text-white'
                    }`}
                  >
                    Fund a Classroom &rarr;
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected Tier Spotlight Banner */}
        <Reveal delay={0.2}>
          <div className="mt-10 rounded-2xl border border-brand/20 bg-gradient-to-r from-brand/5 via-transparent to-[var(--brand-orange)]/5 p-6 md:p-8">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-wider text-brand">
                  <Heart className="size-4 fill-brand text-brand" />
                  <span>Selected Impact: {selectedTier.displayAmount}</span>
                </div>
                <h4 className="mt-1 font-display text-2xl font-bold text-foreground md:text-3xl">
                  {selectedTier.label}
                </h4>
                <p className="mt-2 max-w-3xl text-base text-muted-foreground leading-relaxed">
                  {selectedTier.equivalent}. All sessions are verified with principal signatures, attendance tallies, and photographic proof on our open timeline.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-7 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep"
                >
                  Fund a Classroom &rarr;
                </button>
                <Link
                  href="/join?intent=sponsor"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-foreground/20 bg-background px-6 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Custom Sponsorship
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground md:gap-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4.5 text-emerald-600" />
            <span>100% to school delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="size-4 text-emerald-600" />
            <span>Verified photo logs per session</span>
          </div>
          <div className="flex items-center gap-2">
            <Landmark className="size-4 text-emerald-600" />
            <span>Direct campus deployment</span>
          </div>
        </div>
      </div>

      {/* Donation / Support Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-foreground/15 bg-background p-6 shadow-2xl md:p-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close dialog"
            >
              ✕
            </button>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 font-mono text-xs font-semibold text-brand">
              <Sparkles className="size-3.5" />
              Direct Support
            </div>

            <h3 className="mt-3 font-display text-2xl font-bold text-foreground">
              Pledge {selectedTier.displayAmount}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedTier.label} — {selectedTier.equivalent}.
            </p>

            {/* Quick Payment Info Box */}
            <div className="mt-6 space-y-4 rounded-xl border border-foreground/15 bg-card p-4">
              <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  UPI ID (Fast Transfer)
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="inline-flex items-center gap-1 rounded bg-foreground/5 px-2 py-1 text-xs font-medium text-foreground hover:bg-foreground/10"
                >
                  {copiedUpi ? (
                    <>
                      <CheckCheck className="size-3.5 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>

              <div className="font-mono text-sm font-bold text-brand">
                sponsor@teachaiforindia
              </div>

              <div className="text-xs text-muted-foreground">
                Reference note in your UPI app:{' '}
                <span className="font-mono text-foreground font-medium">TAI-{selectedTier.amount}</span>
              </div>
            </div>

            {/* Bank details note */}
            <div className="mt-4 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Need a receipt, 80G tax exemption, or corporate CSR invoice?</p>
              <p className="mt-1">
                Reach out to our team at <a href="mailto:partnerships@teachaiforindia.org" className="text-brand underline">partnerships@teachaiforindia.org</a> and we will generate an audited expenditure statement.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-foreground/20 px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Close
              </button>
              <Link
                href={`/join?intent=sponsor&tier=${selectedTier.amount}`}
                className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-deep"
              >
                Connect With Us
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
