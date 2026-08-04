'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react'
import {
  createOutreachVisitRequest,
  reviewOutreachVisitRequestCampus,
  reviewOutreachVisitRequestFinance,
  type OutreachVisitRequestActionState,
} from '@/actions/outreach-visit-requests'
import { fieldValue } from '@/lib/actions/form-values'
import { roleLabel } from '@/lib/auth/roles'
import type { OutreachVisitRequestAccess } from '@/lib/auth/rbac'
import { formatCurrency, formatDate } from '@/lib/format'
import {
  VISIT_PRIORITIES,
  EXPECTED_OUTCOME_OPTIONS,
  VISIT_TRANSPORTATION_OPTIONS,
} from '@/lib/validations/outreach-visit-requests'
import type { OutreachVisitRequestRow, CampusBudgetRow, ApprovalStatus, SchoolStatus } from '@/types/database'
import type { TeamMember } from '@/lib/data/sessions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/shared/status-badge'
import { cn } from '@/lib/utils'

interface VisitRequestPanelProps {
  schoolId: string
  schoolStatus: SchoolStatus
  requests: OutreachVisitRequestRow[]
  roster: TeamMember[]
  budget: CampusBudgetRow | null
  quarter: string | null
  access: OutreachVisitRequestAccess
}

export function VisitRequestPanel({ schoolId, schoolStatus, requests, roster, budget, quarter, access }: VisitRequestPanelProps) {
  const active = requests.find((r) => r.status === 'pending')
  const mostRecent = requests[0]
  const history = requests.filter((r) => r.id !== active?.id)
  const rosterById = new Map(roster.map((m) => [m.id, m]))
  const canFileNew = access.canCreate && (schoolStatus === 'lead_identified' || schoolStatus === 'outreach_requested')

  return (
    <div className="space-y-5">
      {active ? (
        <ActiveRequest
          schoolId={schoolId}
          request={active}
          rosterById={rosterById}
          budget={budget}
          quarter={quarter}
          access={access}
        />
      ) : canFileNew ? (
        <RequestForm schoolId={schoolId} roster={roster} />
      ) : mostRecent?.status === 'approved' ? (
        <p className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle2 className="size-4 shrink-0" /> Both approvals are in — the visit may proceed.
        </p>
      ) : mostRecent?.status === 'rejected' ? (
        <p className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="size-4 shrink-0" /> This visit request was rejected.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">No open visit request for this school.</p>
      )}

      {history.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Past requests</p>
          <ul className="space-y-2 text-sm">
            {history.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
                <span className="truncate text-muted-foreground">
                  {r.expected_outcomes?.length > 0 ? r.expected_outcomes.join(', ') : '—'}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  {r.priority && <PriorityBadge priority={r.priority} />}
                  <StatusBadge kind="approval" status={r.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function ActiveRequest({
  schoolId,
  request,
  rosterById,
  budget,
  quarter,
  access,
}: {
  schoolId: string
  request: OutreachVisitRequestRow
  rosterById: Map<string, TeamMember>
  budget: CampusBudgetRow | null
  quarter: string | null
  access: OutreachVisitRequestAccess
}) {
  const teamNames = request.team_member_ids.map((id) => rosterById.get(id)?.full_name ?? 'Unknown').join(', ')
  const available = budget ? budget.allocated_amount - budget.reserved_amount : null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        {request.priority && (
          <Field label="Priority">
            <PriorityBadge priority={request.priority} />
          </Field>
        )}
        {request.expected_outcomes?.length > 0 && (
          <Field label="Expected outcomes" full>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {request.expected_outcomes.map((o) => (
                <span key={o} className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium">
                  {o}
                </span>
              ))}
            </div>
          </Field>
        )}
        <Field label="Proposed visit date">{formatDate(request.proposed_visit_date)}</Field>
        <Field label="Estimated travel cost">{formatCurrency(request.estimated_travel_cost)}</Field>
        {request.transportation && (
          <Field label="Transportation">{request.transportation}</Field>
        )}
        <Field label="Outreach team" full>{teamNames || '—'}</Field>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <ReviewLeg
          label="Campus Lead review"
          decision={request.campus_lead_review}
          note={request.campus_lead_note}
        >
          {access.canReviewCampus && request.campus_lead_review === 'pending' && (
            <ReviewForm schoolId={schoolId} requestId={request.id} action={reviewOutreachVisitRequestCampus} />
          )}
        </ReviewLeg>

        <ReviewLeg
          label="Finance Lead review"
          decision={request.finance_lead_review}
          note={request.finance_lead_note}
        >
          {access.canReviewFinance && request.finance_lead_review === 'pending' && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {budget
                  ? `Available this ${quarter ?? 'quarter'}: ${formatCurrency(available ?? 0)} of ${formatCurrency(budget.allocated_amount)} allocated.`
                  : `No budget allocated for ${quarter ?? 'this campus'} yet — an admin must allocate one before this can be approved.`}
              </p>
              <ReviewForm schoolId={schoolId} requestId={request.id} action={reviewOutreachVisitRequestFinance} />
            </div>
          )}
        </ReviewLeg>
      </div>

      {request.status === 'approved' && (
        <p className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle2 className="size-4 shrink-0" /> Both approvals are in — the visit may proceed.
        </p>
      )}
      {request.status === 'rejected' && (
        <p className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="size-4 shrink-0" /> This visit request was rejected.
        </p>
      )}
    </div>
  )
}

function ReviewLeg({
  label,
  decision,
  note,
  children,
}: {
  label: string
  decision: ApprovalStatus
  note: string | null
  children?: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <StatusBadge kind="approval" status={decision} />
      </div>
      {note && <p className="text-xs text-muted-foreground">"{note}"</p>}
      {children}
    </div>
  )
}

function ReviewForm({
  schoolId,
  requestId,
  action,
}: {
  schoolId: string
  requestId: string
  action: (prev: OutreachVisitRequestActionState, formData: FormData) => Promise<OutreachVisitRequestActionState>
}) {
  const [state, formAction, pending] = useActionState<OutreachVisitRequestActionState, FormData>(action, {})
  const [decision, setDecision] = useState<'approved' | 'rejected' | ''>('')

  return (
    <form action={formAction} className="space-y-2" noValidate>
      <input type="hidden" name="school_id" value={schoolId} />
      <input type="hidden" name="request_id" value={requestId} />
      <input type="hidden" name="decision" value={decision} />

      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={decision === 'approved' ? 'default' : 'outline'}
          onClick={() => setDecision('approved')}
        >
          Approve
        </Button>
        <Button
          type="button"
          size="sm"
          variant={decision === 'rejected' ? 'default' : 'outline'}
          onClick={() => setDecision('rejected')}
        >
          Reject
        </Button>
      </div>

      {decision === 'rejected' && (
        <Textarea name="note" rows={2} required defaultValue={fieldValue(state, 'note', '')} placeholder="Reason for rejecting (required)" />
      )}

      <Button type="submit" size="sm" disabled={pending || !decision}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Submit review
      </Button>
    </form>
  )
}

function RequestForm({ schoolId, roster }: { schoolId: string; roster: TeamMember[] }) {
  const [state, action, pending] = useActionState<OutreachVisitRequestActionState, FormData>(
    createOutreachVisitRequest,
    {},
  )
  const [selected, setSelected] = useState<string[]>(() => roster.map((m) => m.id))
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([])
  const [priority, setPriority] = useState<string>('High')
  const [transportation, setTransportation] = useState<string>('')

  const toggleMember = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const toggleOutcome = (outcome: string) =>
    setSelectedOutcomes((s) => (s.includes(outcome) ? s.filter((x) => x !== outcome) : [...s, outcome]))

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="school_id" value={schoolId} />
      <input type="hidden" name="team_member_ids" value={JSON.stringify(selected)} />
      <input type="hidden" name="expected_outcomes" value={JSON.stringify(selectedOutcomes)} />

      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}
      {state.ok && state.message && (
        <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{state.message}</p>
      )}

      {/* ── Priority ── */}
      <div className="space-y-1.5">
        <Label>
          Priority <span className="text-error">*</span>
        </Label>
        <div className="flex gap-3">
          {VISIT_PRIORITIES.map((p) => (
            <label
              key={p}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                priority === p
                  ? 'border-ring bg-muted font-medium'
                  : 'border-border hover:bg-muted/50',
              )}
            >
              <input
                type="radio"
                name="priority"
                value={p}
                checked={priority === p}
                onChange={() => setPriority(p)}
                className="accent-brand"
              />
              {p}
            </label>
          ))}
        </div>
      </div>

      {/* ── Expected Outcomes ── */}
      <div className="space-y-1.5">
        <Label>
          Expected Outcomes <span className="text-error">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">Select all objectives for this visit.</p>
        <div className="grid grid-cols-2 gap-1.5">
          {EXPECTED_OUTCOME_OPTIONS.map((outcome) => (
            <label
              key={outcome}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                selectedOutcomes.includes(outcome)
                  ? 'border-ring bg-muted font-medium'
                  : 'border-border hover:bg-muted/50',
              )}
            >
              <input
                type="checkbox"
                checked={selectedOutcomes.includes(outcome)}
                onChange={() => toggleOutcome(outcome)}
                className="size-4 rounded border-input accent-brand"
              />
              {outcome}
            </label>
          ))}
        </div>
      </div>

      {/* ── Date + Cost ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="proposed_visit_date">Proposed visit date</Label>
          <Input id="proposed_visit_date" type="date" name="proposed_visit_date" defaultValue={fieldValue(state, 'proposed_visit_date', '')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="estimated_travel_cost">Estimated travel cost</Label>
          <Input id="estimated_travel_cost" type="number" min={0} step="0.01" name="estimated_travel_cost" defaultValue={fieldValue(state, 'estimated_travel_cost', '')} />
        </div>
      </div>

      {/* ── Transportation ── */}
      <div className="space-y-1.5">
        <Label>Transportation</Label>
        <div className="flex gap-3">
          {VISIT_TRANSPORTATION_OPTIONS.map((t) => (
            <label
              key={t}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                transportation === t
                  ? 'border-ring bg-muted font-medium'
                  : 'border-border hover:bg-muted/50',
              )}
            >
              <input
                type="radio"
                name="transportation"
                value={t}
                checked={transportation === t}
                onChange={() => setTransportation(t)}
                className="accent-brand"
              />
              {t}
            </label>
          ))}
          {transportation && (
            <button
              type="button"
              onClick={() => setTransportation('')}
              className="text-xs text-muted-foreground underline underline-offset-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Team members ── */}
      <div className="space-y-1.5">
        <Label>Outreach team members</Label>
        <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
          {roster.map((m) => (
            <label key={m.id} className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-muted">
              <input
                type="checkbox"
                checked={selected.includes(m.id)}
                onChange={() => toggleMember(m.id)}
                className="size-4 rounded border-input accent-brand"
              />
              <span className="truncate">{m.full_name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{roleLabel(m.role)}</span>
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" size="sm" disabled={pending || selected.length === 0}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Submit visit request
      </Button>
    </form>
  )
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{children}</dd>
    </div>
  )
}

const PRIORITY_STYLES: Record<string, string> = {
  High: 'bg-error/10 text-error border-error/30',
  Medium: 'bg-warning/10 text-warning border-warning/30',
  Low: 'bg-success/10 text-success border-success/30',
}

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium', PRIORITY_STYLES[priority] ?? 'bg-muted text-muted-foreground border-border')}>
      {priority}
    </span>
  )
}
