import { MapPin } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { listCampusesFull, listAdminUsers } from '@/lib/data/admin'
import { formatNumber } from '@/lib/format'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/states'
import { CampusForm } from '@/components/admin/campus-form'

export const metadata = { title: 'Campuses · Admin' }

export default async function AdminCampusesPage() {
  await requireAccess('/admin/campuses')
  const [campuses, users] = await Promise.all([
    listCampusesFull(),
    listAdminUsers({ active: true }),
  ])
  // Anyone who can lead a campus (active team member, not a school POC / viewer).
  const leads = users
    .filter((u) => u.role !== 'school_poc' && u.role !== 'viewer')
    .map((u) => ({ id: u.id, full_name: u.full_name }))

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Campuses</h1>
          <p className="mt-1 text-muted-foreground">
            {campuses.length} campus{campuses.length === 1 ? '' : 'es'}. Configure targets, leads, and visibility.
          </p>
        </div>
        <CampusForm leads={leads} />
      </header>

      {campuses.length === 0 ? (
        <EmptyState title="No campuses yet" description="Add your first campus to get started." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campuses.map((c) => (
            <Card key={c.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display font-semibold">{c.name}</h2>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" /> {c.city}, {c.state}
                  </p>
                </div>
                {!c.is_active && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Inactive</span>
                )}
              </div>

              <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div><dt className="text-xs text-muted-foreground">Schools</dt><dd className="font-semibold tabular-nums">{formatNumber(c.target_schools)}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Students</dt><dd className="font-semibold tabular-nums">{formatNumber(c.target_students)}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Sessions</dt><dd className="font-semibold tabular-nums">{formatNumber(c.target_sessions)}</dd></div>
              </dl>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">
                  Lead: {c.lead?.full_name ?? 'Unassigned'}{c.quarter ? ` · ${c.quarter}` : ''}
                </span>
                <CampusForm campus={c} leads={leads} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
