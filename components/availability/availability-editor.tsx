'use client'

import { useActionState } from 'react'
import { AlertCircle, Loader2, Plus } from 'lucide-react'
import { setAvailability, clearAvailability, type AvailabilityActionState } from '@/actions/availability'
import { fieldValue } from '@/lib/actions/form-values'
import type { AvailabilityRow } from '@/types/database'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/shared/status-badge'
import { AVAILABILITY_META } from '@/lib/constants/workspace'

const SELECT_CLASS =
  'border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30'

export function AvailabilityEditor({ entries }: { entries: AvailabilityRow[] }) {
  const [state, action, pending] = useActionState<AvailabilityActionState, FormData>(setAvailability, {})

  return (
    <div className="space-y-5">
      <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" name="date" required defaultValue={fieldValue(state, 'date', '')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Availability</Label>
          <select id="status" name="status" className={SELECT_CLASS} defaultValue={fieldValue(state, 'status', 'available')}>
            <option value="available">Available</option>
            <option value="tentative">Tentative</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Save
        </Button>
      </form>

      {state.error && (
        <p role="alert" className="flex items-start gap-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No availability set yet. Add dates above so your Volunteer Lead can plan.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {entries.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span className="font-medium">{formatDate(e.date)}</span>
              <span className="flex items-center gap-2">
                <StatusBadge label={AVAILABILITY_META[e.status].label} tone={AVAILABILITY_META[e.status].tone} />
                <ClearButton id={e.id} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ClearButton({ id }: { id: string }) {
  const [, action, pending] = useActionState<AvailabilityActionState, FormData>(clearAvailability, {})
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className="text-xs text-muted-foreground hover:text-error disabled:opacity-50">
        {pending ? '…' : 'Remove'}
      </button>
    </form>
  )
}
