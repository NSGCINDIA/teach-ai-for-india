import Link from 'next/link'
import { AuthShell } from '@/components/auth/auth-shell'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata = { title: 'Forgot password' }

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>
}) {
  const sp = await searchParams
  // Shown when a stranger was bounced off /reset-password without a session (issue #17).
  const notice =
    sp.notice === 'recovery_required'
      ? 'Open the password reset link from your email to continue.'
      : undefined

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we’ll send you a secure reset link."
      footer={
        <Link href="/login" className="font-medium text-brand hover:underline">
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm notice={notice} />
    </AuthShell>
  )
}
