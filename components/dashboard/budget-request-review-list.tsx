'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { reviewBudgetIncreaseRequest, type BudgetRequestActionState } from '@/actions/budget-requests'
import { fieldValue } from '@/lib/actions/form-values'
import { formatCurrency } from '@/lib/format'
import type { BudgetRequestLite } from '@/lib/data/dashboard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function BudgetRequestReviewList({
  requests,
  canReview,
}: {
  requests: BudgetRequestLite[]
  canReview: boolean
}) {
  if (requests.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">No pending budget requests.</p>
  }
  return (
    <ul className="divide-y divide-border">
      {requests.map((r) => (
        <BudgetRequestRow key={r.id} request={r} canReview={canReview} />
      ))}
    </ul>
  )
}

function BudgetRequestRow({ request, canReview }: { request: BudgetRequestLite; canReview: boolean }) {
  const [state, formAction, pending] = useActionState<BudgetRequestActionState, FormData>(
    reviewBudgetIncreaseRequest,
    {},
  )
  const [decision, setDecision] = useState<'approved' | 'rejected' | ''>('')

  return (
    <li className="space-y-2 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {request.requester_name} · {formatCurrency(request.requested_amount)}
        </p>
        <p className="truncate text-xs text-muted-foreground">{request.period} — {request.reason}</p>
      </div>

      {canReview && (
        <form action={formAction} className="space-y-2" noValidate>
          <input type="hidden" name="request_id" value={request.id} />
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
      )}
    </li>
  )
}
