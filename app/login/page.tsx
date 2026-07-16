import { LoginForm } from '@/components/auth/login-form'
import { Background3D } from '@/components/marketing/bg-3d'

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
    <div className="min-h-dvh flex items-center justify-center bg-background relative overflow-hidden px-4 py-12">
      <Background3D />
      <div className="w-full flex justify-center z-10 relative">
        <LoginForm next={sp.next || '/dashboard'} initialError={initialError} />
      </div>
    </div>
  )
}
