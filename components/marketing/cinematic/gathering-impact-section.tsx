'use client'

import { Users, School, MapPin, Award, CheckCircle } from 'lucide-react'

interface ImpactMetric {
  value: string
  label: string
  sublabel: string
  icon: typeof Users
  color: string
  bgLight: string
}

const METRICS: ImpactMetric[] = [
  {
    value: '1,842+',
    label: 'STUDENTS REACHED',
    sublabel: 'Hands-on practical AI literacy in government school classrooms',
    icon: Users,
    color: '#9E2A2B',
    bgLight: 'bg-[#9E2A2B]/10 text-[#9E2A2B]',
  },
  {
    value: '20+',
    label: 'GOVERNMENT SCHOOLS',
    sublabel: 'Zilla Parishad & Mandal Parishad Primary Schools reached',
    icon: School,
    color: '#E09F3E',
    bgLight: 'bg-[#E09F3E]/15 text-[#B87A14]',
  },
  {
    value: '9',
    label: 'ACTIVE CAMPUSES',
    sublabel: 'Autonomous NIAT student chapters driving weekly outreach',
    icon: MapPin,
    color: '#2D5A27',
    bgLight: 'bg-[#2D5A27]/10 text-[#2D5A27]',
  },
  {
    value: '100+',
    label: 'STUDENT VOLUNTEERS',
    sublabel: 'Engineering undergraduates passing their knowledge forward',
    icon: Award,
    color: '#1D3557',
    bgLight: 'bg-[#1D3557]/10 text-[#1D3557]',
  },
]

export function GatheringImpactSection() {
  return (
    <section
      id="scene-impact"
      aria-label="Impact: Verified student metrics"
      className="relative w-full py-24 sm:py-32 bg-[#FAF8F5] text-[#1B1B1B] overflow-hidden border-b border-[#E2DDD5]"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#2D5A27]/10 border border-[#2D5A27]/20 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-[#2D5A27] font-semibold">
            <CheckCircle className="size-3.5 text-[#2D5A27]" />
            Verified Impact
          </span>
          <h2 className="mt-5 font-display text-4xl sm:text-6xl font-bold tracking-tight text-[#1B1B1B]">
            From One Classroom to 1,842+ Minds
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#555] font-serif max-w-2xl mx-auto">
            These are not vanity projections or theoretical estimates. Every single student has touched
            a keyboard, every school has opened its doors, and every session is fully documented.
          </p>
        </div>

        {/* ─── METRIC CARDS ───────────────────────────────────────────────── */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {METRICS.map((metric, i) => {
            const Icon = metric.icon

            return (
              <div
                key={i}
                className="group relative flex flex-col justify-between p-7 rounded-3xl bg-white border border-[#E2DDD5] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  <div className={`size-12 rounded-2xl flex items-center justify-center mb-6 ${metric.bgLight}`}>
                    <Icon className="size-6" />
                  </div>

                  <div className="font-display text-4xl sm:text-5xl font-extrabold text-[#1B1B1B] tracking-tight">
                    {metric.value}
                  </div>

                  <span className="font-mono text-xs font-bold uppercase tracking-wider block mt-2 text-[#9E2A2B]">
                    {metric.label}
                  </span>

                  <p className="mt-3 text-sm text-[#555] leading-relaxed">
                    {metric.sublabel}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#ECE8E1] flex items-center justify-between text-[11px] font-mono text-[#777]">
                  <span>Field Record</span>
                  <span className="text-[#2D5A27] font-bold">100% Verified ✓</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
