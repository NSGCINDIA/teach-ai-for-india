import Link from 'next/link'
import {
  Banknote, Building2, CalendarCheck, GraduationCap, Images, School, Users,
} from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { getProgramSummary } from '@/lib/data/analytics'
import { getAdminAlerts } from '@/lib/data/admin'
import { formatCurrency, formatNumber } from '@/lib/format'
import { MetricCard } from '@/components/shared/metric-card'
import { AlertFeed } from '@/components/admin/alert-feed'
import { Card } from '@/components/ui/card'

export const metadata = { title: 'Admin Overview' }

const QUICK_LINKS = [
  { href: '/admin/schools', label: 'School CRM', icon: School },
  { href: '/admin/sessions', label: 'Sessions', icon: CalendarCheck },
  { href: '/admin/finance', label: 'Finance', icon: Banknote },
  { href: '/admin/evidence', label: 'Evidence', icon: Images },
  { href: '/admin/campuses', label: 'Campuses', icon: Building2 },
  { href: '/admin/volunteers', label: 'Volunteers', icon: Users },
]

export default async function AdminOverview() {
  const user = await requireAccess('/admin')
  const [summary, alerts] = await Promise.all([getProgramSummary(), getAdminAlerts()])

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Admin</p>
        <h1 className="font-display text-2xl font-bold tracking-tight">Platform overview</h1>
        <p className="mt-1 text-muted-foreground">
          Live impact across every campus, and what needs your attention today.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Schools reached" value={formatNumber(summary.schools_reached)} icon={School} sublabel={`${formatNumber(summary.schools_total)} in pipeline`} />
        <MetricCard label="Sessions verified" value={formatNumber(summary.sessions_completed)} icon={CalendarCheck} />
        <MetricCard label="Students impacted" value={formatNumber(summary.students_impacted)} icon={GraduationCap} />
        <MetricCard label="Active volunteers" value={formatNumber(summary.active_volunteers)} icon={Users} />
        <MetricCard label="Approved spend" value={formatCurrency(summary.approved_spend)} icon={Banknote} sublabel={`${formatNumber(summary.pending_claims)} claims pending`} />
        <MetricCard label="Active campuses" value={formatNumber(summary.active_campuses)} icon={Building2} sublabel={`${formatNumber(summary.states_count)} states`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AlertFeed alerts={alerts} />

        <Card className="p-5">
          <h2 className="font-display font-semibold">Jump to</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium transition-colors hover:border-brand/40 hover:bg-accent"
              >
                <l.icon className="size-4 text-brand" aria-hidden />
                {l.label}
              </Link>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Signed in as {user.email}</p>
        </Card>
      </div>
    </div>
  )
}
