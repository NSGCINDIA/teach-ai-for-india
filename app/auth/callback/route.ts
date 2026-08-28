import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { roleHomePath } from '@/lib/auth/rbac'
import { safeNextPath } from '@/lib/security/safe-next-path'

/**
 * Auth callback — exchanges the code from Supabase email links (invite,
 * password recovery, magic link) for a session, then redirects to `next`.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && authData?.user) {
      // Validated with the same helper the login action uses. The check here
      // was previously `startsWith('/')` alone, which accepts `//evil.com` and
      // the encoded backslash variants that safeNextPath rejects.
      //
      // roleHomePath takes no role, so the profile lookup that used to feed it
      // was a round-trip whose result was discarded.
      const safeNext = safeNextPath(next)
      const dest = safeNext && safeNext !== '/dashboard' ? safeNext : roleHomePath()
      return NextResponse.redirect(`${origin}${dest}`)
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
