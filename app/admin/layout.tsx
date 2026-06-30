import { requireAccess } from '@/lib/auth/user'
import { adminNav } from '@/lib/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAccess('/admin')
  return (
    <DashboardShell
      panelLabel="Admin"
      items={adminNav(user.role)}
      user={{ full_name: user.full_name, email: user.email, role: user.role, avatar_url: user.avatar_url }}
    >
      {children}
    </DashboardShell>
  )
}
