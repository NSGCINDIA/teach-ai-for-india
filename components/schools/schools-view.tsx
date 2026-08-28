'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, MapPin, School, Users } from 'lucide-react'
import type { SchoolListItem } from '@/lib/data/schools'
import type { CampusRow, SchoolStatus } from '@/types/database'
import { SCHOOL_STATUS_META, SCHOOL_PIPELINE } from '@/lib/constants/status'
import { isOverdue, todayIso } from '@/lib/schools/overdue'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { NativeSelect } from '@/components/ui/native-select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/states'
import { DataToolbar } from '@/components/shared/data-toolbar'
import { FilterChips, FilterChip } from '@/components/shared/filter-chips'
import { EntityMonogram } from '@/components/shared/entity-monogram'
import { CurriculumProgress } from '@/components/shared/curriculum-progress'

/** Pipeline stages plus the terminal one, in the order a school moves through them. */
const STAGES: SchoolStatus[] = [...SCHOOL_PIPELINE, 'archived']

interface SchoolsViewProps {
  schools: SchoolListItem[]
  campuses: Pick<CampusRow, 'id' | 'name'>[]
  /** Link base for rows: '/dashboard/schools' or '/admin/schools'. */
  basePath: string
  /**
   * Whether campus is a meaningful dimension here. False for a campus-scoped
   * user, whose every row has the same campus — so both the filter and the
   * column are dropped rather than showing a control that filters nothing and
   * a column that repeats one value down the page.
   */
  showCampusFilter?: boolean
  /**
   * Restrict to schools whose follow-up date has passed. Derived from `?view=`
   * by the page, not held here — see the note on filter state below.
   */
  overdueOnly?: boolean
}

/**
 * SchoolsView — the outreach pipeline.
 *
 * Two presentations of one dataset: a table from `lg` up, and a stacked card
 * list below it. This is deliberately not a single table that scrolls sideways
 * on a phone — a horizontally scrolled row hides the status and the next action,
 * which are the two things a lead checks on their phone between classes. Both
 * presentations render from the same `ordered` array, so they can never drift.
 *
 * Filter state is split on purpose. `q`, `status` and `campus` are local, because
 * they only ever originate from a control inside this component. `overdueOnly`
 * arrives as a prop derived from the URL, because it can be entered from
 * *outside*: the page's "Follow-ups overdue" KPI links to it, and the admin
 * alert feed links to it. Keeping it in the URL is also what lets a lead send
 * someone the filtered list. The consequence to remember is that clearing it
 * means navigating, not calling a setter — see `reset`.
 */
