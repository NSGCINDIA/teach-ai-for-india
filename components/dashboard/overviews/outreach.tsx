import { DashboardHero } from '@/components/dashboard/dashboard-hero'
import { SCHOOL_STATUS_META } from '@/lib/constants/status'
import type { OutreachData } from '@/lib/data/dashboard'
import { formatNumber } from '@/lib/format'
import { CalendarClock, CheckCircle2, School, TrendingUp } from 'lucide-react'
import { SchoolRows, Widget } from '@/components/dashboard/overviews/shared'

// ─── Outreach Lead ────────────────────────────────────────────────────────────
export function OutreachOverview({ name, data }: { name: string; data: OutreachData }) {
  const k = data.kpis
  const maxCount = Math.max(1, ...data.pipeline.map((p) => p.count))
  return (
    <div className="space-y-8 animate-fade-up">
      <DashboardHero
        greeting="Good to see you"
        userName={name}
        role="Outreach Lead"
        impact={[
          { label: 'Schools Reached', value: formatNumber(k.totalSchools), icon: School, tone: 'brand' },
          { label: 'Active Leads', value: formatNumber(k.leads), icon: TrendingUp },
          { label: 'Registered', value: formatNumber(k.approved), icon: CheckCircle2 },
          { label: 'Sessions Active', value: formatNumber(k.sessionsScheduled), icon: CalendarClock },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* School Pipeline — visual progress bars */}
        <Widget
          title="School Pipeline"
          subtitle="Your school journey from lead to active"
          href="/dashboard/schools"
        >
          <ul className="space-y-3 mt-1">
            {data.pipeline.map((p) => (
              <li key={p.status} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm font-semibold text-foreground truncate">
                  {SCHOOL_STATUS_META[p.status].label}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream-light border border-border/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-brand-orange animate-progress"
                    style={{ width: `${(p.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-bold tabular-nums text-foreground">{p.count}</span>
              </li>
            ))}
          </ul>
        </Widget>

        <Widget
          title="Awaiting Your Action"
          subtitle="Schools pending outreach approval from you"
          href="/dashboard/schools"
        >
          <SchoolRows
            schools={data.awaitingFollowup}
            empty="Nothing waiting on you!"
            emptySubtext="All outreach follow-ups are done."
          />
        </Widget>

        <Widget
          title="Upcoming School Visits"
          subtitle="Scheduled visits coming up"
          href="/dashboard/schools"
        >
          <SchoolRows
            schools={data.upcomingVisits}
            empty="No visits scheduled yet."
            emptySubtext="Add your first school visit to get started."
          />
        </Widget>

        <Widget
          title="Recently Added Schools"
          subtitle="New schools added to the network"
          href="/dashboard/schools"
        >
          <SchoolRows
            schools={data.recentlyAdded}
            empty="No schools added recently."
            emptySubtext="Start building your schools pipeline."
          />
        </Widget>
      </div>
    </div>
  )
}

// ─── Volunteer Lead ───────────────────────────────────────────────────────────
