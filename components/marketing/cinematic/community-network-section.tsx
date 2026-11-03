'use client'

import { useState } from 'react'
import { Network, Users, GraduationCap, School, Building2, Heart, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NetworkNode {
  id: string
  role: string
  title: string
  count: string
  contribution: string
  icon: typeof GraduationCap
  color: string
}

const NODES: NetworkNode[] = [
  {
    id: 'students',
    role: 'THE LEARNERS',
    title: 'Government School Children',
    count: '1,842+ Students',
    contribution: 'Discovering their creative potential, sharing prompt experiments with families, and dreaming bigger.',
    icon: Users,
    color: '#9E2A2B',
  },
  {
    id: 'mentors',
    role: 'THE VOLUNTEERS',
    title: 'NIAT Engineering Mentors',
    count: '100+ Active Mentors',
    contribution: 'Undergraduates who dedicate weekends to travel to rural schools, designing customized Telugu/English modules.',
    icon: GraduationCap,
    color: '#E09F3E',
  },
  {
    id: 'teachers',
    role: 'THE EDUCATORS',
    title: 'School Teachers & Headmasters',
    count: '45+ Educators',
    contribution: 'Welcoming TAI into daily timetables, encouraging students, and integrating AI prompts into regular curriculum.',
    icon: School,
    color: '#2D5A27',
  },
  {
    id: 'institutions',
    role: 'THE CAMPUSES',
    title: 'NIAT Campus Chapters',
    count: '9 Campus Hubs',
    contribution: 'Autonomous student-led chapters across Telangana & Andhra Pradesh organizing weekly outreach logistics.',
    icon: Building2,
    color: '#1D3557',
  },
  {
    id: 'community',
    role: 'THE SUPPORTERS',
    title: 'CSR & Education Advocates',
    count: 'Growing Daily',
    contribution: 'Funding laptop kits, printed student workbooks, and expanding chapters to new rural districts.',
    icon: Heart,
    color: '#6A0572',
  },
]

export function CommunityNetworkSection() {
  const [activeNodeId, setActiveNodeId] = useState('mentors')
  const activeNode = NODES.find((n) => n.id === activeNodeId) || NODES[0]

  return (
    <section
      id="scene-network"
      aria-label="Community Network: The Growing Web of Impact"
      className="relative w-full py-24 sm:py-32 bg-[#0C120E] text-white overflow-hidden border-b border-white/10"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-950/60 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-amber-300 backdrop-blur-md">
            <Network className="size-3.5 text-amber-400" />
            Chapter 08 · The Living Network
          </span>
          <h2 className="mt-5 font-display text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            An Interconnected Movement
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/75 font-serif max-w-2xl mx-auto">
            Change does not happen in isolation. See how individual students, engineering mentors,
            school teachers, and communities connect to form an unstoppable educational loop.
          </p>
        </div>

        {/* ─── VISUAL CONNECTED NETWORK CAROUSEL / GRAPH ───────────────────── */}
        <div className="mt-14 sm:mt-18 grid grid-cols-1 md:grid-cols-5 gap-4">
          {NODES.map((node, i) => {
            const Icon = node.icon
            const isActive = activeNodeId === node.id

            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setActiveNodeId(node.id)}
                className={cn(
                  'flex flex-col items-center text-center p-6 rounded-3xl border transition-all duration-300 cursor-pointer',
                  isActive
                    ? 'bg-white/15 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)] scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                )}
              >
                <div
                  className="size-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg transition-transform"
                  style={{ backgroundColor: node.color }}
                >
                  <Icon className="size-7" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-amber-300 font-bold">
                  {node.role}
                </span>
                <span className="font-display text-lg font-bold text-white mt-1 leading-snug">
                  {node.title}
                </span>
                <span className="mt-2 text-xs font-mono text-white/60">
                  {node.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* ─── ACTIVE NODE SPOTLIGHT CARD ──────────────────────────────────── */}
        <div className="mt-10 sm:mt-12 bg-gradient-to-br from-white/10 to-white/5 border border-white/15 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-amber-400 font-bold block">
                {activeNode.role}
              </span>
              <h3 className="font-display text-2xl sm:text-4xl font-bold text-white mt-1">
                {activeNode.title}
              </h3>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 font-mono text-xs text-amber-300 font-bold">
              {activeNode.count}
            </span>
          </div>

          <p className="mt-6 text-base sm:text-lg text-white/90 leading-relaxed font-sans">
            {activeNode.contribution}
          </p>

          <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs font-mono text-white/60">
            <span>Core Philosophy: Youth Empowers Youth</span>
            <span className="text-amber-300">Continuous Multiplier Effect</span>
          </div>
        </div>
      </div>
    </section>
  )
}
