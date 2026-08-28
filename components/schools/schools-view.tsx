'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, MapPin, School, Users } from 'lucide-react'
import type { SchoolListItem } from '@/lib/data/schools'
import type { CampusRow, SchoolStatus } from '@/types/database'
import { SCHOOL_STATUS_META, SCHOOL_PIPELINE } from '@/lib/constants/status'
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
import { CurriculumProgress } from '@/components/shared/curriculum-progress'

/** Pipeline stages plus the terminal one, in the order a school moves through them. */
const STAGES: SchoolStatus[] = [...SCHOOL_PIPELINE, 'archived']

interface SchoolsViewProps {
  schools: SchoolListItem[]
  campuses: Pick<CampusRow, 'id' | 'name'>[]
  /** Link base for rows: '/dashboard/schools' or '/admin/schools'. */
  basePath: string
  /** Hide the campus filter for single-campus (own) views. */
  showCampusFilter?: boolean
}

/**
 * SchoolsView — the outreach pipeline.
 *
 * Two presentations of one dataset: a table from `lg` up, and a stacked card
 * list below it. This is deliberately not a single table that scrolls sideways
 * on a phone — a horizontally scrolled row hides the status and the next action,
 * which are the two things a lead checks on their phone between classes. Both
 * presentations render from the same `filtered` array, so they can never drift.
 */
