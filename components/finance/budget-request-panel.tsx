'use client'

import { useActionState } from 'react'
import { AlertCircle } from 'lucide-react'
import {
  allocateCampusBudget,
  createBudgetIncreaseRequest,
  type BudgetRequestActionState,
} from '@/actions/budget-requests'
import { fieldValue } from '@/lib/actions/form-values'
import { formatCurrency, formatDate } from '@/lib/format'
import type { CampusBudgetAccess } from '@/lib/auth/rbac'
import type { BudgetIncreaseRequestRow } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/shared/status-badge'

interface BudgetRequestPanelProps {
  campusId: string
  period: string | null
  hasBudget: boolean
  requests: BudgetIncreaseRequestRow[]
  access: CampusBudgetAccess
}

export function BudgetRequestPanel({ campusId, period, hasBudget, requests, access }: BudgetRequestPanelProps) {
  const active = requests.find((r) => r.status === 'pending')
  const history = requests.filter((r) => r.id !== active?.id)

  return (
    <div className="space-y-3">
      {!hasBudget ? (
        access.canAllocate ? (
          <AllocateForm campusId={campusId} />
        ) : (
          <p className="rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
            No budget allocated for {period ?? 'this period'} — ask your Finance Lead to allocate one.
          </p>
        )
      ) : active ? (
        <div className="rounded-lg border border-border px-3 py-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">Increase requested: {formatCurrency(active.requested_amount)}</span>
            <StatusBadge kind="approval" status="pending" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{active.reason}</p>
          <p className="mt-1 text-xs text-muted-foreground">Awaiting Campus Lead review.</p>
        </div>
      ) : access.canRequestIncrease ? (
        <RequestIncreaseForm campusId={campusId} />
      ) : null}

      {history.length > 0 && (
        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Past requests</p>
          <ul className="space-y-2 text-sm">
            {history.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
                <span className="truncate">{formatCurrency(r.requested_amount)} — {formatDate(r.created_at)}</span>
                <StatusBadge kind="approval" status={r.status} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function AllocateForm({ campusId }: { campusId: string }) {
  const [state, action, pending] = useActionState<BudgetRequestActionState, FormData>(allocateCampusBudget, {})

  return (
    <form action={action} className="space-y-3 rounded-lg border border-border p-4" noValidate>
      <input type="hidden" name="campus_id" value={campusId} />
      <p className="text-sm font-medium">Allocate this period&rsquo;s budget</p>

      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="allocated_amount">Allocated amount</Label>
        <Input id="allocated_amount" type="number" min={0} step="0.01" name="allocated_amount" defaultValue={fieldValue(state, 'allocated_amount', '')} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="note">Notes (optional)</Label>
        <Textarea id="note" name="note" rows={2} defaultValue={fieldValue(state, 'note', '')} />
      </div>

      <Button type="submit" size="sm" disabled={pending}>Allocate budget</Button>
    </form>
  )
}

function RequestIncreaseForm({ campusId }: { campusId: string }) {
  const [state, action, pending] = useActionState<BudgetRequestActionState, FormData>(createBudgetIncreaseRequest, {})

  return (
    <form action={action} className="space-y-3 rounded-lg border border-border p-4" noValidate>
      <input type="hidden" name="campus_id" value={campusId} />
      <p className="text-sm font-medium">Request additional budget</p>

      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="requested_amount">Additional amount needed</Label>
        <Input id="requested_amount" type="number" min={0} step="0.01" name="requested_amount" defaultValue={fieldValue(state, 'requested_amount', '')} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reason">Reason</Label>
        <Textarea id="reason" name="reason" rows={2} defaultValue={fieldValue(state, 'reason', '')} placeholder="Why is more budget needed?" />
        <p className="text-xs text-muted-foreground">At least 10 characters.</p>
      </div>

      <Button type="submit" size="sm" disabled={pending}>Send to Campus Lead</Button>
    </form>
  )
}
