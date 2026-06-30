import type { Metadata } from 'next'
import { HeartHandshake, Rocket, Users } from 'lucide-react'
import { getCampusCards } from '@/lib/data/public'
import { PageHeader } from '@/components/marketing/page-header'
import { VolunteerForm, type CampusOption } from '@/components/marketing/volunteer-form'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Join the movement',
  description:
    'Become a campus volunteer with Teach AI for India and bring applied AI literacy to government school classrooms.',
}

const PERKS = [
  { icon: Rocket, title: 'Real impact, fast', description: 'Run your first classroom session within weeks of joining.' },
  { icon: Users, title: 'A campus team', description: 'Build alongside other students who care about the same thing.' },
  { icon: HeartHandshake, title: 'Mentorship', description: 'Training, playbooks, and support from experienced leads.' },
]

export default async function JoinPage() {
  const campuses = await getCampusCards()
  const options: CampusOption[] = campuses.map((c) => ({ slug: c.slug, name: c.name }))

  return (
    <>
      <PageHeader
        eyebrow="Volunteer"
        title="Join the movement"
        description="Lend your skills to a classroom that has never had access to AI. We welcome students from every discipline — curiosity matters more than a résumé."
      />

      <section className="section-padding">
        <div className="container-wide grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <aside className="space-y-6">
            <h2 className="font-display text-2xl font-bold">Why volunteer</h2>
            <ul className="space-y-5">
              {PERKS.map((perk) => (
                <li key={perk.title} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                    <perk.icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display font-bold">{perk.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{perk.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
            <h2 className="font-display text-2xl font-bold">Apply to volunteer</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fields marked <span className="text-error">*</span> are required.
            </p>
            <div className="mt-6">
              <VolunteerForm campuses={options} />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
