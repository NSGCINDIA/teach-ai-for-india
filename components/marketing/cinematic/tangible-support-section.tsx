'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Laptop, School, HeartHandshake, ArrowRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SupportTier {
  id: string
  amount: string
  amountNum: number
  tierName: string
  tangibleOutcome: string
  breakdown: string[]
  recommended?: boolean
}

const TIERS: SupportTier[] = [
  {
    id: 'tier-1500',
    amount: '₹1,500',
    amountNum: 1500,
    tierName: 'Classroom Kit Sponsor',
    tangibleOutcome: 'Supplies printed AI workbooks, prompt cheat-sheets, and stationery for 40 students.',
    breakdown: [
      '40 printed spiral AI prompt guidebooks (Telugu/English)',
      'Stationery kits (pens, notebooks, stickers)',
      'Student participation certificates',
    ],
  },
  {
    id: 'tier-5000',
    amount: '₹5,000',
    amountNum: 5000,
    tierName: 'Full Workshop Sponsor',
    tangibleOutcome: 'Funds travel stipends, hardware connectivity, and intensive workshop supplies for 1 school.',
    breakdown: [
      'Round-trip travel logistics for 4 NIAT student mentors',
      'Mobile 5G internet dongles for rural schools with no Wi-Fi',
      'Printed project certificates for 80+ participating children',
    ],
    recommended: true,
  },
  {
    id: 'tier-25000',
    amount: '₹25,000',
    amountNum: 25000,
    tierName: 'Semester Hub Sponsor',
    tangibleOutcome: 'Adopts an entire rural school for a semester, funding 6 iterative workshop modules.',
    breakdown: [
      'Dedicated refurbished student laptop kit for school library',
      '6 bi-weekly progressive AI workshops (Basics to Applied Code)',
      'Comprehensive semester impact report & school exhibition',
    ],
  },
]

export function TangibleSupportSection() {
  const [selectedTierId, setSelectedTierId] = useState('tier-5000')
  const selectedTier = TIERS.find((t) => t.id === selectedTierId) || TIERS[1]

  return (
    <section
      id="scene-support"
      aria-label="Tangible Support: Visual Impact Translation"
      className="relative w-full py-24 sm:py-32 bg-[#FAF8F5] text-[#1B1B1B] overflow-hidden border-b border-[#E2DDD5]"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#E09F3E]/15 border border-[#E09F3E]/30 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-[#B87A14] font-semibold">
            <HeartHandshake className="size-3.5 text-[#B87A14]" />
            Tangible Transparency
          </span>
          <h2 className="mt-5 font-display text-4xl sm:text-6xl font-bold tracking-tight text-[#1B1B1B]">
            Every Rupee Touches a Desk
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#555] font-serif max-w-2xl mx-auto">
            We don’t believe in vague overheads. See the exact physical classroom materials and
            student sessions funded by every tier of support.
          </p>
        </div>

        {/* ─── VISUAL CONTRIBUTION CHAIN ───────────────────────────────────── */}
        <div className="mt-14 sm:mt-18 bg-white rounded-3xl border border-[#E2DDD5] p-6 sm:p-10 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-8 border-b border-[#ECE8E1] text-center font-mono text-xs">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DC]">
              <span className="text-[#9E2A2B] font-bold block text-sm">01. Contribution</span>
              <span className="text-[#777] mt-1 block">Transparently allocated</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DC]">
              <span className="text-[#E09F3E] font-bold block text-sm">02. Supplies</span>
              <span className="text-[#777] mt-1 block">Workbooks &amp; 5G kits</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DC]">
              <span className="text-[#2D5A27] font-bold block text-sm">03. Classroom</span>
              <span className="text-[#777] mt-1 block">Hands-on student benches</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DC]">
              <span className="text-[#1D3557] font-bold block text-sm">04. AI Literacy</span>
              <span className="text-[#777] mt-1 block">Empowered future youth</span>
            </div>
          </div>

          {/* Tier Buttons */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier) => {
              const isSelected = selectedTierId === tier.id

              return (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTierId(tier.id)}
                  className={cn(
                    'flex flex-col justify-between p-6 sm:p-7 rounded-2xl border-2 transition-all duration-300 cursor-pointer',
                    isSelected
                      ? 'border-[#9E2A2B] bg-[#9E2A2B]/5 shadow-lg scale-102'
                      : 'border-[#E2DDD5] bg-[#FAF8F5] hover:border-[#9E2A2B]/40'
                  )}
                >
                  <div>
                    {tier.recommended && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#9E2A2B] text-white font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
                        Most Popular
                      </span>
                    )}
                    <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#1B1B1B]">
                      {tier.amount}
                    </div>
                    <span className="font-mono text-xs text-[#9E2A2B] font-bold block mt-1 uppercase tracking-wider">
                      {tier.tierName}
                    </span>
                    <p className="mt-3 text-xs sm:text-sm text-[#555] leading-relaxed">
                      {tier.tangibleOutcome}
                    </p>

                    <div className="mt-5 space-y-2 pt-4 border-t border-[#E8E4DC]">
                      {tier.breakdown.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[#444]">
                          <CheckCircle2 className="size-3.5 text-[#2D5A27] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#ECE8E1]">
                    <Link
                      href={`/contact?role=donor&tier=${tier.id}`}
                      className={cn(
                        'inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all',
                        isSelected
                          ? 'bg-[#9E2A2B] text-white hover:bg-[#780000] shadow'
                          : 'bg-white text-[#1B1B1B] border border-[#CCC] hover:bg-[#ECE8E1]'
                      )}
                    >
                      <span>Sponsor {tier.amount}</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
