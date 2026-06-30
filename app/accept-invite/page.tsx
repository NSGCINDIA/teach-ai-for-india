import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/auth/auth-shell'
import { SetPasswordForm } from '@/components/auth/set-password-form'
import { getSessionUser } from '@/lib/auth/user'
import { roleLabel } from '@/lib/auth/roles'

export const metadata = { title: 'Accept your invite' }

/**
 * Landed here after clicking a Supabase invite link (→ /auth/callback exchanges
 * the code, then redirects here with a live session). The user sets a password.
 */
export default async function AcceptInvitePage() {
  const profile = await getSessionUser()
  if (!profile) redirect('/login?error=auth')

  return (
    <AuthShell
      title="Welcome to the movement"
      subtitle={`You’re joining as a ${roleLabel(profile.role)}. Set a password to finish setting up your account.`}
    >
      <SetPasswordForm cta="Set password & continue" />
    </AuthShell>
  )
}
