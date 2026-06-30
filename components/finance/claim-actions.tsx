'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { AlertCircle, Loader2, Pencil, Send } from 'lucide-react'
import { submitClaim, type FinanceActionState } from '@/actions/finance'
import type { ReimbursementStatus } from '@/types/database'
import { Button } from '@/components/ui/button'

/** Owner controls on a claim: submit a draft, or edit a draft/rejected claim. */
export function ClaimActions({
  id, status, editHref,
}: { id: string; status: ReimbursementStatus; editHref: string }) {
  const [state, action, pending] = useActionState<FinanceActionState, FormData>(submitClaim, {})
  const editable = status === 'draft' || status === 'rejected'

  if (!editable) {
    return <p className="text-sm text-muted-foreground">This claim is {status === 'paid' ? 'paid' : 'in review'} — no further action needed from you.</p>
  }

  return (
    <div className="space-y-3">
      {state.error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="size-4 shrink-0" /> {state.error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={editHref}><Pencil className="size-4" /> Edit draft</Link>
        </Button>
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Submit for review
          </Button>
        </form>
      </div>
      <p className="text-xs text-muted-foreground">Submitting locks the claim and runs eligibility + anomaly checks.</p>
    </div>
  )
}
