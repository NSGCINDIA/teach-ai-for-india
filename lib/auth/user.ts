import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRow, UserRole } from '@/types/database'
import { canAccessPath } from '@/lib/auth/rbac'

/** Returns the current user's profile row, or null if not signed in. */
export async function getSessionUser(): Promise<UserRow | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (profile as UserRow) ?? null
}

/** Use in server components/actions that require auth. Redirects to /login otherwise. */
export async function requireUser(nextPath?: string): Promise<UserRow> {
  const profile = await getSessionUser()
  if (!profile) {
    redirect(`/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ''}`)
  }
  return profile
}

/** Require that the user's role may access `path`; otherwise show 403. */
export async function requireAccess(path: string): Promise<UserRow> {
  const profile = await requireUser(path)
  if (!canAccessPath(profile.role, path)) {
    redirect('/403')
  }
  return profile
}

export function hasRole(profile: UserRow | null, ...roles: UserRole[]): boolean {
  return !!profile && roles.includes(profile.role)
}
