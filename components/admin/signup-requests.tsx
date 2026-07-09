'use client'

import { useActionState } from 'react'
import { Check, Loader2, UserRoundCheck, X } from 'lucide-react'
import type { PendingSignup } from '@/lib/data/admin'
import { approveSignup, rejectSignup, type AdminActionState } from '@/actions/admin'
import { roleLabel } from '@/lib/auth/roles'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'

/** Pending self-signups awaiting admin approval (PRD §7.2). Admin-only. */
export function SignupRequests({ requests }: { requests: PendingSignup[] }) {
  if (requests.length === 0) return null

  return (
    <section className="rounded-xl border border-brand-orange/30 bg-brand-orange/5">
      <header className="flex items-center gap-2 border-b border-brand-orange/20 px-4 py-3">
        <UserRoundCheck className="size-4 text-brand-orange" />
        <h2 className="font-display text-sm font-semibold">
          Account signups awaiting approval
          <span className="ml-2 rounded-full bg-brand-orange/15 px-2 py-0.5 text-xs font-medium text-brand-orange">
            {requests.length}
          </span>
        </h2>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-brand-orange/15 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">NIAT ID</th>
              <th className="p-3 font-medium">Campus</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium">Requested</th>
              <th className="p-3 font-medium text-right">Decision</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <SignupRow key={r.id} req={r} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function SignupRow({ req }: { req: PendingSignup }) {
  const [approveState, approve, approving] = useActionState<AdminActionState, FormData>(approveSignup, {})
  const [rejectState, reject, rejecting] = useActionState<AdminActionState, FormData>(rejectSignup, {})
  const busy = approving || rejecting
  const error = approveState.error || rejectState.error

  return (
    <tr className="border-b border-brand-orange/10 align-middle last:border-0">
      <td className="p-3">
        <div className="font-medium">{req.full_name}</div>
        <div className="text-xs text-muted-foreground">{req.email}{req.phone ? ` · ${req.phone}` : ''}</div>
        {error && <div role="alert" className="mt-1 text-xs text-error">{error}</div>}
      </td>
      <td className="p-3 text-muted-foreground">{req.niat_id}</td>
      <td className="p-3 text-muted-foreground">{req.campus?.name ?? '—'}</td>
      <td className="p-3">
        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">{roleLabel(req.requested_role)}</span>
      </td>
      <td className="p-3 text-muted-foreground">{formatDate(req.created_at)}</td>
      <td className="p-3">
        <div className="flex items-center justify-end gap-2">
          <form action={reject}>
            <input type="hidden" name="id" value={req.id} />
            <Button type="submit" size="sm" variant="ghost" className="text-error" disabled={busy}>
              {rejecting ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />} Reject
            </Button>
          </form>
          <form action={approve}>
            <input type="hidden" name="id" value={req.id} />
            <Button type="submit" size="sm" disabled={busy}>
              {approving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Approve
            </Button>
          </form>
        </div>
      </td>
    </tr>
  )
}
