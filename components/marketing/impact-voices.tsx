import { GraduationCap, School, Quote } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface Voice {
  quote: string
  name: string
  role: string
  badge: string
  isStudent?: boolean
}

const VOICES: Voice[] = [
  {
    quote: 'Anna, when are you coming again?',
    name: 'A Student',
    role: 'Class 7, MPPS Nandakramaguda, Rangareddy',
    badge: 'Student Voice',
    isStudent: true,
  },
  {
    quote: 'Anna, can it make a picture of Allu Arjun? Can we build something like this again next week?',
    name: 'Raju',
    role: 'Class 7, MPPS Nandakramaguda',
    badge: 'Student Voice',
    isStudent: true,
  },
  {
    quote: 'I thought computers only worked for typing exams or games someone else made. Today I wrote three prompts myself and made a Telugu space picture.',
    name: 'Kavitha',
    role: 'Class 8, ZPHS Bachupally',
    badge: 'Student Voice',
    isStudent: true,
  },
  {
    quote: 'When the image appeared on the screen, everyone stood up and clapped. We didn’t want the session to end.',
    name: 'Sai',
    role: 'Class 9, ZPH High School Pendurthi',
    badge: 'Student Voice',
    isStudent: true,
  },
  {
    quote: 'The students showed strong interest and picked things up quickly. With proper teaching, they have clear potential to grow and perform well.',
    name: 'Balaji',
    role: 'Principal, ZPH High School Sontyam',
    badge: 'School Leadership',
    isStudent: false,
  },
  {
    quote: 'The sessions were very interactive and our students were eager to participate in all the hands-on AI exercises.',
    name: 'Pushpa Latha',
    role: 'Principal, ZPHS Agiripalli',
    badge: 'School Leadership',
    isStudent: false,
  },
]

export function ImpactVoices() {
  return (
    <section className="tai-section bg-[var(--tai-clay)]/25 py-16 md:py-24 border-b border-foreground/10">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="tai-eyebrow text-brand">Real Voices</p>
          <h2 className="tai-text-display mt-3 font-display text-foreground">
            Listen to the students.
          </h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            Unfiltered words from students holding a tablet for the first time with NIAT mentors and the educators who invite us in.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VOICES.map((v, idx) => (
            <Reveal key={idx} delay={idx * 0.07}>
              <div className="flex h-full flex-col justify-between rounded-2xl border border-foreground/15 bg-background p-6 sm:p-7 transition-all hover:border-brand/40 hover:shadow-sm">
                <div>
                  <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-brand">
                      {v.isStudent ? <GraduationCap className="size-3" /> : <School className="size-3" />}
                      {v.badge}
                    </span>
                    <Quote className="size-4 text-muted-foreground/40" />
                  </div>

                  <p className="mt-4 font-display text-lg italic text-foreground leading-snug">
                    &ldquo;{v.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-foreground/10">
                  <p className="font-bold text-sm text-foreground">{v.name}</p>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">{v.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
