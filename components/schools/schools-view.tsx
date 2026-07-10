'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import type { SchoolListItem } from '@/lib/data/schools'
import type { CampusRow, SchoolStatus } from '@/types/database'
import { SCHOOL_STATUS_META, SCHOOL_PIPELINE } from '@/lib/constants/status'
import { formatDate } from '@/lib/format'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/states'
import { School } from 'lucide-react'

const SELECT_CLASS =
  'border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30'

interface SchoolsViewProps {
  schools: SchoolListItem[]
  campuses: Pick<CampusRow, 'id' | 'name'>[]
  /** Link base for rows: '/dashboard/schools' or '/admin/schools'. */
  basePath: string
  /** Hide the campus filter for single-campus (own) views. */
  showCampusFilter?: boolean
}

export function SchoolsView({ schools, campuses, basePath, showCampusFilter = true }: SchoolsViewProps) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<SchoolStatus | ''>('')
  const [campus, setCampus] = useState('')

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return schools.filter((s) => {
      if (status && s.status !== status) return false
      if (campus && s.campus_id !== campus) return false
      if (term) {
        const hay = `${s.name} ${s.district} ${s.state} ${s.dise_code ?? ''}`.toLowerCase()
        if (!hay.includes(term)) return false
      }
      return true
    })
  }, [schools, q, status, campus])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, district, DISE code…"
            className="pl-9"
            aria-label="Search schools"
          />
        </div>
        <select className={SELECT_CLASS} value={status} onChange={(e) => setStatus(e.target.value as SchoolStatus | '')} aria-label="Filter by status">
          <option value="">All stages</option>
          {SCHOOL_PIPELINE.concat('archived').map((s) => (
            <option key={s} value={s}>{SCHOOL_STATUS_META[s].label}</option>
          ))}
        </select>
        {showCampusFilter && (
          <select className={SELECT_CLASS} value={campus} onChange={(e) => setCampus(e.target.value)} aria-label="Filter by campus">
            <option value="">All campuses</option>
            {campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} of {schools.length} school{schools.length === 1 ? '' : 's'}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={School}
          title="No schools match"
          description={schools.length === 0 ? 'No schools yet. Add the first one to start the pipeline.' : 'Try clearing a filter.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">School</th>
                <th className="px-4 py-2.5 font-medium">District</th>
                <th className="px-4 py-2.5 font-medium">Campus</th>
                <th className="px-4 py-2.5 font-medium">Stage</th>
                <th className="px-4 py-2.5 font-medium">Next action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <Link href={`${basePath}/${s.id}`} className="font-medium text-foreground hover:text-brand hover:underline">
                      {s.name}
                    </Link>
                    {s.is_duplicate_flagged && (
                      <span className="ml-2 rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-warning">
                        Dup?
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.district}, {s.state}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.campus?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge kind="school" status={s.status} />
                    {s.latest_session_number && (
                      <p className="mt-1 text-[11px] text-muted-foreground">Session {s.latest_session_number}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(s.next_action_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
