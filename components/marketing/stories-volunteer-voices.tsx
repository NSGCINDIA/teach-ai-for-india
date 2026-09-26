'use client'

import { useState } from 'react'
import { GraduationCap, Heart, Sparkles, MessageCircle, HelpCircle } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'
import { AvatarImage } from '@/components/shared/image-with-fallback'

interface VolunteerStory {
  id: string
  name: string
  campus: string
  role: string
  whyJoined: string
  surprised: string
  learned: string
  advice: string
}

const VOLUNTEERS: VolunteerStory[] = [
  {
    id: 'karthik',
    name: 'Karthik',
    campus: 'NIAT × CDU, Hyderabad',
    role: 'Senior Volunteer',
    whyJoined:
      'I joined thinking I would just explain neural networks or prompt basics. I didn’t realize it would completely rewrite how I see my own engineering education.',
    surprised:
      'How quickly kids grasp logic when stripped of English jargon. When the power goes out mid-session, they still eagerly solve flowchart puzzles on blackboards with chalk.',
    learned:
      'Patience and humility. Technology is only as good as the hands you place it in, and these children possess boundless creative energy.',
    advice:
      'You don’t join for a line on your résumé. You join because there is something valuable you know that someone else deserves a chance to learn.',
  },
  {
    id: 'sneha',
    name: 'Sneha',
    campus: 'NIAT × KKH, Hyderabad',
    role: 'Chapter Lead',
    whyJoined:
      'We were learning cutting-edge AI tools at university every day, but children just 5km away in government schools had never seen an AI interface.',
    surprised:
      'Their sheer uninhibited imagination. Students in Warangal asked to generate village festivals, rocket cycles, and Telugu poetry illustrations.',
    learned:
      'How to organize hardware logistics, build trust with school principals, and lead a volunteer team under unpredictable rural lab conditions.',
    advice:
      'Step into just one classroom. The look on a student’s face when their words generate something on screen will stay with you forever.',
  },
  {
    id: 'ravi',
    name: 'Ravi',
    campus: 'NIAT × NSRIT, Visakhapatnam',
    role: 'Outreach Coordinator',
    whyJoined:
      'To bridge the regional language divide. Practical technology literacy shouldn’t be reserved only for fluent English speakers.',
    surprised:
      'Students who were shy in class became confident leaders the moment we let them construct AI parameters in their mother tongue.',
    learned:
      'Empathy in curriculum design. If your lesson cannot be understood by a first-generation learner, the design is what needs fixing.',
    advice:
      'Your weekend can either be spent scrolling or helping young minds in government schools realize that they can build the future.',
  },
]

export function StoriesVolunteerVoices() {
  const [selectedVolId, setSelectedVolId] = useState(VOLUNTEERS[0].id)
  const activeVol = VOLUNTEERS.find((v) => v.id === selectedVolId) ?? VOLUNTEERS[0]

  return (
    <section className="relative overflow-hidden border-b border-border bg-card/25 py-16 md:py-24">
      <div className="container-wide px-5 md:px-8 lg:px-16">
        <Reveal>
          <div className="max-w-3xl">
            <span className="section-label text-brand">Volunteer Reflections</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl text-balance">
              NIAT students teaching students.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
              Teach AI for India is powered by the NIAT student community — passionate undergraduates
              who spend weekends in government school computer labs bringing practical AI education to classrooms.
            </p>
          </div>
        </Reveal>

        {/* Volunteer Selector Buttons */}
        <div className="mt-10 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {VOLUNTEERS.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVolId(v.id)}
              className={`flex items-center gap-3 rounded-2xl p-4 text-left transition-all shrink-0 sm:w-72 ${
                selectedVolId === v.id
                  ? 'border-2 border-brand bg-card shadow-soft-lg ring-2 ring-brand/10'
                  : 'border border-border bg-card/60 hover:bg-card hover:border-border/80'
              }`}
            >
              <AvatarImage
                src={null}
                alt={v.name}
                size="md"
                className="size-11 shrink-0 rounded-full border border-border"
              />
              <div className="min-w-0">
                <p className="font-display text-base font-bold text-foreground truncate">{v.name}</p>
                <p className="text-xs font-semibold text-brand truncate">{v.role}</p>
                <p className="text-[11px] text-muted-foreground truncate">{v.campus}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Volunteer Detailed Story */}
        <div className="mt-8">
          <Reveal key={activeVol.id}>
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft-lg md:p-10">
              <div className="flex items-center gap-4 border-b border-border/60 pb-6">
                <AvatarImage
                  src={null}
                  alt={activeVol.name}
                  size="lg"
                  className="size-16 rounded-full border-2 border-brand/30"
                />
                <div>
                  <h3 className="font-display text-2xl font-extrabold text-foreground">
                    {activeVol.name}
                  </h3>
                  <p className="text-xs font-semibold text-brand">
                    {activeVol.role} • {activeVol.campus}
                  </p>
                </div>
              </div>

              {/* 4 Answers Grid */}
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand">
                    <Heart className="size-3.5" /> Why did you join?
                  </span>
                  <p className="mt-3 text-sm text-foreground/90 leading-relaxed font-medium">
                    &quot;{activeVol.whyJoined}&quot;
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange">
                    <Sparkles className="size-3.5" /> What surprised you in the classroom?
                  </span>
                  <p className="mt-3 text-sm text-foreground/90 leading-relaxed font-medium">
                    &quot;{activeVol.surprised}&quot;
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-teal">
                    <GraduationCap className="size-3.5" /> What did you learn?
                  </span>
                  <p className="mt-3 text-sm text-foreground/90 leading-relaxed font-medium">
                    &quot;{activeVol.learned}&quot;
                  </p>
                </div>

                <div className="rounded-2xl border border-brand/30 bg-brand/5 p-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand">
                    <MessageCircle className="size-3.5" /> What would you tell another student?
                  </span>
                  <p className="mt-3 text-sm text-foreground font-bold leading-relaxed">
                    &quot;{activeVol.advice}&quot;
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
