'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, Loader2, Send } from 'lucide-react'
import { logSchoolVisit, type SchoolVisitActionState } from '@/actions/school-visits'
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
  const rosterById = new Map(roster.map((m) => [m.id, m]))
  // Mirrors log_school_visit()'s own gate — logging is only legal while the
  // school hasn't moved past visit_completed, so the form must stop
  // reappearing once Registration (and beyond) has happened.
  const canLogNow = canLog && (schoolStatus === 'outreach_approved' || schoolStatus === 'visit_completed')

  return (
    <div className="space-y-5">
      {canLogNow ? (
        <VisitForm schoolId={schoolId} roster={roster} />
      ) : visits.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {schoolStatus === 'lead_identified' || schoolStatus === 'outreach_requested'
            ? 'A visit can be logged once outreach is approved.'
            : 'No visit logged for this school.'}
        </p>
      ) : null}

      {visits.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Visit log</p>
          <ul className="space-y-2 text-sm">
            {visits.map((v) => {
              const teamNames = v.team_member_ids.map((id) => rosterById.get(id)?.full_name ?? 'Unknown').join(', ')
              return (
                <li key={v.id} className="rounded-lg border border-border px-3 py-2">
                  <p className="font-medium">{formatDateTime(v.visited_at)}</p>
                  {teamNames && <p className="text-xs text-muted-foreground">With: {teamNames}</p>}
                  {v.notes && <p className="mt-1 text-xs text-muted-foreground">“{v.notes}”</p>}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

function VisitForm({ schoolId, roster }: { schoolId: string; roster: TeamMember[] }) {
  const [state, action, pending] = useActionState<SchoolVisitActionState, FormData>(logSchoolVisit, {})
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="school_id" value={schoolId} />
      <input type="hidden" name="team_member_ids" value={JSON.stringify(selected)} />

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
        <Input id="visited_at" type="datetime-local" name="visited_at" />
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
        <Textarea id="notes" name="notes" rows={3} placeholder="What happened, blockers, next steps…" />
      </div>

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Log visit
      </Button>
    </form>
  )
}
