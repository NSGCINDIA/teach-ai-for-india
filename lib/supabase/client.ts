'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

/** Browser Supabase client. Uses the anon key — every query is RLS-protected. */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
