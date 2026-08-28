'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, ChevronRight, Clock, Users } from 'lucide-react'
import type { SessionListItem } from '@/lib/data/sessions'
import type { CampusRow, SessionStatus } from '@/types/database'
import { SESSION_STATUS_META } from '@/lib/constants/status'
import { SESSION_TYPE_META } from '@/lib/constants/sessions'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { NativeSelect } from '@/components/ui/native-select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/states'
import { DataToolbar } from '@/components/shared/data-toolbar'
import { FilterChips } from '@/components/shared/filter-chips'
import { EntityMonogram } from '@/components/shared/entity-monogram'

const STATUSES = Object.keys(SESSION_STATUS_META) as SessionStatus[]

function timing(start: string | null, end: string | null): string | null {
  const parts = [start, end].filter(Boolean).map((t) => t!.slice(0, 5))
  return parts.length ? parts.join(' – ') : null
}

/** Days between a session date and today, at date granularity (so "today" is 0, not 0.4). */
function dayOffset(date: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

interface Props {
  sessions: SessionListItem[]
  campuses: Pick<CampusRow, 'id' | 'name'>[]
  basePath: string
  showCampusFilter?: boolean
}

/**
 * SessionsView — every AI session delivered or planned.
 *
 * Same two-presentation structure as SchoolsView (table from `lg`, cards below)
 * for the same reason, and driven by one filtered array so the two can't drift.
 * The date column leads because sessions are read chronologically far more often
 * than alphabetically — the list arrives newest-first from `listSessions`.
 */
export function SessionsView({ sessions, campuses, basePath, showCampusFilter = true }: Props) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<SessionStatus | ''>('')
  const [campus, setCampus] = useState('')

  // Counts ignore the status filter itself so the chip row stays a readable
  // distribution after you click one. See the same note in SchoolsView.
  const statusScoped = useMemo(() => {
    const term = q.trim().toLowerCase()
    return sessions.filter((s) => {
      if (campus && s.campus_id !== campus) return false
      if (!term) return true
      const hay = `${s.school?.name ?? ''} ${s.topic} ${SESSION_TYPE_META[s.session_type].label}`
      return hay.toLowerCase().includes(term)
    })
  }, [sessions, q, campus])

  const statusOptions = useMemo(
    () =>
      STATUSES.map((value) => ({
        value,
        label: SESSION_STATUS_META[value].label,
        count: statusScoped.filter((s) => s.status === value).length,
      })),
    [statusScoped],
  )

  const filtered = useMemo(
    () => (status ? statusScoped.filter((s) => s.status === status) : statusScoped),
    [statusScoped, status],
  )

  const isFiltered = Boolean(q || status || campus)
  const reset = () => {
    setQ('')
    setStatus('')
    setCampus('')
  }

  return (
    <div className="space-y-4">
      <DataToolbar
        value={q}
        onValueChange={setQ}
        placeholder="Search by school, topic or session type…"
        label="Search sessions"
        isFiltered={isFiltered}
        onReset={reset}
        summary={
          <>
            Showing <strong className="text-foreground">{filtered.length}</strong> of {sessions.length}{' '}
            session{sessions.length === 1 ? '' : 's'}
          </>
        }
      >
        {showCampusFilter && (
          <NativeSelect
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            aria-label="Filter by campus"
            className="w-auto min-w-44"
          >
            <option value="">All campuses</option>
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </NativeSelect>
        )}
      </DataToolbar>

      <FilterChips
        label="Filter by session status"
        options={statusOptions}
        value={status}
        onChange={setStatus}
        allLabel="Every status"
        allCount={statusScoped.length}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={sessions.length === 0 ? 'No sessions yet' : 'Nothing matches those filters'}
          description={
            sessions.length === 0
              ? 'Your next AI workshop will appear here once it is scheduled.'
              : 'Try a different status, or clear the filters to see every session.'
          }
          action={
            sessions.length === 0 ? { label: 'Schedule a session', href: `${basePath}/new` } : undefined
          }
        />
      ) : (
        <>
          <Table
            containerClassName="hidden lg:block max-h-[calc(100dvh-22rem)] min-h-64"
            className="min-w-[56rem]"
          >
            <TableHeader sticky>
              <TableRow>
                <TableHead className="pl-5">When</TableHead>
                <TableHead className="w-[34%]">School &amp; topic</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Volunteers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="sr-only">Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} className="group">
                  <TableCell className="pl-5">
                    <SessionWhen date={s.date} start={s.start_time} end={s.end_time} />
                  </TableCell>
                  <TableCell className="max-w-0">
                    <div className="flex items-center gap-3">
                      <EntityMonogram name={s.school?.name ?? 'Session'} size="md" />
                      <div className="min-w-0">
                        <Link
                          href={`${basePath}/${s.id}`}
                          className="block truncate font-semibold text-foreground transition-colors hover:text-brand focus-visible:outline-none focus-visible:underline"
                        >
                          {s.school?.name ?? 'Session'}
                        </Link>
                        <p className="truncate text-xs font-medium text-muted-foreground">
                          Session {s.session_number} · {s.topic}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-md bg-cream-light px-2 py-1 text-xs font-semibold text-text-secondary">
                      {SESSION_TYPE_META[s.session_type].label}
                    </span>
                  </TableCell>
                  <TableCell>
                    {s.volunteer_count ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        <Users aria-hidden className="size-3.5 text-brand-orange" />
                        {s.volunteer_count}
                      </span>
                    ) : (
                      <span className="text-sm text-text-tertiary">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge kind="session" status={s.status} />
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <Link
                      href={`${basePath}/${s.id}`}
                      className="inline-flex rounded-md p-1 text-text-tertiary transition-all hover:bg-brand/10 hover:text-brand group-hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                    >
                      <ChevronRight aria-hidden className="size-4" />
                      <span className="sr-only">Open session {s.session_number}</span>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <ul className="space-y-2.5 lg:hidden">
            {filtered.map((s) => (
              <li key={s.id}>
                <Link
                  href={`${basePath}/${s.id}`}
                  className="block rounded-xl border border-border/50 bg-card p-4 shadow-soft transition-all hover:border-brand/30 hover:shadow-soft-lg active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                >
                  <div className="flex items-start gap-3">
                    <EntityMonogram name={s.school?.name ?? 'Session'} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate font-bold text-foreground">{s.school?.name ?? 'Session'}</p>
                        <StatusBadge kind="session" status={s.status} className="shrink-0" />
                      </div>
                      <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
                        Session {s.session_number} · {s.topic}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/50 pt-2.5 text-xs font-medium text-muted-foreground">
                        <SessionWhen date={s.date} start={s.start_time} end={s.end_time} inline />
                        <span className="rounded bg-cream-light px-1.5 py-0.5 font-semibold text-text-secondary">
                          {SESSION_TYPE_META[s.session_type].label}
                        </span>
                        {s.volunteer_count ? (
                          <span className="flex items-center gap-1">
                            <Users aria-hidden className="size-3" />
                            {s.volunteer_count}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

/**
 * Date over time, with today and tomorrow named rather than numbered — those two
 * are the ones anyone scanning a session list is looking for, and "26 Aug" costs
 * a beat of arithmetic to recognise as "that's this afternoon".
 */
function SessionWhen({
  date, start, end, inline = false,
}: {
  date: string
  start: string | null
  end: string | null
  inline?: boolean
}) {
  const offset = dayOffset(date)
  const relative = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : offset === -1 ? 'Yesterday' : null
  const hours = timing(start, end)

  if (inline) {
    return (
      <span className="flex items-center gap-1">
        <CalendarDays aria-hidden className="size-3" />
        {relative ? <strong className="text-brand">{relative}</strong> : formatDate(date)}
        {hours && ` · ${hours}`}
      </span>
    )
  }

  return (
    <div className="min-w-28">
      <p className={cn('text-sm font-bold', relative ? 'text-brand' : 'text-foreground')}>
        {relative ?? formatDate(date)}
      </p>
      <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
        {relative && <span>{formatDate(date)}</span>}
        {relative && hours && <span aria-hidden>·</span>}
        {hours && (
          <>
            <Clock aria-hidden className="size-3" />
            {hours}
          </>
        )}
      </p>
    </div>
  )
}
