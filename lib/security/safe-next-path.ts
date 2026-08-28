/**
 * Only allow same-origin relative paths as a post-login redirect (issue #10).
 * Rejects protocol-relative (`//evil.com`), backslash tricks, and absolute URLs
 * so the `next` param can't be turned into an open redirect.
 *
 * Lives here rather than inside actions/auth.ts because two entry points accept
 * a `next` parameter — the login action and the auth callback route — and the
 * callback had grown its own weaker check (`startsWith('/')` alone). One
 * implementation means one place to get this right.
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith('/')) return null
  if (
    next.startsWith('//') ||
    next.startsWith('/\\') ||
    next.startsWith('/%2f') ||
    next.startsWith('/%5c')
  ) {
    return null
  }
  return next
}
