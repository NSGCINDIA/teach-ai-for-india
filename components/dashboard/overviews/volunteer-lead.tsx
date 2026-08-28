import { DashboardHero } from '@/components/dashboard/dashboard-hero'
import { Badge } from '@/components/ui/badge'
import type { VolunteerLeadData } from '@/lib/data/dashboard'
import { formatNumber } from '@/lib/format'
import { CalendarClock, CheckCircle2, School, Users } from 'lucide-react'
import { SchoolTeamCard, WorkQueueCard } from '@/components/dashboard/overviews/shared'

// ─── Volunteer Lead ───────────────────────────────────────────────────────────
export function VolunteerLeadOverview({
  name,
  data,
  queueData,
}: {
  name: string
  data: VolunteerLeadData
  queueData?: any
}) {
  const workItems = queueData?.workItems ?? []

  return (
    <div className="space-y-8 animate-fade-up">
      <DashboardHero
        greeting="Good to see you"
        userName={name}
        role="Volunteer Lead"
        impact={[
          { label: 'Schools Needing Teams', value: formatNumber(queueData?.schoolsNeedingTeamsCount ?? 0), icon: School },
          { label: 'Incomplete Teams', value: formatNumber(queueData?.incompleteTeamsCount ?? 0), icon: Users },
          { label: 'Pending Responses', value: formatNumber(queueData?.pendingResponsesCount ?? 0), icon: CalendarClock },
          { label: 'Teams Ready', value: formatNumber(queueData?.teamsReadyCount ?? 0), icon: CheckCircle2 },
        ]}
      />

      <WorkQueueCard
        title="Schools Needing Volunteer Teams"
        subtitle="Active schools waiting for their team to be assigned"
        icon={Users}
        href="/dashboard/assignments"
        hrefLabel="View all assignments"
        empty={workItems.length === 0}
        emptyMessage="All school teams are fully staffed!"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {workItems.map((item: any) => {
            const isReady = item.confirmed_count >= item.required_volunteers
            return (
              <SchoolTeamCard
                key={item.id}
                item={item}
                accentClass={
                  isReady
                    ? 'border-success/30 bg-success/5'
                    : 'border-brand-orange/30 bg-brand-orange/5'
                }
                statusBadge={
                  <Badge
                    variant="outline"
                    className={
                      isReady
                        ? 'border-success/40 bg-success/15 text-success font-bold shrink-0'
                        : 'border-brand-orange/40 bg-brand-orange/15 text-brand-orange font-bold shrink-0'
                    }
                  >
                    {isReady ? 'Team Ready' : 'Building'}
                  </Badge>
                }
                statsRow={
                  <>
                    <span>Confirmed: <strong className="text-foreground">{item.confirmed_count}/{item.required_volunteers}</strong></span>
                    <span>Awaiting: <strong className="text-foreground">{item.requested_count}</strong></span>
                    <span>Unavailable: <strong className="text-foreground">{item.unavailable_count}</strong></span>
                  </>
                }
                actionHref={`/dashboard/schools/${item.id}`}
                actionLabel={isReady ? 'View Team' : 'Build Team'}
              />
            )
          })}
        </div>
      </WorkQueueCard>
    </div>
  )
}

// ─── Execution Lead ───────────────────────────────────────────────────────────
