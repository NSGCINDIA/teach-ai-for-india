import { requireUser } from '@/lib/auth/user'
import { dashboardNav } from '@/lib/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser('/dashboard')
  return (
    <DashboardShell
      panelLabel="Dashboard"
      items={dashboardNav(user.role)}
      user={{ full_name: user.full_name, email: user.email, role: user.role, avatar_url: user.avatar_url }}
    >
      {children}
    </DashboardShell>
  )
}
