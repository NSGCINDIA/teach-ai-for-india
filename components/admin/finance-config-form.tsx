'use client'

import { useActionState } from 'react'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { saveFinanceConfig, type AdminActionState } from '@/actions/admin'
import { fieldValue } from '@/lib/actions/form-values'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/** Edit the reimbursement claim window (PRD §7.6 — reimbursement_window_days). */
export function FinanceConfigForm({ claimWindowDays }: { claimWindowDays: number }) {
  const [state, action, pending] = useActionState<AdminActionState, FormData>(saveFinanceConfig, {})

  return (
    <form action={action} className="space-y-3">
      {state.error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="size-4 shrink-0" /> {state.error}
        </p>
      )}
      {state.ok && (
        <p className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle2 className="size-4 shrink-0" /> {state.message}
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="claim_window_days">Reimbursement claim window (days)</Label>
        <div className="flex items-center gap-2">
          <Input id="claim_window_days" name="claim_window_days" type="number" min={1} max={365}
            defaultValue={fieldValue(state, 'claim_window_days', String(claimWindowDays))} className="max-w-28" />
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null} Save
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Volunteers can only claim for sessions within this many days. Enforced in the database.
        </p>
      </div>
    </form>
  )
}
