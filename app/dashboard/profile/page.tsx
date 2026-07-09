import { requireAccess } from '@/lib/auth/user'
import { roleLabel } from '@/lib/auth/roles'
import { getCampusById } from '@/lib/data/admin'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProfileForm } from '@/components/dashboard/profile-form'

export const metadata = { title: 'Profile' }

export default async function DashboardProfilePage() {
  const user = await requireAccess('/dashboard/profile')
  const campus = user.campus_id ? await getCampusById(user.campus_id) : null

  return (
    <div className="max-w-xl space-y-6">
      <header className="flex items-center gap-4">
        <Avatar className="size-14">
          <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name} />
          <AvatarFallback className="text-lg">{user.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{user.full_name}</h1>
          <p className="mt-0.5 text-muted-foreground">
            {roleLabel(user.role)}{campus ? ` · ${campus.name}` : ''}
          </p>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border p-4 text-sm">
        <div><dt className="text-xs text-muted-foreground">Email</dt><dd className="font-medium">{user.email}</dd></div>
        {user.niat_id && (
          <div><dt className="text-xs text-muted-foreground">NIAT ID</dt><dd className="font-medium">{user.niat_id}</dd></div>
        )}
        {user.role === 'volunteer' && (
          <>
            <div><dt className="text-xs text-muted-foreground">Full name</dt><dd className="font-medium">{user.full_name}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Phone</dt><dd className="font-medium">{user.phone ?? '—'}</dd></div>
          </>
        )}
      </dl>

      {user.role === 'volunteer' ? (
        <p className="text-sm text-muted-foreground">
          Your details are managed by your campus lead. Contact them if anything needs to change.
        </p>
      ) : (
        <ProfileForm user={user} />
      )}
    </div>
  )
}
