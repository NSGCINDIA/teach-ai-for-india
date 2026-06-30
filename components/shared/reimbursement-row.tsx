import Link from 'next/link'
import { Receipt } from 'lucide-react'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ReimbursementRow as Claim } from '@/types/database'

interface ReimbursementRowProps {
  claim: Pick<Claim, 'id' | 'reference_number' | 'amount' | 'travel_mode' | 'claim_date' | 'status'> & {
    claimant_name?: string | null
    school_name?: string | null
  }
  href?: string
  /** Optional action buttons (approve/reject) injected by the finance queue. */
  actions?: React.ReactNode
  className?: string
}

/**
 * ReimbursementRow (PRD §12.3) — compact view of one claim with status + amount.
 * Used in the volunteer's claim list and the finance review queue.
 */
export function ReimbursementRow({ claim, href, actions, className }: ReimbursementRowProps) {
  const body = (
    <div className={cn('flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/40', className)}>
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
        <Receipt className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{claim.reference_number}</span>
          <StatusBadge kind="reimbursement" status={claim.status} />
        </div>
        <p className="mt-0.5 truncate text-sm">
          {claim.claimant_name ? `${claim.claimant_name} · ` : ''}
          <span className="capitalize">{claim.travel_mode.replace('_', ' ')}</span>
          {claim.school_name ? ` · ${claim.school_name}` : ''}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-display font-bold tabular-nums">{formatCurrency(claim.amount)}</p>
        <p className="text-xs text-muted-foreground">{formatDate(claim.claim_date)}</p>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  )
  return href ? <Link href={href}>{body}</Link> : body
}
