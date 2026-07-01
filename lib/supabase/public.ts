import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/env'

/**
 * Cookieless ANON client for PUBLIC-site data (no user session).
 *
 * Because it never touches request cookies it has two important properties the
 * cookie-bound server client (lib/supabase/server.ts) does NOT:
 *   1. Pages using it stay statically renderable / ISR — reading cookies would
 *      force a static→dynamic switch (Next's app-static-to-dynamic-error).
 *   2. It never attempts an auth token refresh, so a stale/missing refresh
 *      cookie can't raise "Invalid Refresh Token" on public pages.
 *
 * Public tables/views are anon-readable via RLS, so no session is needed.
 */
export function createPublicClient() {
  return createClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
