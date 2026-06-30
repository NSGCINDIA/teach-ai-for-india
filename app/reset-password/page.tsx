import { AuthShell } from '@/components/auth/auth-shell'
import { SetPasswordForm } from '@/components/auth/set-password-form'

export const metadata = { title: 'Set a new password' }

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password for your account.">
      <SetPasswordForm cta="Update password" />
    </AuthShell>
  )
}
