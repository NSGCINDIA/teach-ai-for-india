import { DashboardHero, SectionHeader } from '@/components/dashboard/dashboard-hero'
import { Badge } from '@/components/ui/badge'
import type { ExecData } from '@/lib/data/dashboard'
import { formatNumber } from '@/lib/format'
import { CheckCircle2, Clock, FileClock, Wrench } from 'lucide-react'
import { SchoolTeamCard, SessionRows, Widget, WorkQueueCard } from '@/components/dashboard/overviews/shared'

// ─── Execution Lead ───────────────────────────────────────────────────────────
export function ExecOverview({
  name,
  data,
  execQueueData,
}: {
  name: string
  data: ExecData
  execQueueData?: any
}) {
  const k = data.kpis
  const workItems = execQueueData?.workItems ?? []

  return (
    <div className="space-y-8 animate-fade-up">
      <DashboardHero
        greeting="Good to see you"
        userName={name}
        role="Execution Lead"
        impact={[
          { label: 'Needing Execution Plan', value: formatNumber(execQueueData?.needingPlanCount ?? 0), icon: Wrench },
          { label: 'Awaiting Approval', value: formatNumber(execQueueData?.awaitingApprovalCount ?? 0), icon: Clock },
          { label: 'Ready to Teach', value: formatNumber(execQueueData?.executionReadyCount ?? 0), icon: CheckCircle2 },
          { label: 'Pending Session Reports', value: formatNumber(k.pendingReports), icon: FileClock },
        ]}
      />

      <WorkQueueCard
        title="Execution & Logistics Queue"
        subtitle="Schools ready for execution planning and session scheduling"
        icon={Wrench}
        href="/dashboard/schools"
        hrefLabel="View all schools"
        empty={workItems.length === 0}
        emptyMessage="No execution plans outstanding right now!"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {workItems.map((item: any) => {
            const isApproved = item.execPlanStatus === 'approved'
            const isPending = item.execPlanStatus === 'submitted' || item.execPlanStatus === 'campus_approved'
            const accentClass = isApproved
              ? 'border-success/30 bg-success/5'
              : isPending
              ? 'border-brand/20 bg-brand/5'
              : 'border-brand-orange/30 bg-brand-orange/5'
            const badgeClass = isApproved
              ? 'border-success/40 bg-success/15 text-success font-bold shrink-0'
              : isPending
              ? 'border-brand/40 bg-brand/15 text-brand font-bold shrink-0'
              : 'border-brand-orange/40 bg-brand-orange/15 text-ink-orange font-bold shrink-0'
            const badgeLabel = isApproved ? 'Plan Approved' : isPending ? 'In Review' : 'Needs Plan'

            return (
              <SchoolTeamCard
                key={item.id}
                item={item}
                accentClass={accentClass}
                statusBadge={
                  <Badge variant="outline" className={badgeClass}>{badgeLabel}</Badge>
                }
                statsRow={
                  <>
                    <span>{item.digital_classrooms} digital classroom{item.digital_classrooms !== 1 ? 's' : ''}</span>
                    <span>Projector: <strong className="text-foreground">{item.has_projector ? '✓' : 'Needed'}</strong></span>
                    <span>Team of <strong className="text-foreground">{item.required_volunteers}</strong></span>
                  </>
                }
                actionHref={`/dashboard/schools/${item.id}`}
                actionLabel={isApproved ? 'Schedule Sessions' : 'Manage Plan'}
              />
            )
          })}
        </div>
      </WorkQueueCard>

      <div className="space-y-4">
        <SectionHeader title="Your Recent Sessions" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Widget title="Today's AI Sessions" href="/dashboard/sessions">
            <SessionRows sessions={data.todaySessions} empty="No sessions today." emptySubtext="Your upcoming sessions will appear here." />
          </Widget>
          <Widget title="Reports Awaiting Submission" href="/dashboard/sessions">
            <SessionRows sessions={data.pendingReports} empty="All reports submitted!" emptySubtext="Great work keeping records up to date." />
          </Widget>
        </div>
      </div>
    </div>
  )
}

// ─── Volunteer — My Teach AI Journey ─────────────────────────────────────────
