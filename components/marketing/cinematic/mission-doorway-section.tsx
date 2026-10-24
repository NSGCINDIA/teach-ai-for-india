'use client'

import { BookOpen, Sparkles, HeartHandshake, Compass } from 'lucide-react'
import { LightbulbDoodle, RobotDoodle } from '@/components/marketing/floating-doodles'

export function MissionDoorwaySection() {
  return (
    <section
      id="scene-mission"
      aria-label="Mission: Every Classroom a Doorway to the Future"
      className="relative w-full py-24 sm:py-32 bg-[#FAF8F5] text-[#1B1B1B] overflow-hidden border-y border-[#E2DDD5]"
    >
      {/* Ambient margin doodles (far outer gutters, strictly outside reading columns) */}
      <div className="absolute top-16 left-6 pointer-events-none opacity-20 select-none hidden 2xl:block" aria-hidden="true">
        <LightbulbDoodle className="size-20 text-[#E09F3E]" />
      </div>
      <div className="absolute bottom-16 right-6 pointer-events-none opacity-20 select-none hidden 2xl:block" aria-hidden="true">
        <RobotDoodle className="size-20 text-[#9E2A2B]" />
      </div>

      {/* Subtle school paper ruled-line grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(#8B0000 1px, transparent 1px), linear-gradient(90deg, #8B0000 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        {/* Eyebrow badge */}
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#9E2A2B]/10 border border-[#9E2A2B]/20 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold">
            <Compass className="size-3.5 text-[#9E2A2B]" />
            Our Mission
          </span>
        </div>

        {/* Signature headline */}
        <div className="mt-8 text-center max-w-4xl mx-auto">
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#1B1B1B] leading-[1.08]">
            &ldquo;Every classroom can become a{' '}
            <span className="italic text-[#9E2A2B]">
              doorway to the future
            </span>
            .&rdquo;
          </h2>
          <p className="mt-6 text-lg sm:text-2xl text-[#4A4A4A] leading-relaxed font-serif max-w-3xl mx-auto">
            Artificial Intelligence is reshaping the world. But access to AI education is concentrated
            in elite urban institutions. We believe government school students in rural and Tier-2
            India deserve to lead this technological shift — not just observe it.
          </p>
        </div>

        {/* ─── OPEN NOTEBOOK DOSSIER CARD ──────────────────────────────────── */}
        <div className="mt-16 sm:mt-20 bg-white rounded-3xl shadow-xl border border-[#E2DDD5] p-6 sm:p-12 relative overflow-hidden">
          {/* Notebook spiral ring binder decorative header */}
          <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-[#9E2A2B] via-[#E09F3E] to-[#2D5A27]" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 pt-4">
            {/* Mission Pillar 1 */}
            <div className="flex flex-col justify-between p-6 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] hover:border-[#9E2A2B]/30 transition-all duration-300 hover:shadow-md group">
              <div>
                <div className="size-12 rounded-xl bg-[#9E2A2B]/10 flex items-center justify-center text-[#9E2A2B] mb-5 group-hover:scale-110 transition-transform">
                  <HeartHandshake className="size-6" />
                </div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#9E2A2B] font-bold">
                  01 · STUDENTS TEACHING STUDENTS
                </span>
                <h3 className="font-display text-2xl font-bold text-[#1B1B1B] mt-2">
                  Not Waiting for Graduation
                </h3>
                <p className="mt-3 text-sm text-[#555] leading-relaxed">
                  NIAT engineering undergraduates actively bring what they learn into government schools.
                  The generational closeness removes fear and makes learning relatable and exciting.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E4DC] font-mono text-xs text-[#777]">
                Relatable Youth Mentorship
              </div>
            </div>

            {/* Mission Pillar 2 */}
            <div className="flex flex-col justify-between p-6 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] hover:border-[#E09F3E]/40 transition-all duration-300 hover:shadow-md group">
              <div>
                <div className="size-12 rounded-xl bg-[#E09F3E]/15 flex items-center justify-center text-[#B87A14] mb-5 group-hover:scale-110 transition-transform">
                  <Sparkles className="size-6" />
                </div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#B87A14] font-bold">
                  02 · 100% HANDS-ON
                </span>
                <h3 className="font-display text-2xl font-bold text-[#1B1B1B] mt-2">
                  Keyboards Over Slides
                </h3>
                <p className="mt-3 text-sm text-[#555] leading-relaxed">
                  No dry theoretical lectures. In our sessions, every child touches a computer, crafts
                  their first prompt, creates generative art, and experiences AI responding in real time.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E4DC] font-mono text-xs text-[#777]">
                Practical Experience First
              </div>
            </div>

            {/* Mission Pillar 3 */}
            <div className="flex flex-col justify-between p-6 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] hover:border-[#2D5A27]/40 transition-all duration-300 hover:shadow-md group">
              <div>
                <div className="size-12 rounded-xl bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27] mb-5 group-hover:scale-110 transition-transform">
                  <BookOpen className="size-6" />
                </div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#2D5A27] font-bold">
                  03 · SUSTAINED IMPACT
                </span>
                <h3 className="font-display text-2xl font-bold text-[#1B1B1B] mt-2">
                  Building Local Capacity
                </h3>
                <p className="mt-3 text-sm text-[#555] leading-relaxed">
                  We partner with school headmasters and teachers, leaving behind structured AI workbooks,
                  curated prompt playbooks, and continuous campus chapter mentoring support.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E4DC] font-mono text-xs text-[#777]">
                Institutional Continuity
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
