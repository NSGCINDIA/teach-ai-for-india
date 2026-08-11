/**
 * True when a Supabase auth cookie is present in `document.cookie`.
 *
 * @supabase/ssr writes the session with `httpOnly: false` (see its
 * DEFAULT_COOKIE_OPTIONS) precisely so the browser client can read it back, and
 * it splits a large session across `sb-<ref>-auth-token.0`, `.1`, … — hence the
 * prefix match rather than an exact name.
 *
 * This is a cheap gate, NOT an authorisation check. It only decides whether it
 * is worth downloading ~240 KB of supabase-js to resolve a session at all: an
 * anonymous visitor, which is the overwhelming majority of marketing traffic,
 * skips the library entirely. Anyone actually holding a cookie still goes
 * through a real `auth.getUser()`, so nothing is trusted on the strength of a
 * cookie merely existing.
 *
 * Deliberately has no imports — pulling in anything from `@/lib/supabase` here
 * would defeat the entire point.
 */
export function hasAuthCookie(): boolean {
  if (typeof document === 'undefined') return false
  return /(?:^|;\s*)sb-[^=;]*-auth-token(?:\.\d+)?=/.test(document.cookie)
}
