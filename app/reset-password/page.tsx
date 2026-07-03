import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthShell } from '@/components/auth/auth-shell'
import { SetPasswordForm } from '@/components/auth/set-password-form'

export const metadata = { title: 'Set a new password' }

/**
 * Reached only through the emailed recovery link: /auth/callback exchanges the
 * code for a session, then redirects here. We require a valid Supabase session
 * before rendering the form — a direct visit with no session is bounced to
 * /forgot-password with a nudge to use the emailed link, instead of showing a
 * form that can only fail on submit (issue #17). `updatePassword`'s own
 * getUser() gate stays as defense in depth.
 *
 * Decision (issue #17 nuance): any authenticated session is accepted, not only
 * a fresh recovery session. A normally logged-in user visiting /reset-password
 * to change their own password is a legitimate action — `updatePassword` only
 * ever updates the current user — so we don't restrict this to recovery-only.
 */
export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/forgot-password?notice=recovery_required')

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password for your account.">
      <SetPasswordForm cta="Update password" />
    </AuthShell>
  )
}
