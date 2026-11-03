import Image from 'next/image'
import { Sparkles, ArrowDown } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

interface ProgressionStep {
  step: string
  label: string
  detail: string
}

const PROGRESSION: ProgressionStep[] = [
  {
    step: '01',
    label: 'QUESTION',
    detail: 'A student raises his hand with a grin: "Anna, can it make a picture of Allu Arjun?"',
  },
  {
    step: '02',
    label: 'CURIOSITY',
    detail: 'Instead of theory, the volunteer asks: "What is he wearing? Where is he standing?" The whole room leans in.',
  },
  {
    step: '03',
    label: 'EXPERIMENT',
    detail: 'Students take the tablet in pairs, translating Telugu thoughts into descriptive prompt words.',
  },
  {
    step: '04',
    label: 'CREATION',
    detail: 'The model generates the image in seconds. The silence breaks into loud cheers and high-fives.',
  },
  {
    step: '05',
    label: 'POSSIBILITY',
    detail: 'Fear disappears: "Can it explain Mars in Telugu? Can I build my own game? Anna, when are you coming again?"',
  },
]

const STORY_IMAGE =
  'https://res.cloudinary.com/dz7yh98jd/image/upload/f_auto,q_auto,w_1200/v1784177864/IMG-20260406-WA0007_3_hboy0k.jpg'

export function ImpactClassroomMoment() {
  return (
    <section className="tai-section bg-[var(--tai-clay)]/20 py-16 md:py-24 border-b border-foreground/10">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="tai-eyebrow text-brand">The Human Shift</p>
          <h2 className="tai-text-display mt-3 font-display text-foreground">
            Impact isn&apos;t a number. It&apos;s a moment.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            What happens when quiet students in a government school get their very first chance to interact with AI.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:items-center">
          {/* Photo on left */}
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-foreground/15 shadow-lg">
              <Image
                src={STORY_IMAGE}
                alt="Students prompting an AI tool on a tablet"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="font-display text-lg italic sm:text-xl">
                  &ldquo;Anna, can it make a picture of Allu Arjun?&rdquo;
                </p>
                <p className="mt-1 text-xs text-white/80 font-mono">
                  MPPS Nandakramaguda &bull; Class 7 student
                </p>
              </div>
            </div>
          </div>

          {/* 5-Step Progression on right */}
          <div className="lg:col-span-6 space-y-4">
            {PROGRESSION.map((p, idx) => (
              <Reveal key={p.step} delay={idx * 0.08}>
                <div className="relative flex items-start gap-4 rounded-xl border border-foreground/15 bg-background p-4.5 sm:p-5 transition-all hover:border-brand/40">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand/10 font-mono text-xs font-bold text-brand">
                    {p.step}
                  </span>
                  <div>
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-brand">
                      {p.label}
                    </h4>
                    <p className="mt-1 text-sm text-foreground leading-relaxed">
                      {p.detail}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
