/**
 * Centralized Supabase public env. Supports both the new key naming
 * (`*_PUBLISHABLE_KEY`, `sb_publishable_…`) and the legacy `*_ANON_KEY` (JWT).
 * Both are safe to expose to the browser — RLS is the real guard.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/** True once the public Supabase env is configured (drives graceful degradation). */
export function hasSupabaseEnv(): boolean {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY
}
