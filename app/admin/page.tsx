import { Building2, GraduationCap, Layers, MapPin, Users } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { getImpactStats } from '@/lib/data/public'
import { formatNumber } from '@/lib/format'
import { MetricCard } from '@/components/shared/metric-card'
import { Card } from '@/components/ui/card'

export const metadata = { title: 'Admin Overview' }

export default async function AdminOverview() {
  const user = await requireAccess('/admin')
  const stats = await getImpactStats()

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Admin</p>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Platform overview
        </h1>
        <p className="mt-1 text-muted-foreground">
          Live impact across every campus. Full drill-downs, finance, and the alert feed land in Phase 2.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Schools reached" value={formatNumber(stats.schools_reached)} icon={GraduationCap} />
        <MetricCard label="Students impacted" value={formatNumber(stats.students_impacted)} icon={Users} />
        <MetricCard label="Sessions completed" value={formatNumber(stats.sessions_completed)} icon={Layers} />
        <MetricCard label="Active campuses" value={formatNumber(stats.active_campuses)} icon={Building2} />
        <MetricCard label="States" value={formatNumber(stats.states_count)} icon={MapPin} />
      </div>

      <Card className="p-5">
        <h2 className="font-display font-semibold">Coming in Phase 2</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The admin panel’s school CRM, session verification, finance queue, evidence vault, analytics,
          CMS, and settings (including the invite system) are scaffolded in the database and RBAC, and
          will be built out next. Signed in as {user.email}.
        </p>
      </Card>
    </div>
  )
}
