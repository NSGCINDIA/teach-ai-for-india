import { requireAccess } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { listAdminUsers } from '@/lib/data/admin'
import { listCampusOptions } from '@/lib/data/schools'
import { UsersTable } from '@/components/admin/users-table'
import { InviteForm } from '@/components/admin/invite-form'

export const metadata = { title: 'Volunteers · Admin' }

export default async function AdminVolunteersPage() {
  const user = await requireAccess('/admin/volunteers')
  const [users, campuses] = await Promise.all([listAdminUsers(), listCampusOptions()])
  const canManage = can(user.role, 'manage_user_roles') !== false

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Volunteers &amp; team</h1>
          <p className="mt-1 text-muted-foreground">
            {users.length} member{users.length === 1 ? '' : 's'} across every campus. Invite, assign roles, and manage access.
          </p>
        </div>
        <InviteForm campuses={campuses} />
      </header>

      {!canManage && (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          You can invite members, but only a super admin can change roles or account status.
        </p>
      )}

      <UsersTable users={users} campuses={campuses} canManage={canManage} currentUserId={user.id} />
    </div>
  )
}
