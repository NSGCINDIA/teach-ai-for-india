'use client'

import { useMemo, useState, useActionState } from 'react'
import { Loader2, Search, ShieldCheck } from 'lucide-react'
import type { AdminUser } from '@/lib/data/admin'
import type { UserRole, CampusRow } from '@/types/database'
import { ROLE_LABELS, INVITABLE_ROLES } from '@/lib/auth/roles'
import { formatDate } from '@/lib/format'
import { changeUserRole, setUserActive, type AdminActionState } from '@/actions/admin'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/states'

const SELECT_CLASS =
  'border-input h-9 rounded-md border bg-transparent px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30'

interface Props {
  users: AdminUser[]
  campuses: Pick<CampusRow, 'id' | 'name'>[]
  /** True only for super_admin — enables role/status mutation (PRD §7.2). */
  canManage: boolean
  currentUserId: string
}

export function UsersTable({ users, campuses, canManage, currentUserId }: Props) {
  const [q, setQ] = useState('')
  const [role, setRole] = useState<UserRole | ''>('')
  const [campus, setCampus] = useState('')

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return users.filter((u) => {
      if (role && u.role !== role) return false
      if (campus && u.campus_id !== campus) return false
      if (term && !`${u.full_name} ${u.email}`.toLowerCase().includes(term)) return false
      return true
    })
  }, [users, q, role, campus])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…" className="pl-9" aria-label="Search users" />
        </div>
        <select className={SELECT_CLASS} value={role} onChange={(e) => setRole(e.target.value as UserRole | '')} aria-label="Filter by role">
          <option value="">All roles</option>
          {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        {campuses.length > 0 && (
          <select className={SELECT_CLASS} value={campus} onChange={(e) => setCampus(e.target.value)} aria-label="Filter by campus">
            <option value="">All campuses</option>
            {campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No users found" description="Adjust the filters or invite a new team member." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Campus</th>
                <th className="p-3 font-medium">Last login</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <UserRowItem key={u.id} user={u} canManage={canManage} isSelf={u.id === currentUserId} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function UserRowItem({ user, canManage, isSelf }: { user: AdminUser; canManage: boolean; isSelf: boolean }) {
  const [roleState, roleAction, roleWorking] = useActionState<AdminActionState, FormData>(changeUserRole, {})
  const [activeState, activeAction, activeWorking] = useActionState<AdminActionState, FormData>(setUserActive, {})
  const editable = canManage && !isSelf
  const roleAssignable = (INVITABLE_ROLES as UserRole[]).includes(user.role)

  return (
    <tr className="border-b last:border-0 align-middle hover:bg-accent/40">
      <td className="p-3">
        <div className="font-medium">{user.full_name}</div>
        <div className="text-xs text-muted-foreground">{user.email}</div>
        {(roleState.error || activeState.error) && (
          <div role="alert" className="mt-1 text-xs text-error">{roleState.error || activeState.error}</div>
        )}
      </td>
      <td className="p-3">
        {editable && roleAssignable ? (
          <form action={roleAction} className="flex items-center gap-1.5">
            <input type="hidden" name="user_id" value={user.id} />
            <select
              name="role" defaultValue={user.role} className={SELECT_CLASS}
              onChange={(e) => e.currentTarget.form?.requestSubmit()} aria-label={`Role for ${user.full_name}`}
            >
              {(INVITABLE_ROLES as UserRole[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
            {roleWorking && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          </form>
        ) : (
          <span className="inline-flex items-center gap-1">
            {user.role === 'super_admin' && <ShieldCheck className="size-3.5 text-brand" aria-hidden />}
            {ROLE_LABELS[user.role]}
          </span>
        )}
      </td>
      <td className="p-3 text-muted-foreground">{user.campus?.name ?? '—'}</td>
      <td className="p-3 text-muted-foreground">{formatDate(user.last_login_at)}</td>
      <td className="p-3">
        {editable ? (
          <form action={activeAction}>
            <input type="hidden" name="user_id" value={user.id} />
            <input type="hidden" name="is_active" value={(!user.is_active).toString()} />
            <Button type="submit" size="sm" variant={user.is_active ? 'ghost' : 'outline'} disabled={activeWorking}
              className={user.is_active ? 'text-error' : 'text-success'}>
              {activeWorking && <Loader2 className="size-3.5 animate-spin" />}
              {user.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          </form>
        ) : (
          <span className={user.is_active ? 'text-success' : 'text-muted-foreground'}>
            {user.is_active ? 'Active' : 'Inactive'}
          </span>
        )}
      </td>
    </tr>
  )
}
