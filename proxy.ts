import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Next 16 "proxy" convention (formerly middleware): runs before rendering to
// refresh the Supabase session and enforce route protection + role routing.
export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  // Run on everything except static assets and image optimization.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
