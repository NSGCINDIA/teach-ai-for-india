import Link from 'next/link'
import { ArrowLeft, TriangleAlert } from 'lucide-react'
import type { ReimbursementListItem } from '@/lib/data/finance'
import { TRAVEL_MODE_META, ANOMALY_META, anomalyLabel } from '@/lib/constants/finance'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { ClaimActions } from '@/components/finance/claim-actions'
import { ReviewPanel } from '@/components/finance/review-panel'

interface Props {
  claim: ReimbursementListItem
  mode: 'owner' | 'admin'
  basePath: string
  sessionHref?: string | null
}

export function ClaimDetailView({ claim, mode, basePath, sessionHref }: Props) {
  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
        <Link href={basePath}><ArrowLeft className="size-4" /> Back</Link>
      </Button>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight font-mono">{claim.reference_number}</h1>
            <StatusBadge kind="reimbursement" status={claim.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatCurrency(claim.amount)} · {TRAVEL_MODE_META[claim.travel_mode].label} · {formatDate(claim.claim_date)}
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Claim</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Detail label="Amount" value={formatCurrency(claim.amount)} />
              <Detail label="Travel mode" value={TRAVEL_MODE_META[claim.travel_mode].label} />
              <Detail label="Date" value={formatDate(claim.claim_date)} />
              {mode === 'admin' && <Detail label="Claimant" value={claim.claimant?.full_name} />}
              <Detail label="Campus" value={claim.campus?.name} />
              <Detail
                label="Session"
                value={claim.session ? `#${claim.session.session_number} · ${claim.session.topic}` : undefined}
                href={claim.session && sessionHref ? `${sessionHref}/${claim.session.id}` : undefined}
              />
              {claim.reason && <Detail label="Reason" value={claim.reason} className="col-span-2 sm:col-span-3" />}
            </CardContent>
          </Card>

          {claim.anomaly_flags.length > 0 && (
            <Card className="border-warning/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-warning">
                  <TriangleAlert className="size-4" /> {claim.anomaly_flags.length} anomaly flag{claim.anomaly_flags.length > 1 ? 's' : ''}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {claim.anomaly_flags.map((f) => (
                    <li key={f}>
                      <span className="font-medium">{anomalyLabel(f)}</span>
                      <span className="text-muted-foreground"> — {ANOMALY_META[f]?.detail ?? 'Flagged for review.'}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {(claim.reviewer_note || claim.payment_reference || claim.payment_date) && (
            <Card>
              <CardHeader><CardTitle className="text-base">Review &amp; payment</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                {claim.reviewer_note && <Detail label="Reviewer note" value={claim.reviewer_note} className="col-span-2 sm:col-span-3" />}
                {claim.reviewed_at && <Detail label="Reviewed" value={formatDateTime(claim.reviewed_at)} />}
                {claim.payment_date && <Detail label="Paid on" value={formatDate(claim.payment_date)} />}
                {claim.payment_method && <Detail label="Method" value={claim.payment_method} />}
                {claim.payment_reference && <Detail label="Reference" value={claim.payment_reference} />}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">{mode === 'admin' ? 'Decision' : 'Your claim'}</CardTitle></CardHeader>
            <CardContent>
              {mode === 'admin' ? (
                <ReviewPanel id={claim.id} status={claim.status} />
              ) : (
                <ClaimActions id={claim.id} status={claim.status} editHref={`${basePath}/${claim.id}/edit`} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Detail({ label, value, href, className }: { label: string; value?: string | null; href?: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap font-medium">
        {href && value ? <Link href={href} className="text-brand hover:underline">{value}</Link> : value || '—'}
      </dd>
    </div>
  )
}
