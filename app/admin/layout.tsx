import { Suspense } from 'react'
import { requireAccess } from '@/lib/auth/user'
import { adminNav } from '@/lib/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { PageSkeleton } from '@/components/dashboard/page-skeleton'

// The auth check (requireAccess) is a network round-trip; wrapping it in its
// own Suspense boundary here (rather than awaiting it directly in the layout)
// lets PageSkeleton show immediately instead of blocking on it — loading.tsx
// only wraps page.tsx, not this layout, so this is the only way the skeleton
// can cover that round-trip too.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AuthedShell>{children}</AuthedShell>
    </Suspense>
  )
}

async function AuthedShell({ children }: { children: React.ReactNode }) {
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
