import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { roleHomePath } from '@/lib/auth/rbac'
import type { UserRole } from '@/types/database'

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
      let dest = next
      if (!dest || dest === '/dashboard') {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', authData.user.id)
          .single()
        dest = roleHomePath((profile?.role as UserRole) ?? 'volunteer')
      }
      const finalDest = dest.startsWith('/') ? dest : '/dashboard'
      return NextResponse.redirect(`${origin}${finalDest}`)
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
