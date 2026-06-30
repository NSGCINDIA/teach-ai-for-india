'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { changeSchoolStatus, type SchoolActionState } from '@/actions/schools'
import {
  SCHOOL_STATUS_META,
  SCHOOL_TRANSITIONS,
  schoolTransitionNeedsNote,
} from '@/lib/constants/status'
import type { SchoolStatus } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/shared/status-badge'

const SELECT_CLASS =
  'border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30'

interface StatusControlProps {
  schoolId: string
  current: SchoolStatus
  /** Whether the signed-in user may move this school (campus-scoped). */
  canEdit: boolean
}

export function StatusControl({ schoolId, current, canEdit }: StatusControlProps) {
  const [state, action, pending] = useActionState<SchoolActionState, FormData>(changeSchoolStatus, {})
  const options = SCHOOL_TRANSITIONS[current] ?? []
  const [target, setTarget] = useState<SchoolStatus | ''>('')
  const needsNote = target ? schoolTransitionNeedsNote(current, target) : false

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Current stage</span>
        <StatusBadge kind="school" status={current} />
      </div>

      {!canEdit ? (
        <p className="text-sm text-muted-foreground">You have read-only access to this school’s pipeline.</p>
      ) : options.length === 0 ? (
        <p className="text-sm text-muted-foreground">This school is in a terminal stage.</p>
      ) : (
        <form action={action} className="space-y-3">
          <input type="hidden" name="school_id" value={schoolId} />

          {state.error && (
            <p role="alert" className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
              <AlertCircle className="size-4 shrink-0" /> {state.error}
            </p>
          )}
          {state.ok && (
            <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{state.message}</p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="new_status">Move to</Label>
            <select
              id="new_status"
              name="new_status"
              required
              className={SELECT_CLASS}
              value={target}
              onChange={(e) => setTarget(e.target.value as SchoolStatus)}
            >
              <option value="">— Select next stage —</option>
              {options.map((s) => (
                <option key={s} value={s}>{SCHOOL_STATUS_META[s].label}</option>
              ))}
            </select>
          </div>

          {target && (
            <div className="space-y-1.5">
              <Label htmlFor="note">
                Reason {needsNote ? <span className="text-error">*</span> : <span className="text-muted-foreground">(optional)</span>}
              </Label>
              <Textarea
                id="note"
                name="note"
                rows={2}
                required={needsNote}
                placeholder={needsNote ? 'Required for archiving and backward moves' : 'Add context for the visit log'}
              />
            </div>
          )}

          <Button type="submit" size="sm" disabled={pending || !target}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
            Update status
          </Button>
        </form>
      )}
    </div>
  )
}
