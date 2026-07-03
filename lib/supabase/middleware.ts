import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'
import type { UserRole } from '@/types/database'
import { roleHomePath, canAccessPath } from '@/lib/auth/rbac'
import { SUPABASE_URL, SUPABASE_ANON_KEY, hasSupabaseEnv } from '@/lib/supabase/env'
import { rateLimit, clientIp } from '@/lib/security/rate-limit'

// Unauthenticated endpoints that warrant a tighter cap (issue #10).
const AUTH_PATHS = ['/login', '/admin-login', '/signup', '/forgot-password', '/reset-password']

function tooManyRequests(retryAfterSec: number): NextResponse {
  return new NextResponse('Too many requests. Please slow down and try again shortly.', {
    status: 429,
    headers: { 'Retry-After': String(retryAfterSec), 'Content-Type': 'text/plain' },
  })
}

/**
 * Per-IP request throttling applied ahead of rendering (issue #10). Mutating
 * requests (server actions / API routes POST to their route) get a broad cap;
 * unauthenticated auth endpoints get a tight one to slow credential stuffing
 * and signup spam. Best-effort in-process limiter — see lib/security/rate-limit.
 */
function enforceRateLimit(request: NextRequest): NextResponse | null {
  const ip = clientIp(request.headers)
  const path = request.nextUrl.pathname
  const isAuthPath = AUTH_PATHS.some((p) => path === p || path.startsWith(`${p}/`))

  if (isAuthPath && request.method === 'POST') {
    const v = rateLimit(`auth:${ip}`, 10, 60_000)
    if (!v.allowed) return tooManyRequests(v.retryAfterSec)
  }
  if (request.method === 'POST') {
    const v = rateLimit(`post:${ip}`, 60, 60_000)
    if (!v.allowed) return tooManyRequests(v.retryAfterSec)
  }
  return null
}

/**
 * Refreshes the Supabase session cookie on every request and enforces
 * route protection + role-based routing (PRD §7.2, US-AUTH-02).
 *
 * Returns a NextResponse that MUST be returned from middleware so the
 * refreshed auth cookies propagate to the browser.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  // Throttle abusive request rates before doing any work (issue #10).
  const limited = enforceRateLimit(request)
  if (limited) return limited

  // Before Supabase is configured, the app must still serve the public site.
  if (!hasSupabaseEnv()) {
    return response
  }

  const supabase = createServerClient<Database>(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
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
