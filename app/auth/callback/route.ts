import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { roleHomePath } from '@/lib/auth/rbac'

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
      // roleHomePath takes no role, so the profile lookup that used to feed it
      // was a round-trip whose result was discarded.
      const dest = next && next !== '/dashboard' ? next : roleHomePath()
      const finalDest = dest.startsWith('/') ? dest : '/dashboard'
      return NextResponse.redirect(`${origin}${finalDest}`)
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
