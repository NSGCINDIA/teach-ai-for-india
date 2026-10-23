import { UserPlus } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { listCampusVolunteerApplications } from '@/lib/data/volunteer-applications'
import { applicationStage } from '@/lib/volunteer-applications/stage'
import { VolunteerApplicationCard } from '@/components/volunteers/volunteer-application-card'
import { EmptyState } from '@/components/shared/states'
import { PageHeader } from '@/components/dashboard/page-header'

export const metadata = { title: 'Volunteer applications' }

export default async function VolunteerApplicationsPage() {
  const user = await requireAccess('/dashboard/volunteer-applications')
  const applications = await listCampusVolunteerApplications()

  // Campus Leads see every request on their campus but only the Volunteer Lead
  // can act; the database enforces the same split.
  const canAct = user.role === 'volunteer_lead'

  const waiting = applications.filter((a) => applicationStage(a) === 'applied')
  const inProgress = applications.filter((a) => {
    const s = applicationStage(a)
    return s === 'picked_up' || s === 'interview_scheduled' || s === 'interview_done'
  })
  const closed = applications
    .filter((a) => {
      const s = applicationStage(a)
      return s === 'selected' || s === 'rejected'
    })
    .sort((a, b) => (b.decided_at ?? '').localeCompare(a.decided_at ?? ''))
    .slice(0, 20)

  return (
    <div className="space-y-6">
      <PageHeader
        icon={UserPlus}
        title="Volunteer applications"
        description={
          canAct
            ? 'Pick up new applications, schedule the interview, record the result and send the decision email.'
            : 'Applications from students on your campus. The Volunteer Lead picks each one up and runs the interview.'
        }
      />

      {applications.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No applications yet"
          description="When a student applies to volunteer on your campus, it shows up here."
        />
      ) : (
        <>
          <Section title="Waiting to be picked up" count={waiting.length} empty="Nothing is waiting.">
            {waiting.map((a) => (
              <VolunteerApplicationCard key={a.id} application={a} canAct={canAct} currentUserId={user.id} />
            ))}
          </Section>
          <Section title="In progress" count={inProgress.length} empty="No interviews in progress.">
            {inProgress.map((a) => (
              <VolunteerApplicationCard key={a.id} application={a} canAct={canAct} currentUserId={user.id} />
            ))}
          </Section>
          {closed.length > 0 && (
            <Section title="Recently decided" count={closed.length} empty="">
              {closed.map((a) => (
                <VolunteerApplicationCard key={a.id} application={a} canAct={canAct} currentUserId={user.id} />
              ))}
            </Section>
          )}
        </>
      )}
    </div>
  )
}

function Section({
  title, count, empty, children,
}: Readonly<{ title: string; count: number; empty: string; children: React.ReactNode }>) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-sm font-semibold">
        {title}
        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{count}</span>
      </h2>
      {count === 0 ? <p className="text-sm text-muted-foreground">{empty}</p> : <ul className="space-y-3">{children}</ul>}
    </section>
  )
}
