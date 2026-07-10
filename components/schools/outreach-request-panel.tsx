'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react'
import {
  createOutreachRequest,
  reviewOutreachRequest,
  type OutreachRequestActionState,
} from '@/actions/outreach-requests'
import type { OutreachRequestAccess } from '@/lib/auth/rbac'
import type { OutreachRequestRow, SchoolStatus } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/shared/status-badge'

interface OutreachRequestPanelProps {
  schoolId: string
  schoolStatus: SchoolStatus
  requests: OutreachRequestRow[]
  access: OutreachRequestAccess
}

export function OutreachRequestPanel({ schoolId, schoolStatus, requests, access }: OutreachRequestPanelProps) {
  const active = requests.find((r) => r.status === 'pending')
  const mostRecent = requests[0]
  const history = requests.filter((r) => r.id !== active?.id)
  // Mirrors create_outreach_request()'s own gate (0038) — filing a NEW request
  // is only legal while the school hasn't moved past outreach_requested, so a
  // previously approved request must not keep re-offering this form once the
  // school has advanced to outreach_approved/visit_completed/registered/etc.
  const canFileNew = access.canCreate && (schoolStatus === 'lead_identified' || schoolStatus === 'outreach_requested')

  return (
    <div className="space-y-5">
      {active ? (
        <ActiveRequest schoolId={schoolId} request={active} access={access} />
      ) : canFileNew ? (
        <RequestForm schoolId={schoolId} />
      ) : mostRecent?.status === 'approved' ? (
        <p className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle2 className="size-4 shrink-0" /> Outreach approved — proceed to School Visit below.
        </p>
      ) : mostRecent?.status === 'rejected' ? (
        <p className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="size-4 shrink-0" /> This outreach request was rejected.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">No open outreach request for this school.</p>
      )}

      {history.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Past requests</p>
          <ul className="space-y-2 text-sm">
            {history.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
                <span className="truncate">{r.reason}</span>
                <StatusBadge kind="approval" status={r.status} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/** `request` is always the 'pending' one — the caller only renders this while a review is outstanding. */
function ActiveRequest({
  schoolId,
  request,
  access,
}: {
  schoolId: string
  request: OutreachRequestRow
  access: OutreachRequestAccess
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Field label="Reason" full>{request.reason}</Field>
        {request.proposed_approach && <Field label="Proposed approach" full>{request.proposed_approach}</Field>}
      </div>

      <div className="space-y-1.5 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Campus Lead review</span>
          <StatusBadge kind="approval" status={request.status} />
        </div>
        {access.canReview && <ReviewForm schoolId={schoolId} requestId={request.id} />}
      </div>
    </div>
  )
}

function ReviewForm({ schoolId, requestId }: { schoolId: string; requestId: string }) {
  const [state, formAction, pending] = useActionState<OutreachRequestActionState, FormData>(
    reviewOutreachRequest,
    {},
  )
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
        <Textarea name="note" rows={2} required placeholder="Reason for rejecting (required)" />
      )}

      <Button type="submit" size="sm" disabled={pending || !decision}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Submit review
      </Button>
    </form>
  )
}

function RequestForm({ schoolId }: { schoolId: string }) {
  const [state, action, pending] = useActionState<OutreachRequestActionState, FormData>(
    createOutreachRequest,
    {},
  )

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="school_id" value={schoolId} />

      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}
      {state.ok && state.message && (
        <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{state.message}</p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="reason">Why pursue this school?</Label>
        <Textarea id="reason" name="reason" rows={2} placeholder="Reason to pursue this lead" />
        <p className="text-xs text-muted-foreground">At least 10 characters.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="proposed_approach">Proposed approach (optional)</Label>
        <Textarea id="proposed_approach" name="proposed_approach" rows={2} placeholder="First-contact strategy, timing, etc." />
      </div>

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Submit outreach request
      </Button>
    </form>
  )
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{children}</dd>
    </div>
  )
}
