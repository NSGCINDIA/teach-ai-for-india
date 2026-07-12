'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { AlertCircle, Loader2 } from 'lucide-react'
import { createClaim, updateClaim, type FinanceActionState } from '@/actions/finance'
import { fieldValue } from '@/lib/actions/form-values'
import { TRAVEL_MODES, TRAVEL_MODE_META } from '@/lib/constants/finance'
import type { ReimbursementRow } from '@/types/database'
import type { ClaimableSession } from '@/lib/data/finance'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/shared/states'
import { Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

const SELECT_CLASS =
  'border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30'

interface Props {
  claim?: ReimbursementRow
  sessions: ClaimableSession[]
  cancelHref: string
}

export function ClaimForm({ claim, sessions, cancelHref }: Props) {
  const isEdit = Boolean(claim)
  const [state, action, pending] = useActionState<FinanceActionState, FormData>(
    isEdit ? updateClaim : createClaim,
    {},
  )

  // Edit always keeps the existing session even if it's now outside the window.
  const options = isEdit && claim?.session_id && !sessions.some((s) => s.id === claim.session_id)
    ? [{ id: claim.session_id, topic: 'Linked session', session_number: 0, date: claim.claim_date }, ...sessions]
    : sessions

  if (!isEdit && sessions.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No claimable sessions"
        description="You can claim travel for sessions you attended within the claim window. Mark your attendance on a recent session first."
        action={{ label: 'Back', href: cancelHref }}
      />
    )
  }

  return (
    <form action={action} className="space-y-6" noValidate>
      {isEdit && <input type="hidden" name="id" value={claim!.id} />}

      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}
      {state.ok && state.message && (
        <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{state.message}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Session" required className="sm:col-span-2">
          <select name="session_id" required className={SELECT_CLASS} defaultValue={fieldValue(state, 'session_id', claim?.session_id ?? '')}>
            <option value="">— Select session —</option>
            {options.map((s) => (
              <option key={s.id} value={s.id}>
                {s.session_number ? `#${s.session_number} · ` : ''}{s.topic} · {formatDate(s.date)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Amount (₹)" required>
          <Input type="number" name="amount" min={1} step="0.01" required defaultValue={fieldValue(state, 'amount', String(claim?.amount ?? ''))} placeholder="e.g. 120" />
        </Field>
        <Field label="Travel mode" required>
          <select name="travel_mode" required className={SELECT_CLASS} defaultValue={fieldValue(state, 'travel_mode', claim?.travel_mode ?? 'auto')}>
            {TRAVEL_MODES.map((m) => <option key={m} value={m}>{TRAVEL_MODE_META[m].label}</option>)}
          </select>
        </Field>
        <Field label="Date of travel" required>
          <Input type="date" name="claim_date" required defaultValue={fieldValue(state, 'claim_date', claim?.claim_date ?? '')} />
        </Field>
        <Field label="Reason / notes" className="sm:col-span-2">
          <Textarea name="reason" rows={2} defaultValue={fieldValue(state, 'reason', claim?.reason ?? '')} placeholder="Anything finance should know" />
        </Field>
      </div>

      <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
        Claims must be within the claim window of the session and are auto-flagged for review on
        unusual amounts, frequency, attendance, or unreported sessions.
      </p>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? 'Save draft' : 'Create draft'}
        </Button>
        <Button asChild variant="ghost"><Link href={cancelHref}>Cancel</Link></Button>
      </div>
    </form>
  )
}

function Field({ label, required, className, children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label>{label} {required && <span className="text-error">*</span>}</Label>
      {children}
    </div>
  )
}
