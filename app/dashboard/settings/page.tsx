import { Settings } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { getCampusById } from '@/lib/data/admin'
import { EmptyState } from '@/components/shared/states'
import { CampusSettingsForm } from '@/components/dashboard/campus-settings-form'
import { PageHeader } from '@/components/dashboard/page-header'

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
      <PageHeader
        icon={Settings}
        title="Settings"
        description={<>Edit {campus.name}&rsquo;s public profile. Name, targets, and team assignment are managed by an admin.</>}
      />

      <CampusSettingsForm campus={campus} />
    </div>
  )
}
