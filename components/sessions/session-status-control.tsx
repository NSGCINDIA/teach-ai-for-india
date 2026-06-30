'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { changeSessionStatus, type SessionActionState } from '@/actions/sessions'
import { SESSION_STATUS_META, SESSION_TRANSITIONS } from '@/lib/constants/status'
import type { SessionStatus } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/shared/status-badge'

const SELECT_CLASS =
  'border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30'

interface Props {
  sessionId: string
  current: SessionStatus
  canEdit: boolean
}

export function SessionStatusControl({ sessionId, current, canEdit }: Props) {
  const [state, action, pending] = useActionState<SessionActionState, FormData>(changeSessionStatus, {})
  const options = SESSION_TRANSITIONS[current] ?? []
  const [target, setTarget] = useState<SessionStatus | ''>('')
  const needsNote = target === 'cancelled'

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Status</span>
        <StatusBadge kind="session" status={current} />
      </div>

      {!canEdit ? (
        <p className="text-sm text-muted-foreground">Read-only access to this session.</p>
      ) : options.length === 0 ? (
        <p className="text-sm text-muted-foreground">This session is closed.</p>
      ) : (
        <form action={action} className="space-y-3">
          <input type="hidden" name="session_id" value={sessionId} />
          {state.error && (
            <p role="alert" className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
              <AlertCircle className="size-4 shrink-0" /> {state.error}
            </p>
          )}
          {state.ok && <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{state.message}</p>}

          <div className="space-y-1.5">
            <Label htmlFor="s-status">Move to</Label>
            <select id="s-status" name="new_status" required className={SELECT_CLASS} value={target} onChange={(e) => setTarget(e.target.value as SessionStatus)}>
              <option value="">— Select —</option>
              {options.map((s) => <option key={s} value={s}>{SESSION_STATUS_META[s].label}</option>)}
            </select>
          </div>

          {target === 'reported' && (
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              Reporting requires student &amp; volunteer counts, a topic, and at least 1 photo + 1 attendance document in Evidence.
            </p>
          )}

          {needsNote && (
            <div className="space-y-1.5">
              <Label htmlFor="s-note">Reason <span className="text-error">*</span></Label>
              <Textarea id="s-note" name="note" rows={2} required placeholder="Why is this session cancelled?" />
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
