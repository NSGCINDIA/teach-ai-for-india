import Link from 'next/link'
import { AuthShell } from '@/components/auth/auth-shell'
import { LoginForm } from '@/components/auth/login-form'

export const metadata = { title: 'Log in' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const sp = await searchParams
  const initialError =
    sp.error === 'account_inactive'
      ? 'Your account is inactive. Contact your admin.'
      : sp.error === 'auth'
        ? 'That sign-in link is invalid or has expired.'
        : undefined

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your campus dashboard."
      footer={
        <>
          Want to volunteer?{' '}
          <Link href="/join" className="font-medium text-brand hover:underline">
            Apply to join
          </Link>
        </>
      }
    >
      <LoginForm next={sp.next} initialError={initialError} />
    </AuthShell>
  )
}
