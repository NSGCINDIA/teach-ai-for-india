import { requireAccess } from '@/lib/auth/user'
import { getCampusById } from '@/lib/data/admin'
import { EmptyState } from '@/components/shared/states'
import { CampusSettingsForm } from '@/components/dashboard/campus-settings-form'

export const metadata = { title: 'Settings' }

export default async function DashboardSettingsPage() {
  const user = await requireAccess('/dashboard/settings')

  if (!user.campus_id) {
    return <EmptyState title="No campus assigned" description="Campus settings need a campus to edit." />
  }

  const campus = await getCampusById(user.campus_id)
  if (!campus) {
    return <EmptyState title="Campus not found" description="Your assigned campus could not be loaded." />
  }

  return (
    <div className="max-w-xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Edit {campus.name}&rsquo;s public profile. Name, targets, and team assignment are managed by an admin.
        </p>
      </header>

      <CampusSettingsForm campus={campus} />
    </div>
  )
}
