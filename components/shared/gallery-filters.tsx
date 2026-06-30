'use client'

import { useMemo, useState } from 'react'
import { ImageIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EvidenceGrid, type EvidenceItem } from '@/components/shared/evidence-grid'
import { EmptyState } from '@/components/shared/states'

export interface GalleryCampusOption {
  id: string
  name: string
}

const ALL = 'all'

/** Month key (YYYY-MM) for grouping; null when the timestamp is missing/invalid. */
function monthKey(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

/**
 * Client-side gallery with campus + date filters (PRD §7.1 — masonry,
 * filterable by campus and date). Filtering is in-memory over the already
 * fetched approved-public media, so it stays instant and degrades gracefully
 * to an empty state.
 */
export function GalleryFilters({
  items,
  campuses,
}: {
  items: EvidenceItem[]
  campuses: GalleryCampusOption[]
}) {
  const [campus, setCampus] = useState(ALL)
  const [month, setMonth] = useState(ALL)

  // Distinct months present in the data, newest first.
  const months = useMemo(() => {
    const keys = new Set<string>()
    for (const it of items) {
      const k = monthKey(it.createdAt)
      if (k) keys.add(k)
    }
    return Array.from(keys).sort().reverse()
  }, [items])

  const filtered = useMemo(
    () =>
      items.filter(
        (it) =>
          (campus === ALL || it.campusId === campus) &&
          (month === ALL || monthKey(it.createdAt) === month),
      ),
    [items, campus, month],
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={campus} onValueChange={setCampus}>
          <SelectTrigger className="w-full sm:w-56" aria-label="Filter by campus">
            <SelectValue placeholder="All campuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All campuses</SelectItem>
            {campuses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-full sm:w-56" aria-label="Filter by date">
            <SelectValue placeholder="All dates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All dates</SelectItem>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {monthLabel(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(campus !== ALL || month !== ALL) && (
          <button
            type="button"
            onClick={() => {
              setCampus(ALL)
              setMonth(ALL)
            }}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-brand sm:ml-1"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No photos match these filters"
          description="Try a different campus or date — or clear the filters to see everything."
        />
      ) : (
        <EvidenceGrid items={filtered} />
      )}
    </div>
  )
}
