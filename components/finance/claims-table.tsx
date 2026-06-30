'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Receipt, Search, TriangleAlert } from 'lucide-react'
import type { ReimbursementListItem } from '@/lib/data/finance'
import type { ReimbursementStatus, CampusRow } from '@/types/database'
import { REIMBURSEMENT_STATUS_META } from '@/lib/constants/status'
import { formatCurrency, formatDate } from '@/lib/format'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/states'

const SELECT_CLASS =
  'border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30'

const STATUSES = Object.keys(REIMBURSEMENT_STATUS_META) as ReimbursementStatus[]

interface Props {
  claims: ReimbursementListItem[]
  basePath: string
  /** Show claimant + campus columns (admin finance view). */
  showClaimant?: boolean
  campuses?: Pick<CampusRow, 'id' | 'name'>[]
}

export function ClaimsTable({ claims, basePath, showClaimant = false, campuses = [] }: Props) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<ReimbursementStatus | ''>('')
  const [campus, setCampus] = useState('')

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return claims.filter((c) => {
      if (status && c.status !== status) return false
      if (campus && c.campus_id !== campus) return false
      if (term) {
        const hay = `${c.reference_number} ${c.claimant?.full_name ?? ''} ${c.session?.topic ?? ''}`.toLowerCase()
        if (!hay.includes(term)) return false
      }
      return true
    })
  }, [claims, q, status, campus])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ref, claimant, session…" className="pl-9" aria-label="Search claims" />
        </div>
        <select className={SELECT_CLASS} value={status} onChange={(e) => setStatus(e.target.value as ReimbursementStatus | '')} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{REIMBURSEMENT_STATUS_META[s].label}</option>)}
        </select>
        {showClaimant && campuses.length > 0 && (
          <select className={SELECT_CLASS} value={campus} onChange={(e) => setCampus(e.target.value)} aria-label="Filter by campus">
            <option value="">All campuses</option>
            {campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} of {claims.length} claim{claims.length === 1 ? '' : 's'}</p>

      {filtered.length === 0 ? (
        <EmptyState icon={Receipt} title="No claims" description={claims.length === 0 ? 'Reimbursement claims appear here.' : 'Try clearing a filter.'} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Reference</th>
                {showClaimant && <th className="px-4 py-2.5 font-medium">Claimant</th>}
                <th className="px-4 py-2.5 font-medium">Session</th>
                <th className="px-4 py-2.5 font-medium text-right">Amount</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <Link href={`${basePath}/${c.id}`} className="font-mono text-xs font-medium text-foreground hover:text-brand hover:underline">
                      {c.reference_number}
                    </Link>
                    {c.anomaly_flags.length > 0 && (
                      <TriangleAlert className="ml-1.5 inline size-3.5 text-warning" aria-label={`${c.anomaly_flags.length} anomaly flags`} />
                    )}
                  </td>
                  {showClaimant && <td className="px-4 py-3 text-muted-foreground">{c.claimant?.full_name ?? '—'}</td>}
                  <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">{c.session?.topic ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(c.amount)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDate(c.claim_date)}</td>
                  <td className="px-4 py-3"><StatusBadge kind="reimbursement" status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
