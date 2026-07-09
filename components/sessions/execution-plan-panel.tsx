'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react'
import {
  createExecutionPlan,
  reviewExecutionPlanCampus,
  reviewExecutionPlanFinance,
  type ExecutionPlanActionState,
} from '@/actions/execution-plans'
import type { ExecutionPlanAccess } from '@/lib/auth/rbac'
import { formatCurrency } from '@/lib/format'
import type { ExecutionPlanRow, CampusBudgetRow, ApprovalStatus } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/shared/status-badge'

const EQUIPMENT_ITEMS = [
  { name: 'has_laptop', label: 'Laptop' },
  { name: 'has_projector', label: 'Projector' },
  { name: 'has_hdmi_cable', label: 'HDMI cable' },
  { name: 'has_extension_board', label: 'Extension board' },
  { name: 'has_speaker', label: 'Speaker' },
  { name: 'has_internet_device', label: 'Internet device' },
] as const

interface ExecutionPlanPanelProps {
  sessionId: string
  plans: ExecutionPlanRow[]
  budget: CampusBudgetRow | null
  quarter: string | null
  access: ExecutionPlanAccess
}

export function ExecutionPlanPanel({ sessionId, plans, budget, quarter, access }: ExecutionPlanPanelProps) {
  // 'approved' stays the active plan here (unlike visit requests) — it's the
  // state that governs whether the session may start, not just history.
  const active = plans.find((p) => p.status === 'pending' || p.status === 'approved')
  const history = plans.filter((p) => p.id !== active?.id)

  return (
    <div className="space-y-5">
      {active ? (
        <ActivePlan sessionId={sessionId} plan={active} budget={budget} quarter={quarter} access={access} />
      ) : access.canSubmit ? (
        <PlanForm sessionId={sessionId} />
      ) : (
        <p className="text-sm text-muted-foreground">No execution plan submitted yet for this session.</p>
      )}

      {history.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Past plans</p>
          <ul className="space-y-2 text-sm">
            {history.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
                <span className="truncate">{p.logistics_notes}</span>
                <StatusBadge kind="approval" status={p.status} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function ActivePlan({
  sessionId,
  plan,
  budget,
  quarter,
  access,
}: {
  sessionId: string
  plan: ExecutionPlanRow
  budget: CampusBudgetRow | null
  quarter: string | null
  access: ExecutionPlanAccess
}) {
  const available = budget ? budget.allocated_amount - budget.reserved_amount : null
  const campusApproved = plan.campus_lead_review === 'approved'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Field label="Logistics" full>{plan.logistics_notes}</Field>
        <Field label="Estimated transport cost">{formatCurrency(plan.estimated_transport_cost)}</Field>
        <Field label="Session readiness">{plan.session_ready ? 'Confirmed ready' : 'Not confirmed'}</Field>
        {plan.teaching_resources && <Field label="Teaching resources" full>{plan.teaching_resources}</Field>}
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Equipment checklist</p>
        <ul className="grid grid-cols-2 gap-1.5 text-sm">
          {EQUIPMENT_ITEMS.map((item) => (
            <li key={item.name} className="flex items-center gap-2">
              <CheckCircle2 className={`size-4 shrink-0 ${plan[item.name as keyof ExecutionPlanRow] ? 'text-success' : 'text-muted-foreground opacity-30'}`} />
              {item.label}
            </li>
          ))}
        </ul>
        {plan.other_equipment && <p className="text-xs text-muted-foreground">Other: {plan.other_equipment}</p>}
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <ReviewLeg label="Campus Lead review" decision={plan.campus_lead_review} note={plan.campus_lead_note}>
          {access.canReviewCampus && plan.campus_lead_review === 'pending' && (
            <ReviewForm sessionId={sessionId} planId={plan.id} action={reviewExecutionPlanCampus} />
          )}
        </ReviewLeg>

        <ReviewLeg label="Finance Lead review" decision={plan.finance_lead_review} note={plan.finance_lead_note}>
          {!campusApproved ? (
            <p className="text-xs text-muted-foreground">Waiting for Campus Lead approval before Finance Lead can review.</p>
          ) : (
            access.canReviewFinance && plan.finance_lead_review === 'pending' && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {budget
                    ? `Available this ${quarter ?? 'quarter'}: ${formatCurrency(available ?? 0)} of ${formatCurrency(budget.allocated_amount)} allocated.`
                    : `No budget allocated for ${quarter ?? 'this campus'} yet — an admin must allocate one before this can be approved.`}
                </p>
                <ReviewForm sessionId={sessionId} planId={plan.id} action={reviewExecutionPlanFinance} />
              </div>
            )
          )}
        </ReviewLeg>
      </div>

      {plan.status === 'approved' && (
        <p className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle2 className="size-4 shrink-0" /> Execution plan approved — the session may now move to In Progress.
        </p>
      )}
      {plan.status === 'rejected' && (
        <p className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="size-4 shrink-0" /> This execution plan was rejected.
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
      {note && <p className="text-xs text-muted-foreground">“{note}”</p>}
      {children}
    </div>
  )
}

function ReviewForm({
  sessionId,
  planId,
  action,
}: {
  sessionId: string
  planId: string
  action: (prev: ExecutionPlanActionState, formData: FormData) => Promise<ExecutionPlanActionState>
}) {
  const [state, formAction, pending] = useActionState<ExecutionPlanActionState, FormData>(action, {})
  const [decision, setDecision] = useState<'approved' | 'rejected' | ''>('')

  return (
    <form action={formAction} className="space-y-2" noValidate>
      <input type="hidden" name="session_id" value={sessionId} />
      <input type="hidden" name="plan_id" value={planId} />
      <input type="hidden" name="decision" value={decision} />

      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="button" size="sm" variant={decision === 'approved' ? 'default' : 'outline'} onClick={() => setDecision('approved')}>
          Approve
        </Button>
        <Button type="button" size="sm" variant={decision === 'rejected' ? 'default' : 'outline'} onClick={() => setDecision('rejected')}>
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

function PlanForm({ sessionId }: { sessionId: string }) {
  const [state, action, pending] = useActionState<ExecutionPlanActionState, FormData>(createExecutionPlan, {})
  const [ready, setReady] = useState(false)

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="session_id" value={sessionId} />

      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}
      {state.ok && state.message && (
        <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{state.message}</p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="logistics_notes">Logistics</Label>
        <Textarea id="logistics_notes" name="logistics_notes" rows={2} placeholder="Departure, route, on-site coordination…" />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Equipment checklist</legend>
        <div className="grid grid-cols-2 gap-2">
          {EQUIPMENT_ITEMS.map((item) => (
            <Check key={item.name} name={item.name} label={item.label} />
          ))}
        </div>
        <Input name="other_equipment" placeholder="Other equipment (optional)" />
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="teaching_resources">Teaching resources</Label>
        <Textarea id="teaching_resources" name="teaching_resources" rows={2} placeholder="Slides, worksheets, activity kits…" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="estimated_transport_cost">Estimated transport cost</Label>
        <Input id="estimated_transport_cost" type="number" min={0} step="0.01" name="estimated_transport_cost" defaultValue={0} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="session_ready"
          checked={ready}
          onChange={(e) => setReady(e.target.checked)}
          className="size-4 rounded border-input accent-brand"
        />
        I confirm the team and materials are ready
      </label>

      <Button type="submit" size="sm" disabled={pending || !ready}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Submit execution plan
      </Button>
    </form>
  )
}

function Check({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} className="size-4 rounded border-input accent-brand" />
      {label}
    </label>
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
