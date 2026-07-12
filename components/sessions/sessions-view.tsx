'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, Search } from 'lucide-react'
import type { SessionListItem } from '@/lib/data/sessions'
import type { CampusRow, SessionStatus } from '@/types/database'
import { SESSION_STATUS_META } from '@/lib/constants/status'
import { SESSION_TYPE_META } from '@/lib/constants/sessions'
import { formatDate } from '@/lib/format'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/states'

const SELECT_CLASS =
  'border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30'

const STATUSES = Object.keys(SESSION_STATUS_META) as SessionStatus[]

function timing(start: string | null, end: string | null): string {
  const parts = [start, end].filter(Boolean).map((t) => t!.slice(0, 5))
  return parts.length ? parts.join(' – ') : '—'
}

interface Props {
  sessions: SessionListItem[]
  campuses: Pick<CampusRow, 'id' | 'name'>[]
  basePath: string
  showCampusFilter?: boolean
}

export function SessionsView({ sessions, campuses, basePath, showCampusFilter = true }: Props) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<SessionStatus | ''>('')
  const [campus, setCampus] = useState('')

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return sessions.filter((s) => {
      if (status && s.status !== status) return false
      if (campus && s.campus_id !== campus) return false
      if (term) {
        const hay = `${s.school?.name ?? ''} ${s.topic} ${SESSION_TYPE_META[s.session_type].label}`.toLowerCase()
        if (!hay.includes(term)) return false
      }
      return true
    })
  }, [sessions, q, status, campus])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search school, topic, type…" className="pl-9" aria-label="Search sessions" />
        </div>
        <select className={SELECT_CLASS} value={status} onChange={(e) => setStatus(e.target.value as SessionStatus | '')} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{SESSION_STATUS_META[s].label}</option>)}
        </select>
        {showCampusFilter && (
          <select className={SELECT_CLASS} value={campus} onChange={(e) => setCampus(e.target.value)} aria-label="Filter by campus">
            <option value="">All campuses</option>
            {campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} of {sessions.length} session{sessions.length === 1 ? '' : 's'}</p>

      {filtered.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No sessions match" description={sessions.length === 0 ? 'No sessions planned yet.' : 'Try clearing a filter.'} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Timing</th>
                <th className="px-4 py-2.5 font-medium">School</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Topic</th>
                <th className="px-4 py-2.5 font-medium">Attended</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-muted/40">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDate(s.date)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{timing(s.start_time, s.end_time)}</td>
                  <td className="px-4 py-3">
                    <Link href={`${basePath}/${s.id}`} className="font-medium text-foreground hover:text-brand hover:underline">
                      {s.school?.name ?? 'Session'}
                    </Link>
                    <span className="ml-1 text-xs text-muted-foreground">#{s.session_number}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{SESSION_TYPE_META[s.session_type].label}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">{s.topic}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.volunteer_count ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge kind="session" status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
