'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, Check, Loader2, Repeat, X } from 'lucide-react'
import { respondToAssignment, type AssignmentActionState } from '@/actions/assignments'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type Mode = 'declined' | 'replacement_requested'

/** Accept / decline / request-replacement controls for one of my assignments. */
export function AssignmentResponse({ assignmentId }: { assignmentId: string }) {
  const [state, action, pending] = useActionState<AssignmentActionState, FormData>(respondToAssignment, {})
  const [mode, setMode] = useState<Mode | null>(null)

  if (state.ok) {
    return <p role="status" className="text-sm text-success">{state.message}</p>
  }

  return (
    <div className="space-y-2">
      {state.error && (
        <p role="alert" className="flex items-start gap-1.5 text-xs text-error">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" /> {state.error}
        </p>
      )}

      {mode === null ? (
        <div className="flex flex-wrap gap-2">
          <form action={action}>
            <input type="hidden" name="assignment_id" value={assignmentId} />
            <input type="hidden" name="status" value="accepted" />
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Accept
            </Button>
          </form>
          <Button type="button" size="sm" variant="outline" onClick={() => setMode('declined')}>
            <X className="size-4" /> Decline
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setMode('replacement_requested')}>
            <Repeat className="size-4" /> Request replacement
          </Button>
        </div>
      ) : (
        <form action={action} className="space-y-2">
          <input type="hidden" name="assignment_id" value={assignmentId} />
          <input type="hidden" name="status" value={mode} />
          <Textarea
            name="note"
            rows={2}
            required
            placeholder={mode === 'declined' ? 'Why can’t you make it?' : 'Why do you need a replacement?'}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              {mode === 'declined' ? 'Submit decline' : 'Submit request'}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setMode(null)}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  )
}
