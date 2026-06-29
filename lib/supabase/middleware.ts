import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'
import type { UserRole } from '@/types/database'
import { roleHomePath, canAccessPath } from '@/lib/auth/rbac'

/**
 * Refreshes the Supabase session cookie on every request and enforces
 * route protection + role-based routing (PRD §7.2, US-AUTH-02).
 *
 * Returns a NextResponse that MUST be returned from middleware so the
 * refreshed auth cookies propagate to the browser.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  // Before Supabase is configured, the app must still serve the public site.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: getUser() (not getSession()) revalidates the JWT with the server.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isProtected = path.startsWith('/dashboard') || path.startsWith('/admin')

  // Unauthenticated → bounce protected routes to login (preserve intended dest).
  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  if (user) {
    // Fetch role for role-aware routing (cheap, indexed lookup).
    const { data: profile } = await supabase
      .from('users')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    const role = profile?.role as UserRole | undefined

    // Deactivated accounts (PRD §19.2 handover) are signed out.
    if (profile && profile.is_active === false) {
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'account_inactive')
      return NextResponse.redirect(url)
    }

    // Logged-in users hitting /login go to their role home.
    if (path === '/login' && role) {
      const url = request.nextUrl.clone()
      url.pathname = roleHomePath(role)
      return NextResponse.redirect(url)
    }

    // Role-based access control: deny unauthorized sections → 403 (not empty page).
    if (isProtected && role && !canAccessPath(role, path)) {
      const url = request.nextUrl.clone()
      url.pathname = '/403'
      return NextResponse.rewrite(url)
    }
  }

  return response
}