export function SchoolsView({
  schools,
  campuses,
  basePath,
  showCampusFilter = true,
  overdueOnly = false,
}: SchoolsViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<SchoolStatus | ''>('')
  const [campus, setCampus] = useState('')

  // Computed once per render, never per row: `Intl.DateTimeFormat` is not free
  // and this list is capped at 500 schools rendered in two presentations.
  const today = useMemo(() => todayIso(), [])
  const overdueIds = useMemo(
    () => new Set(schools.filter((s) => isOverdue(s, today)).map((s) => s.id)),
    [schools, today],
  )

  const setOverdueOnly = (next: boolean) => {
    startTransition(() => {
      router.replace(next ? `${basePath}?view=overdue` : basePath, { scroll: false })
    })
  }

  // Search and campus only. Every count below is measured against this, so each
  // filter's own chip can ignore itself.
  const searchScoped = useMemo(() => {
    const term = q.trim().toLowerCase()
    return schools.filter((s) => {
      if (campus && s.campus_id !== campus) return false
      if (!term) return true
      return `${s.name} ${s.district} ${s.state}`.toLowerCase().includes(term)
    })
  }, [schools, q, campus])

  // Stage counts respect the search, campus and overdue filters but not the
  // stage filter itself — otherwise clicking a stage would zero out every other
  // chip and the funnel would stop being readable the moment you used it. With
  // the overdue filter on, the chips become the distribution of the *neglected*
  // work, which is the diagnostic a lead actually wants.
  const stageScoped = useMemo(
    () => (overdueOnly ? searchScoped.filter((s) => overdueIds.has(s.id)) : searchScoped),
    [searchScoped, overdueOnly, overdueIds],
  )

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

  // Overdue first, so the work that is late is above the fold no matter where
  // `updated_at desc` happened to put it. Sorting a *copy*: `filtered` can be
  // `searchScoped`, which can be the `schools` prop itself, and `sort` mutates.
  // Sorting on the overdue key alone keeps the sort stable, so the server's
  // recency order survives intact within each group.
  const ordered = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => Number(overdueIds.has(b.id)) - Number(overdueIds.has(a.id)),
      ),
    [filtered, overdueIds],
  )

  // The overdue chip's own count ignores the overdue filter but honours the rest.
  const overdueCount = useMemo(() => {
    const base = status ? searchScoped.filter((s) => s.status === status) : searchScoped
    return base.filter((s) => overdueIds.has(s.id)).length
  }, [searchScoped, status, overdueIds])

  const isFiltered = Boolean(q || status || campus || overdueOnly)
  const reset = () => {
    setQ('')
    setStatus('')
    setCampus('')
    // `overdueOnly` lives in the URL, so clearing local state alone would leave
    // `?view=overdue` applied and "Clear filters" would visibly not clear.
    if (overdueOnly) setOverdueOnly(false)
  }

  return (
    <div className="space-y-4">
      <DataToolbar
        value={q}
        onValueChange={setQ}
        placeholder="Search by school, district or state…"
        label="Search schools"
        isFiltered={isFiltered}
        onReset={reset}
        summary={
          <>
            Showing <strong className="text-foreground">{ordered.length}</strong> of {schools.length}{' '}
            school{schools.length === 1 ? '' : 's'}
            {/* Named because this filter can be arrived at from another page —
                someone landing from the KPI or an admin alert needs telling
                why the list is short. The other filters are already legible in
                their own controls. */}
            {overdueOnly && (
              <> · <span className="text-brand-orange">overdue follow-ups only</span></>
            )}
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

      {/* Two axes, so two groups with a rule between them: pipeline stage is a
          mutually-exclusive choice, overdue is an independent toggle. Folding
          the latter into the stage row would imply "overdue" is a stage. */}
      <div className={cn('flex flex-wrap items-center gap-2', isPending && 'opacity-70')}>
        <FilterChips
          label="Filter by pipeline stage"
          options={stageOptions}
          value={status}
          onChange={setStatus}
          allLabel="Every stage"
          allCount={stageScoped.length}
        />
        {(overdueCount > 0 || overdueOnly) && (
          <>
            <span aria-hidden className="hidden h-5 w-px bg-border/70 sm:block" />
            <FilterChip
              label="Overdue follow-ups"
              count={overdueCount}
              selected={overdueOnly}
              tone="attention"
              onClick={() => setOverdueOnly(!overdueOnly)}
            />
          </>
        )}
      </div>

      {ordered.length === 0 ? (
        <EmptyState
          icon={School}
          title={schools.length === 0 ? 'No schools yet' : 'Nothing matches those filters'}
          description={
            schools.length === 0
              ? 'Every school in the movement starts as a lead. Add the first one and its journey will show up here.'
              : 'Try a different stage, clear the overdue filter, or reset to see the whole pipeline.'
          }
          action={
            schools.length === 0
              ? { label: 'Add the first school', href: `${basePath}/new` }
              : undefined
          }
        />
      ) : (
        <>
          {/* Desktop: full pipeline table. Height-capped so the header can stick.
              The reserve is 18rem, not 22rem: the stack above this table is the
              page header, the toolbar and one chip row, and the old figure
              over-reserved by about four rows — which is how a page that
              announces "2 follow-ups overdue" managed to scroll both of them out
              of sight. */}
          <Table
            containerClassName="hidden lg:block max-h-[calc(100dvh-18rem)] min-h-64"
            className={showCampusFilter ? 'min-w-[52rem]' : 'min-w-[44rem]'}
          >
            <TableHeader sticky>
              <TableRow>
                <TableHead className={cn('pl-5', showCampusFilter ? 'w-[34%]' : 'w-[42%]')}>School</TableHead>
                {showCampusFilter && <TableHead>Campus</TableHead>}
                <TableHead>Session journey</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Follow-up</TableHead>
                <TableHead className="sr-only">Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordered.map((s) => (
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
                  {showCampusFilter && (
                    <TableCell className="text-muted-foreground">{s.campus?.name ?? '—'}</TableCell>
                  )}
                  <TableCell>
                    <CurriculumProgress sessionNumber={s.latest_session_number} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge kind="school" status={s.status} />
                  </TableCell>
                  <TableCell>
                    <NextAction date={s.next_action_date} overdue={overdueIds.has(s.id)} />
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
            {ordered.map((s) => (
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
                          {showCampusFilter && s.campus?.name && ` · ${s.campus.name}`}
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
                              Next action <NextAction date={s.next_action_date} overdue={overdueIds.has(s.id)} inline />
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
 *
 * `overdue` is passed in rather than computed here. This cell used to decide for
 * itself with `new Date(date) < localMidnight`, which disagreed with the KPI
 * above it on two counts: it read a different calendar day, and it had no notion
 * of a school being completed or archived — so a shelved school showed a red
 * warning nobody could ever clear. Both now come from `isOverdue`.
 */
function NextAction({
  date,
  overdue,
  inline = false,
}: {
  date: string | null
  overdue: boolean
  inline?: boolean
}) {
  if (!date) {
    return <span className={cn('text-sm font-medium text-text-tertiary', inline && 'text-xs')}>—</span>
  }

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
