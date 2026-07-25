'use client'

import Link from 'next/link'
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
  /** True only for super_admin — only they get the volunteer detail drill-down. */
  canViewDetails: boolean
  scoped?: boolean
}

export function UsersTable({ users, campuses, canManage, currentUserId, canViewDetails, scoped = false }: Props) {
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

  const isViewingVolunteers = scoped || role === 'volunteer'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…" className="pl-9" aria-label="Search users" />
        </div>
        {!scoped && (
          <select className={SELECT_CLASS} value={role} onChange={(e) => setRole(e.target.value as UserRole | '')} aria-label="Filter by role">
            <option value="">All roles</option>
            {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        )}
        {!scoped && campuses.length > 0 && (
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
                {isViewingVolunteers ? (
                  <>
                    <th className="p-3 font-medium">Assigned School</th>
                    <th className="p-3 font-medium">Integration Status</th>
                  </>
                ) : (
                  <>
                    <th className="p-3 font-medium">Role</th>
                    <th className="p-3 font-medium">Campus</th>
                  </>
                )}
                <th className="p-3 font-medium">Last login</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <UserRowItem
                  key={u.id}
                  user={u}
                  canManage={canManage}
                  isSelf={u.id === currentUserId}
                  canViewDetails={canViewDetails}
                  isViewingVolunteers={isViewingVolunteers}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

interface AssignmentInfo {
  schoolName: string
  sessionTopic: string
  sessionDate: string
  statusText: string
}

function getVolunteerAssignmentInfo(assignments?: AdminUser['assignments']): AssignmentInfo | null {
  if (!assignments || assignments.length === 0) return null

  const validAssignments = assignments
    .filter((a) => a.session && a.status !== 'cancelled' && a.status !== 'declined')

  if (validAssignments.length === 0) return null

  const todayStr = new Date().toISOString().slice(0, 10)

  // 1. Find upcoming sessions (date >= todayStr, status is planned/in_progress)
  const upcoming = validAssignments
    .filter((a) => a.session && a.session.date >= todayStr && (a.session.status === 'planned' || a.session.status === 'in_progress'))
    .sort((a, b) => a.session!.date.localeCompare(b.session!.date))[0]

  if (upcoming?.session) {
    const s = upcoming.session
    return {
      schoolName: s.school?.name ?? '—',
      sessionTopic: s.topic,
      sessionDate: s.date,
      statusText: `Upcoming: ${s.topic}`,
    }
  }

  // 2. Find latest completed/reported sessions
  const past = validAssignments
    .filter((a) => a.session && (a.session.status === 'verified' || a.session.status === 'reported'))
    .sort((a, b) => b.session!.date.localeCompare(a.session!.date))[0]

  if (past?.session) {
    const s = past.session
    return {
      schoolName: s.school?.name ?? '—',
      sessionTopic: s.topic,
      sessionDate: s.date,
      statusText: `Latest: ${s.status === 'verified' ? 'Verified' : 'Reported'}`,
    }
  }

  // 3. Fallback to latest assignment
  const latest = [...validAssignments]
    .sort((a, b) => (b.session?.date ?? '').localeCompare(a.session?.date ?? ''))[0]

  if (latest?.session) {
    const s = latest.session
    return {
      schoolName: s.school?.name ?? '—',
      sessionTopic: s.topic,
      sessionDate: s.date,
      statusText: `Status: ${s.status}`,
    }
  }

  return null
}

function UserRowItem({
  user, canManage, isSelf, canViewDetails, isViewingVolunteers,
}: { user: AdminUser; canManage: boolean; isSelf: boolean; canViewDetails: boolean; isViewingVolunteers: boolean }) {
  const [roleState, roleAction, roleWorking] = useActionState<AdminActionState, FormData>(changeUserRole, {})
  const [activeState, activeAction, activeWorking] = useActionState<AdminActionState, FormData>(setUserActive, {})
  const editable = canManage && !isSelf
  const roleAssignable = (INVITABLE_ROLES as UserRole[]).includes(user.role)
  const assignmentInfo = isViewingVolunteers ? getVolunteerAssignmentInfo(user.assignments) : null

  return (
    <tr className="border-b last:border-0 align-middle hover:bg-accent/40">
      <td className="p-3">
        {canViewDetails ? (
          <Link href={`/dashboard/volunteers/${user.id}`} className="font-medium text-brand hover:underline">
            {user.full_name}
          </Link>
        ) : (
          <span className="font-medium">{user.full_name}</span>
        )}
        <div className="text-xs text-muted-foreground">{user.email}</div>
        {(roleState.error || activeState.error) && (
          <div role="alert" className="mt-1 text-xs text-error">{roleState.error || activeState.error}</div>
        )}
      </td>
      {isViewingVolunteers ? (
        <>
          <td className="p-3">
            {assignmentInfo ? (
              <span className="font-medium text-foreground block max-w-[200px] truncate" title={assignmentInfo.schoolName}>
                {assignmentInfo.schoolName}
              </span>
            ) : (
              <span className="text-muted-foreground italic text-xs">No School Assigned</span>
            )}
          </td>
          <td className="p-3">
            {assignmentInfo ? (
              <div className="flex flex-col">
                <span className="font-medium text-xs text-foreground">
                  {assignmentInfo.statusText}
                </span>
                <span className="text-muted-foreground text-[11px]">
                  {formatDate(assignmentInfo.sessionDate)}
                </span>
              </div>
            ) : (
              <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning-foreground dark:bg-warning/20">
                Awaiting Assignment
              </span>
            )}
          </td>
        </>
      ) : (
        <>
          <td className="p-3">
            {editable && roleAssignable ? (
              <form action={roleAction} className="flex items-center gap-1.5">
                <input type="hidden" name="user_id" value={user.id} />
                <select
                  key={`${user.role}:${roleState.error ?? ''}`}
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
          <td className="p-3 text-muted-foreground">
            {user.campus ? (
              user.campus.name
            ) : (
              <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive-foreground dark:bg-destructive/20">
                Unassigned
              </span>
            )}
          </td>
        </>
      )}
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
