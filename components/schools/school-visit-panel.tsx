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

import { SCHOOL_STATUS_META } from '@/lib/constants/status'
import type { SchoolVisitListItem } from '@/lib/data/school-visits'

interface SchoolVisitPanelProps {
  schoolId: string
  schoolName: string
  schoolStatus: SchoolStatus
  sessionNumber: number | null
  visits: SchoolVisitListItem[]
  roster: TeamMember[]
  canLog: boolean
}

export function SchoolVisitPanel({
  schoolId,
  schoolName,
  schoolStatus,
  sessionNumber,
  visits,
  roster,
  canLog,
}: SchoolVisitPanelProps) {
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
          <VisitRecord
            schoolId={schoolId}
            schoolName={schoolName}
            schoolStatus={schoolStatus}
            sessionNumber={sessionNumber}
            visit={visit}
            roster={roster}
            canEdit={canLog}
          />
        </div>
      )}
    </div>
  )
}

function VisitRecord({
  schoolId,
  schoolName,
  schoolStatus,
  sessionNumber,
  visit,
  roster,
  canEdit,
}: {
  schoolId: string
  schoolName: string
  schoolStatus: SchoolStatus
  sessionNumber: number | null
  visit: SchoolVisitListItem
  roster: TeamMember[]
  canEdit: boolean
}) {
  const [editing, setEditing] = useState(false)
  const rosterById = new Map(roster.map((m) => [m.id, m]))

  if (editing) {
    return <EditVisitForm schoolId={schoolId} visit={visit} roster={roster} onDone={() => setEditing(false)} />
  }

  const teamNames = visit.team_member_ids.map((id) => rosterById.get(id)?.full_name ?? 'Unknown').join(', ')
  const creatorName = visit.creator?.full_name || visit.visited_by_user?.full_name || 'System'
  const formattedStatus = SCHOOL_STATUS_META[schoolStatus]?.label ?? schoolStatus

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-xs text-sm space-y-3">
      <div className="flex items-start justify-between gap-2 border-b border-border pb-2.5">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Visit details</p>
          <h4 className="font-semibold text-base text-foreground mt-0.5">{schoolName}</h4>
        </div>
        {canEdit && (
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)} className="h-8 gap-1.5 px-3 py-1.5 text-xs font-medium">
            <Pencil className="size-3.5" /> Edit visit
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
        <div className="space-y-0.5">
          <span className="text-muted-foreground font-medium block">Visit Date</span>
          <span className="font-semibold text-foreground">{formatDateTime(visit.visited_at)}</span>
        </div>

        <div className="space-y-0.5">
          <span className="text-muted-foreground font-medium block">Visit Status</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-0.5 font-semibold text-brand">
            {formattedStatus}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-muted-foreground font-medium block">Session Number</span>
          <span className="font-semibold text-foreground">
            {sessionNumber !== null ? `Session ${sessionNumber}` : 'N/A (Onboarding)'}
          </span>
        </div>

        <div className="space-y-0.5 sm:col-span-2">
          <span className="text-muted-foreground font-medium block">Volunteer Team</span>
          <span className="font-semibold text-foreground">{teamNames || 'No team members logged'}</span>
        </div>

        <div className="space-y-0.5">
          <span className="text-muted-foreground font-medium block">Created By</span>
          <span className="font-semibold text-foreground">{creatorName}</span>
        </div>

        <div className="space-y-0.5">
          <span className="text-muted-foreground font-medium block">Last Updated</span>
          <span className="font-semibold text-foreground">{formatDateTime(visit.created_at)}</span>
        </div>
      </div>

      {visit.notes && (
        <div className="rounded-lg bg-muted/40 p-3 border-l-2 border-brand/50 mt-2">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider mb-1">Notes</span>
          <p className="text-xs text-muted-foreground italic leading-relaxed">“{visit.notes}”</p>
        </div>
      )}
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
