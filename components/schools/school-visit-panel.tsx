'use client'

import { useActionState, useEffect, useState } from 'react'
import { AlertCircle, Loader2, Pencil, Send } from 'lucide-react'
import { logSchoolVisit, updateSchoolVisit, type SchoolVisitActionState } from '@/actions/school-visits'
import { fieldValue } from '@/lib/actions/form-values'
import { roleLabel } from '@/lib/auth/roles'
import { formatDateTime } from '@/lib/format'
import type { SchoolVisitRow, SchoolStatus } from '@/types/database'
import type { TeamMember } from '@/lib/data/sessions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface SchoolVisitPanelProps {
  schoolId: string
  schoolStatus: SchoolStatus
  visits: SchoolVisitRow[]
  roster: TeamMember[]
  canLog: boolean
}

export function SchoolVisitPanel({ schoolId, schoolStatus, visits, roster, canLog }: SchoolVisitPanelProps) {
  // A school gets exactly one visit record, ever — once it exists, this
  // becomes an edit surface instead of a second log form.
  const visit = visits[0]
  // Mirrors log_school_visit()'s own gate — logging is only legal while the
  // school hasn't moved past visit_completed, so the form must stop
  // reappearing once Registration (and beyond) has happened.
  const canLogNow = canLog && !visit && (schoolStatus === 'outreach_approved' || schoolStatus === 'visit_completed')

  return (
    <div className="space-y-5">
      {canLogNow ? (
        <VisitForm schoolId={schoolId} roster={roster} />
      ) : !visit ? (
        <p className="text-sm text-muted-foreground">
          {schoolStatus === 'lead_identified' || schoolStatus === 'outreach_requested'
            ? 'A visit can be logged once outreach is approved.'
            : 'No visit logged for this school.'}
        </p>
      ) : null}

      {visit && (
        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Visit log</p>
          <VisitRecord schoolId={schoolId} visit={visit} roster={roster} canEdit={canLog} />
        </div>
      )}
    </div>
  )
}

function VisitRecord({
  schoolId,
  visit,
  roster,
  canEdit,
}: {
  schoolId: string
  visit: SchoolVisitRow
  roster: TeamMember[]
  canEdit: boolean
}) {
  const [editing, setEditing] = useState(false)
  const rosterById = new Map(roster.map((m) => [m.id, m]))

  if (editing) {
    return <EditVisitForm schoolId={schoolId} visit={visit} roster={roster} onDone={() => setEditing(false)} />
  }

  const teamNames = visit.team_member_ids.map((id) => rosterById.get(id)?.full_name ?? 'Unknown').join(', ')
  return (
    <div className="rounded-lg border border-border px-3 py-2 text-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{formatDateTime(visit.visited_at)}</p>
        {canEdit && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)} className="h-auto gap-1 px-2 py-1 text-xs">
            <Pencil className="size-3" /> Edit
          </Button>
        )}
      </div>
      {teamNames && <p className="text-xs text-muted-foreground">With: {teamNames}</p>}
      {visit.notes && <p className="mt-1 text-xs text-muted-foreground">“{visit.notes}”</p>}
    </div>
  )
}

function VisitForm({ schoolId, roster }: { schoolId: string; roster: TeamMember[] }) {
  const [state, action, pending] = useActionState<SchoolVisitActionState, FormData>(logSchoolVisit, {})
  const [selected, setSelected] = useState<string[]>([])

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="school_id" value={schoolId} />
      <input type="hidden" name="team_member_ids" value={JSON.stringify(selected)} />
      <VisitFormFields state={state} roster={roster} selected={selected} onSelectedChange={setSelected} visitedAtDefault={fieldValue(state, 'visited_at', '')} />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Log visit
      </Button>
    </form>
  )
}

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function EditVisitForm({
  schoolId,
  visit,
  roster,
  onDone,
}: {
  schoolId: string
  visit: SchoolVisitRow
  roster: TeamMember[]
  onDone: () => void
}) {
  const [state, action, pending] = useActionState<SchoolVisitActionState, FormData>(updateSchoolVisit, {})
  const [selected, setSelected] = useState<string[]>(visit.team_member_ids)

  useEffect(() => {
    if (state.ok) onDone()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok])

  return (
    <form action={action} className="space-y-4 rounded-lg border border-border p-3" noValidate>
      <input type="hidden" name="school_id" value={schoolId} />
      <input type="hidden" name="visit_id" value={visit.id} />
      <input type="hidden" name="team_member_ids" value={JSON.stringify(selected)} />
      <VisitFormFields
        state={state}
        roster={roster}
        selected={selected}
        onSelectedChange={setSelected}
        visitedAtDefault={fieldValue(state, 'visited_at', toDatetimeLocalValue(visit.visited_at))}
        notesDefault={fieldValue(state, 'notes', visit.notes ?? '')}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Save changes
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function VisitFormFields({
  state,
  roster,
  selected,
  onSelectedChange,
  visitedAtDefault,
  notesDefault,
}: {
  state: SchoolVisitActionState
  roster: TeamMember[]
  selected: string[]
  onSelectedChange: (ids: string[]) => void
  visitedAtDefault: string
  notesDefault?: string
}) {
  const toggle = (id: string) =>
    onSelectedChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])

  return (
    <>
      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}
      {state.ok && state.message && (
        <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{state.message}</p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="visited_at">Visit date &amp; time</Label>
        <Input id="visited_at" type="datetime-local" name="visited_at" defaultValue={visitedAtDefault} />
      </div>

      {roster.length > 0 && (
        <div className="space-y-1.5">
          <Label>Team members who attended (optional)</Label>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
            {roster.map((m) => (
              <label key={m.id} className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-muted">
                <input
                  type="checkbox"
                  checked={selected.includes(m.id)}
                  onChange={() => toggle(m.id)}
                  className="size-4 rounded border-input accent-brand"
                />
                <span className="truncate">{m.full_name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{roleLabel(m.role)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={notesDefault ?? ''} placeholder="What happened, blockers, next steps…" />
      </div>
    </>
  )
}
