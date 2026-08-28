import { Users } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { can, isAdmin } from '@/lib/auth/rbac'
import { listAdminUsers, listPendingSignups, listVolunteerApplications } from '@/lib/data/admin'
import { listCampusOptions } from '@/lib/data/schools'
import { UsersTable } from '@/components/admin/users-table'
import { InviteForm } from '@/components/admin/invite-form'
import { SignupRequests } from '@/components/admin/signup-requests'
import { VolunteerApplications } from '@/components/admin/volunteer-applications'
import { PageHeader } from '@/components/dashboard/page-header'

export const metadata = { title: 'Volunteers · Admin' }

export default async function AdminVolunteersPage() {
  const user = await requireAccess('/admin/volunteers')
  const [users, campuses, signups, applications] = await Promise.all([
    listAdminUsers(),
    listCampusOptions(),
    isAdmin(user.role) ? listPendingSignups() : Promise.resolve([]),
    isAdmin(user.role) ? listVolunteerApplications() : Promise.resolve([]),
  ])
  const canManage = can(user.role, 'manage_user_roles') !== false

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Volunteers &amp; team"
        description={<>{users.length} member{users.length === 1 ? '' : 's'} across every campus. Invite, assign roles, and manage access.</>}
        actions={<InviteForm campuses={campuses} />}
      />

      <SignupRequests requests={signups} />
      <VolunteerApplications applications={applications} />

      {!canManage && (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          You can invite members, but only a super admin can change roles or account status.
        </p>
      )}

      <UsersTable users={users} campuses={campuses} canManage={canManage} currentUserId={user.id} canViewDetails={isAdmin(user.role)} />
    </div>
  )
}