export function SchoolsView({ schools, campuses, basePath, showCampusFilter = true }: SchoolsViewProps) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<SchoolStatus | ''>('')
  const [campus, setCampus] = useState('')

  // Stage counts respect the search and campus filters but not the stage filter
  // itself — otherwise clicking a stage would zero out every other chip and the
  // funnel would stop being readable the moment you used it.
  const stageScoped = useMemo(() => {
    const term = q.trim().toLowerCase()
    return schools.filter((s) => {
      if (campus && s.campus_id !== campus) return false
      if (!term) return true
      return `${s.name} ${s.district} ${s.state} ${s.dise_code ?? ''}`.toLowerCase().includes(term)
    })
  }, [schools, q, campus])

  const stageOptions = useMemo(
    () =>
      STAGES.map((stage) => ({
        value: stage,
        label: SCHOOL_STATUS_META[stage].label,
        count: stageScoped.filter((s) => s.status === stage).length,
      })),
    [stageScoped],
  )

  const filtered = useMemo(
    () => (status ? stageScoped.filter((s) => s.status === status) : stageScoped),
    [stageScoped, status],
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
        placeholder="Search by school name, district or DISE code…"
        label="Search schools"
        isFiltered={isFiltered}
        onReset={reset}
        summary={
          <>
            Showing <strong className="text-foreground">{filtered.length}</strong> of {schools.length}{' '}
            school{schools.length === 1 ? '' : 's'}
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
        label="Filter by pipeline stage"
        options={stageOptions}
        value={status}
        onChange={setStatus}
        allLabel="Every stage"
        allCount={stageScoped.length}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={School}
          title={schools.length === 0 ? 'No schools yet' : 'Nothing matches those filters'}
          description={
            schools.length === 0
              ? 'Every school in the movement starts as a lead. Add the first one and its journey will show up here.'
              : 'Try a different stage, or clear the filters to see the whole pipeline.'
          }
          action={
            schools.length === 0
              ? { label: 'Add the first school', href: `${basePath}/new` }
              : undefined
          }
        />
      ) : (
        <>
          {/* Desktop: full pipeline table. Height-capped so the header can stick. */}
          <Table
            containerClassName="hidden lg:block max-h-[calc(100dvh-22rem)] min-h-64"
            className="min-w-[52rem]"
          >
            <TableHeader sticky>
              <TableRow>
                <TableHead className="w-[34%] pl-5">School</TableHead>
                <TableHead>Campus</TableHead>
                <TableHead>Session journey</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Next action</TableHead>
                <TableHead className="sr-only">Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} className="group">
                  <TableCell className="max-w-0 pl-5">
                    <div className="flex items-center gap-3">
                      <EntityMonogram name={s.name} size="md" />
                      <div className="min-w-0">
                        <Link
                          href={`${basePath}/${s.id}`}
                          className="block truncate font-semibold text-foreground transition-colors hover:text-brand focus-visible:outline-none focus-visible:underline"
                        >
                          {s.name}
                        </Link>
                        <p className="truncate text-xs font-medium text-muted-foreground">
                          {s.district}, {s.state}
                          {s.total_students > 0 && ` · ${s.total_students} students reached`}
                        </p>
                      </div>
                      {s.is_duplicate_flagged && (
                        <span
                          className="shrink-0 rounded-md border border-warning/40 bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold text-warning"
                          title="Flagged as a possible duplicate record"
                        >
                          Dup?
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.campus?.name ?? '—'}</TableCell>
                  <TableCell>
                    <CurriculumProgress sessionNumber={s.latest_session_number} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge kind="school" status={s.status} />
                  </TableCell>
                  <TableCell>
                    <NextAction date={s.next_action_date} />
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    {/* A second, explicit target for the row. The chevron alone would
                        promise a row click the table does not actually implement. */}
                    <Link
                      href={`${basePath}/${s.id}`}
                      className="inline-flex rounded-md p-1 text-text-tertiary transition-all hover:bg-brand/10 hover:text-brand group-hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                    >
                      <ChevronRight aria-hidden className="size-4" />
                      <span className="sr-only">Open {s.name}</span>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Mobile / tablet: one card per school, hierarchy intact. */}
          <ul className="space-y-2.5 lg:hidden">
            {filtered.map((s) => (
              <li key={s.id}>
                <Link
                  href={`${basePath}/${s.id}`}
                  className="block rounded-xl border border-border/50 bg-card p-4 shadow-soft transition-all hover:border-brand/30 hover:shadow-soft-lg active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                >
                  <div className="flex items-start gap-3">
                    <EntityMonogram name={s.name} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-foreground">{s.name}</p>
                      {/* `truncate` has to sit on a real child, not on this flex
                          container: text directly inside a flex box becomes an
                          anonymous flex item, which ignores text-overflow and
                          refuses to shrink — that pushed the whole card wider
                          than a phone viewport. */}
                      <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs font-medium text-muted-foreground">
                        <MapPin aria-hidden className="size-3 shrink-0" />
                        <span className="truncate">
                          {s.district}, {s.state}
                          {s.campus?.name && ` · ${s.campus.name}`}
                        </span>
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                        <StatusBadge kind="school" status={s.status} />
                        <CurriculumProgress sessionNumber={s.latest_session_number} />
                      </div>
                      {(s.next_action_date || s.total_students > 0) && (
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/50 pt-2.5 text-xs">
                          {s.next_action_date && (
                            <span className="font-medium text-muted-foreground">
                              Next action <NextAction date={s.next_action_date} inline />
                            </span>
                          )}
                          {s.total_students > 0 && (
                            <span className="flex items-center gap-1 font-medium text-muted-foreground">
                              <Users aria-hidden className="size-3" />
                              {s.total_students} students reached
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight aria-hidden className="mt-1 size-4 shrink-0 text-text-tertiary" />
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
 * A follow-up date is only useful relative to today, so an overdue one is
 * coloured and labelled rather than left as another grey date among many.
 * The word "Overdue" carries the meaning on its own — the colour only reinforces it.
 */
function NextAction({ date, inline = false }: { date: string | null; inline?: boolean }) {
  if (!date) {
    return <span className={cn('text-sm font-medium text-text-tertiary', inline && 'text-xs')}>—</span>
  }

  // Compare date-only: a follow-up dated today is due, not already late.
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const overdue = new Date(date) < today

  return (
    <span
      className={cn(
        'font-semibold',
        inline ? 'text-xs' : 'text-sm',
        overdue ? 'text-error' : 'text-muted-foreground',
      )}
    >
      {formatDate(date)}
      {overdue && <span className="ml-1.5 font-bold">· Overdue</span>}
    </span>
  )
}
