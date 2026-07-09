'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, UserPlus } from 'lucide-react'
import { inviteUser, type ActionState } from '@/actions/auth'
import type { UserRole, CampusRow } from '@/types/database'
import { ROLE_LABELS, ROLE_DESCRIPTIONS, INVITABLE_ROLES } from '@/lib/auth/roles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

const SELECT_CLASS =
  'border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30'

/** Invite a new team member (PRD §7.2 / US-AUTH-01). Admin-only. */
export function InviteForm({ campuses }: { campuses: Pick<CampusRow, 'id' | 'name'>[] }) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState<ActionState, FormData>(inviteUser, {})
  const [role, setRole] = useState<UserRole>('volunteer')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5"><UserPlus className="size-4" /> Invite member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>They’ll get a secure link to set a password and join.</DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4">
          {state.error && (
            <p role="alert" className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
              <AlertCircle className="size-4 shrink-0" /> {state.error}
            </p>
          )}
          {state.ok && (
            <p className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
              <CheckCircle2 className="size-4 shrink-0" /> {state.message}
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" name="full_name" required placeholder="Priya Sharma" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="priya@university.edu" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <select id="role" name="role" className={SELECT_CLASS} value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              {(INVITABLE_ROLES as UserRole[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
            <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="campus_id">Campus</Label>
            <select id="campus_id" name="campus_id" className={SELECT_CLASS} required defaultValue="">
              <option value="">Select a campus…</option>
              {campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />} Send invite
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
