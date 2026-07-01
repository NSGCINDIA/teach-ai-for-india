'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, Loader2, UserPlus, X } from 'lucide-react'
import {
  assignVolunteers,
  unassignVolunteer,
  type AssignmentActionState,
} from '@/actions/assignments'
import { ASSIGNMENT_STATUS_META } from '@/lib/constants/status'
import type { AssignmentWithVolunteer } from '@/lib/data/assignments'
import type { TeamMember } from '@/lib/data/sessions'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'

interface Props {
  sessionId: string
  assignments: AssignmentWithVolunteer[]
  /** Assignable volunteers not already on this session. */
  candidates: TeamMember[]
  canAssign: boolean
}

export function AssignmentPanel({ sessionId, assignments, candidates, canAssign }: Props) {
  return (
    <div className="space-y-4">
      {assignments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No volunteers assigned yet.</p>
      ) : (
        <ul className="space-y-1.5 text-sm">
          {assignments.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2">
              <span className="truncate">{a.volunteer?.full_name ?? 'Volunteer'}</span>
              <span className="flex items-center gap-1.5">
                <StatusBadge
                  label={ASSIGNMENT_STATUS_META[a.status].label}
                  tone={ASSIGNMENT_STATUS_META[a.status].tone}
                />
                {canAssign && <RemoveButton sessionId={sessionId} assignmentId={a.id} />}
              </span>
            </li>
          ))}
        </ul>
      )}

      {assignments.some((a) => a.note) && (
        <ul className="space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
          {assignments
            .filter((a) => a.note)
            .map((a) => (
              <li key={a.id}>
                <strong>{a.volunteer?.full_name ?? 'Volunteer'}:</strong> “{a.note}”
              </li>
            ))}
        </ul>
      )}

      {canAssign && candidates.length > 0 && (
        <AssignForm sessionId={sessionId} candidates={candidates} />
      )}
    </div>
  )
}

function AssignForm({ sessionId, candidates }: { sessionId: string; candidates: TeamMember[] }) {
  const [state, action, pending] = useActionState<AssignmentActionState, FormData>(assignVolunteers, {})
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  return (
    <form action={action} className="space-y-3 border-t border-border pt-3">
      <input type="hidden" name="session_id" value={sessionId} />
      <input type="hidden" name="volunteer_ids" value={JSON.stringify(selected)} />

      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Assign volunteers</p>

      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}
      {state.ok && state.message && (
        <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{state.message}</p>
      )}

      <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
        {candidates.map((c) => (
          <label key={c.id} className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-muted">
            <input
              type="checkbox"
              checked={selected.includes(c.id)}
              onChange={() => toggle(c.id)}
              className="size-4 rounded border-input accent-brand"
            />
            <span className="truncate">{c.full_name}</span>
            <span className="ml-auto text-xs text-muted-foreground">{roleLabel(c.role)}</span>
          </label>
        ))}
      </div>

      <Button type="submit" size="sm" disabled={pending || selected.length === 0}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
        Assign {selected.length > 0 ? `(${selected.length})` : ''}
      </Button>
    </form>
  )
}

function RemoveButton({ sessionId, assignmentId }: { sessionId: string; assignmentId: string }) {
  const [, action, pending] = useActionState<AssignmentActionState, FormData>(unassignVolunteer, {})
  return (
    <form action={action}>
      <input type="hidden" name="session_id" value={sessionId} />
      <input type="hidden" name="assignment_id" value={assignmentId} />
      <button
        type="submit"
        disabled={pending}
        aria-label="Remove assignment"
        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-error disabled:opacity-50"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
      </button>
    </form>
  )
}

function roleLabel(role: string) {
  return role.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
