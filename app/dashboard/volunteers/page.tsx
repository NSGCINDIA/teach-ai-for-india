import { requireAccess } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { listAdminUsers } from '@/lib/data/admin'
import { UsersTable } from '@/components/admin/users-table'
import { EmptyState } from '@/components/shared/states'

export const metadata = { title: 'Volunteers' }

export default async function DashboardVolunteersPage() {
  const user = await requireAccess('/dashboard/volunteers')
  const users = await listAdminUsers({ campus_id: user.campus_id ?? undefined })
  const canManage = can(user.role, 'manage_user_roles') !== false

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Volunteers</h1>
        <p className="mt-1 text-muted-foreground">
          {users.length} member{users.length === 1 ? '' : 's'} on your campus team.
        </p>
      </header>

      {!canManage && (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          You have read-only access to this roster.
        </p>
      )}

      {users.length === 0 ? (
        <EmptyState title="No team members yet" description="Volunteers invited to your campus will appear here." />
      ) : (
        <UsersTable users={users} campuses={[]} canManage={canManage} currentUserId={user.id} />
      )}
    </div>
  )
}
