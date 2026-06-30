'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { markAttendance, type SessionActionState } from '@/actions/sessions'
import { ATTENDANCE_META } from '@/lib/constants/sessions'
import { roleLabel } from '@/lib/auth/roles'
import type { AttendanceStatus, AttendanceRow, UserRole } from '@/types/database'
import { Button } from '@/components/ui/button'

const STATUS_CLASS =
  'h-8 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30'

const STATUSES = Object.keys(ATTENDANCE_META) as AttendanceStatus[]

type Member = { id: string; full_name: string; role: UserRole }
type RosterRow = { status: AttendanceStatus; arrival_time: string; departure_time: string }

interface Props {
  sessionId: string
  members: Member[]
  existing: Pick<AttendanceRow, 'user_id' | 'status' | 'arrival_time' | 'departure_time'>[]
  canEdit: boolean
}

export function AttendanceEditor({ sessionId, members, existing, canEdit }: Props) {
  const initial: Record<string, RosterRow> = {}
  for (const m of members) {
    const rec = existing.find((e) => e.user_id === m.id)
    initial[m.id] = {
      status: (rec?.status as AttendanceStatus) ?? 'absent',
      arrival_time: rec?.arrival_time?.slice(0, 5) ?? '',
      departure_time: rec?.departure_time?.slice(0, 5) ?? '',
    }
  }
  const [roster, setRoster] = useState(initial)
  const [state, action, pending] = useActionState<SessionActionState, FormData>(markAttendance, {})

  function set(id: string, patch: Partial<RosterRow>) {
    setRoster((r) => ({ ...r, [id]: { ...r[id], ...patch } }))
  }

  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">No campus team members to mark.</p>
  }

  const presentCount = Object.values(roster).filter((r) => r.status !== 'absent').length

  if (!canEdit) {
    return (
      <ul className="space-y-2 text-sm">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between">
            <span>{m.full_name} <span className="text-muted-foreground">· {roleLabel(m.role)}</span></span>
            <span className="text-muted-foreground">{ATTENDANCE_META[roster[m.id].status].label}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="session_id" value={sessionId} />
      <input
        type="hidden"
        name="roster"
        value={JSON.stringify(
          members.map((m) => ({ user_id: m.id, ...roster[m.id] })),
        )}
      />

      {state.error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="size-4 shrink-0" /> {state.error}
        </p>
      )}
      {state.ok && <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{state.message}</p>}

      <ul className="space-y-2">
        {members.map((m) => {
          const row = roster[m.id]
          const here = row.status !== 'absent'
          return (
            <li key={m.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
              <span className="min-w-40 flex-1 font-medium">
                {m.full_name} <span className="font-normal text-muted-foreground">· {roleLabel(m.role)}</span>
              </span>
              <select className={STATUS_CLASS} value={row.status} onChange={(e) => set(m.id, { status: e.target.value as AttendanceStatus })} aria-label={`Status for ${m.full_name}`}>
                {STATUSES.map((s) => <option key={s} value={s}>{ATTENDANCE_META[s].label}</option>)}
              </select>
              {here && (
                <>
                  <input type="time" className={STATUS_CLASS} value={row.arrival_time} onChange={(e) => set(m.id, { arrival_time: e.target.value })} aria-label={`Arrival for ${m.full_name}`} />
                  <input type="time" className={STATUS_CLASS} value={row.departure_time} onChange={(e) => set(m.id, { departure_time: e.target.value })} aria-label={`Departure for ${m.full_name}`} />
                </>
              )}
            </li>
          )
        })}
      </ul>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{presentCount} of {members.length} attended</p>
        <Button type="submit" size="sm" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />} Save attendance
        </Button>
      </div>
    </form>
  )
}
