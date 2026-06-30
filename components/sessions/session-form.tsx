'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Loader2 } from 'lucide-react'
import { createSession, updateSession, type SessionActionState } from '@/actions/sessions'
import { SESSION_TYPE_META, SESSION_TYPE_FIELD } from '@/lib/constants/sessions'
import type { SessionRow, SessionType } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const SELECT_CLASS =
  'border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30'

const TYPES = Object.entries(SESSION_TYPE_META) as [SessionType, { label: string; blurb: string }][]

interface SessionFormProps {
  mode: 'create' | 'edit'
  session?: SessionRow
  schools: { id: string; name: string; district: string }[]
  cancelHref: string
}

export function SessionForm({ mode, session, schools, cancelHref }: SessionFormProps) {
  const isEdit = mode === 'edit'
  const [state, action, pending] = useActionState<SessionActionState, FormData>(
    isEdit ? updateSession : createSession,
    {},
  )
  const [type, setType] = useState<SessionType>(session?.session_type ?? 'awareness')
  const field = SESSION_TYPE_FIELD[type]
  const existingDetail = (session?.type_details?.[field.key] as string | undefined) ?? ''

  return (
    <form action={action} className="space-y-6" noValidate>
      {isEdit && <input type="hidden" name="id" value={session!.id} />}

      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}
      {state.ok && state.message && (
        <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{state.message}</p>
      )}

      <Section title="Plan">
        <Field label="School" required className="sm:col-span-2">
          <select name="school_id" required className={SELECT_CLASS} defaultValue={session?.school_id ?? ''}>
            <option value="">— Select school —</option>
            {schools.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.district}</option>)}
          </select>
        </Field>
        <Field label="Session type" required>
          <select name="session_type" required className={SELECT_CLASS} value={type} onChange={(e) => setType(e.target.value as SessionType)}>
            {TYPES.map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">{SESSION_TYPE_META[type].blurb}</p>
        </Field>
        <Field label="Date" required>
          <Input type="date" name="date" required defaultValue={session?.date ?? ''} />
        </Field>
        <Field label="Start time">
          <Input type="time" name="start_time" defaultValue={session?.start_time?.slice(0, 5) ?? ''} />
        </Field>
        <Field label="End time">
          <Input type="time" name="end_time" defaultValue={session?.end_time?.slice(0, 5) ?? ''} />
        </Field>
        <Field label="Topic" required className="sm:col-span-2">
          <Input name="topic" required defaultValue={session?.topic ?? ''} placeholder="What this session covers" />
        </Field>
      </Section>

      {isEdit && (
        <Section title="Report">
          <Field label="Students present">
            <Input type="number" name="student_count" min={0} defaultValue={session?.student_count ?? ''} />
          </Field>
          <Field label="Volunteers present">
            <Input type="number" name="volunteer_count" min={0} defaultValue={session?.volunteer_count ?? ''} />
            <p className="mt-1 text-xs text-muted-foreground">Auto-set from attendance when you save the roster.</p>
          </Field>
          <Field label={field.label} className="sm:col-span-2">
            <Textarea name="type_detail" rows={2} defaultValue={existingDetail} placeholder={field.placeholder} />
          </Field>
          <Field label="What happened" className="sm:col-span-2">
            <Textarea name="notes" rows={3} defaultValue={session?.notes ?? ''} placeholder="Session narrative" />
          </Field>
          <Field label="Challenges">
            <Textarea name="challenges" rows={2} defaultValue={session?.challenges ?? ''} />
          </Field>
          <Field label="Next steps">
            <Textarea name="next_steps" rows={2} defaultValue={session?.next_steps ?? ''} />
          </Field>
          <Field label="Improvement notes" className="sm:col-span-2">
            <Textarea name="improvement_notes" rows={2} defaultValue={session?.improvement_notes ?? ''} />
          </Field>
        </Section>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? 'Save session' : 'Plan session'}
        </Button>
        <Button asChild variant="ghost"><Link href={cancelHref}>Cancel</Link></Button>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-border p-4">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

function Field({ label, required, className, children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label>{label} {required && <span className="text-error">*</span>}</Label>
      {children}
    </div>
  )
}
