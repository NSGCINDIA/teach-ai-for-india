'use client'

import { useActionState, useRef, useState } from 'react'
import { AlertCircle, ArrowRight, Loader2, ShieldAlert } from 'lucide-react'
import { changeSchoolStatus, type SchoolActionState } from '@/actions/schools'
import { fieldValue } from '@/lib/actions/form-values'
import { SCHOOL_STATUS_META, SCHOOL_TRANSITIONS } from '@/lib/constants/status'
import type { SchoolStatus } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { selectClass } from '@/components/ui/native-select'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { useFormSuccess } from '@/hooks/use-form-success'

interface StageOverrideDialogProps {
  schoolId: string
  current: SchoolStatus
}

/**
 * Manual stage override — Super Admin only, exactly as before.
 *
 * This used to live permanently inside the pipeline card: a dashed clickable box
 * on every legal target stage, plus an always-visible "Super Admin: Manual Stage
 * Override" button and a confirmation panel that expanded in place. It is a rare,
 * deliberate, note-required action, so it belongs behind a dialog rather than in
 * the middle of the one visualisation everyone reads on every visit.
 *
 * Unchanged: the `changeSchoolStatus` action, the legal targets from
 * SCHOOL_TRANSITIONS, and the mandatory reason note. Only super admins ever see
 * the trigger — the rail decides that, mirroring the old component's `isAdmin`
 * gate — and `change_school_status()` in the database remains the real check.
 */
export function StageOverrideDialog({ schoolId, current }: StageOverrideDialogProps) {
  const [open, setOpen] = useState(false)
  const options = SCHOOL_TRANSITIONS[current] ?? []
  const [target, setTarget] = useState<SchoolStatus | ''>(options[0] ?? '')

  const [state, action, pending] = useActionState<SchoolActionState, FormData>(
    changeSchoolStatus,
    {},
  )
  const formRef = useRef<HTMLFormElement>(null)
  // The toast and the form reset come from the shared hook; closing the dialog
  // is the only extra step this action needs.
  useFormSuccess(state, { formRef, onSuccess: () => setOpen(false) })

  if (options.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ShieldAlert className="size-3.5" /> Change stage
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manual stage override</DialogTitle>
          <DialogDescription>
            Stages normally advance on their own as approvals and sessions succeed. Moving
            this school by hand is a Super Admin action and is recorded with your reason.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={action} className="space-y-4">
          <input type="hidden" name="school_id" value={schoolId} />

          <div className="space-y-1.5">
            <Label htmlFor="new_status">Move to</Label>
            <select
              id="new_status"
              name="new_status"
              required
              value={target}
              onChange={(e) => setTarget(e.target.value as SchoolStatus)}
              className={selectClass}
            >
              {options.map((s) => (
                <option key={s} value={s}>{SCHOOL_STATUS_META[s].label}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              From <strong className="text-foreground">{SCHOOL_STATUS_META[current].label}</strong>
              {target && (
                <> to <strong className="text-brand">{SCHOOL_STATUS_META[target].label}</strong></>
              )}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="override-note">
              Reason <span className="text-error">*</span>
            </Label>
            <Textarea
              id="override-note"
              name="note"
              rows={3}
              required
              defaultValue={fieldValue(state, 'note', '')}
              placeholder="Why is this school being moved by hand?"
            />
          </div>

          {state.error && (
            <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
              <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={pending || !target}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              Confirm override
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
