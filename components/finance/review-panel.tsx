'use client'

import { useActionState } from 'react'
import { AlertCircle, BadgeCheck, Loader2, X } from 'lucide-react'
import { reviewClaim, payClaim, type FinanceActionState } from '@/actions/finance'
import type { ReimbursementStatus } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

/** Admin review + payment controls (PRD §7.6). */
export function ReviewPanel({ id, status }: { id: string; status: ReimbursementStatus }) {
  const [reviewState, reviewAction, reviewing] = useActionState<FinanceActionState, FormData>(reviewClaim, {})
  const [payState, payAction, paying] = useActionState<FinanceActionState, FormData>(payClaim, {})

  const inReview = status === 'submitted' || status === 'under_review'
  const payable = status === 'approved'

  if (!inReview && !payable) {
    return <p className="text-sm text-muted-foreground">No action available — this claim is {status}.</p>
  }

  if (payable) {
    return (
      <form action={payAction} className="space-y-3">
        <input type="hidden" name="id" value={id} />
        {payState.error && (
          <p role="alert" className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
            <AlertCircle className="size-4 shrink-0" /> {payState.error}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="payment_date">Payment date</Label>
            <Input id="payment_date" type="date" name="payment_date" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="payment_method">Method</Label>
            <Input id="payment_method" name="payment_method" placeholder="UPI / bank transfer" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="payment_reference">Reference</Label>
            <Input id="payment_reference" name="payment_reference" placeholder="Transaction reference" />
          </div>
        </div>
        <Button type="submit" disabled={paying}>
          {paying ? <Loader2 className="size-4 animate-spin" /> : <BadgeCheck className="size-4" />} Mark as paid
        </Button>
      </form>
    )
  }

  return (
    <form action={reviewAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      {reviewState.error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="size-4 shrink-0" /> {reviewState.error}
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="reviewer_note">Reviewer note</Label>
        <Textarea id="reviewer_note" name="reviewer_note" rows={2} placeholder="Reason for the decision (shown to the claimant on rejection)" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" name="decision" value="approved" disabled={reviewing}>
          {reviewing ? <Loader2 className="size-4 animate-spin" /> : <BadgeCheck className="size-4" />} Approve
        </Button>
        <Button type="submit" name="decision" value="rejected" variant="outline" className="text-error" disabled={reviewing}>
          <X className="size-4" /> Reject
        </Button>
        {status === 'submitted' && (
          <Button type="submit" name="decision" value="under_review" variant="ghost" disabled={reviewing}>
            Hold for review
          </Button>
        )}
      </div>
    </form>
  )
}
